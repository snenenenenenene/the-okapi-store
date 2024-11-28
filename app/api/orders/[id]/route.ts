/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

async function fetchPrintfulOrder(orderId: string) {
  const printfulId =
    !orderId.startsWith("@") && orderId.length > 30 ? `@${orderId}` : orderId;
  console.log("Fetching Printful order with ID:", printfulId);

  try {
    const response = await fetch(`${PRINTFUL_API_URL}/orders/#${printfulId}`, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Printful API error:", errorText);
      return null;
    }

    const data = await response.json();
    console.log("FULL PRINTFUL RESPONSE:", JSON.stringify(data, null, 2));
    console.log("PRINTFUL RESULT ONLY:", JSON.stringify(data.result, null, 2));
    console.log("meow", `${PRINTFUL_API_URL}/orders/#${printfulId}`);

    if (!data.result) {
      console.log("No result in Printful response");
      return null;
    }

    const result = data.result;
    console.log(
      "PRINTFUL RESULT ITEMS:",
      JSON.stringify(result.items, null, 2)
    );
    console.log(
      "PRINTFUL RESULT COSTS:",
      JSON.stringify(result.costs, null, 2)
    );
    console.log(
      "PRINTFUL RESULT SHIPMENTS:",
      JSON.stringify(result.shipments, null, 2)
    );

    // Map the response according to the Printful API structure
    return {
      id: result.id,
      external_id: result.external_id,
      status: result.status,
      shipping: result.shipping,
      shipping_service_name: result.shipping_service_name,
      created: result.created,
      updated: result.updated,
      recipient: {
        name: result.recipient?.name || "",
        company: result.recipient?.company || "",
        address1: result.recipient?.address1 || "",
        address2: result.recipient?.address2 || "",
        city: result.recipient?.city || "",
        state_code: result.recipient?.state_code || "",
        state_name: result.recipient?.state_name || "",
        country_code: result.recipient?.country_code || "",
        country_name: result.recipient?.country_name || "",
        zip: result.recipient?.zip || "",
        phone: result.recipient?.phone || "",
        email: result.recipient?.email || "",
      },
      items: (result.items || []).map((item: any) => ({
        id: item.id,
        external_id: item.external_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
        retail_price: item.retail_price,
        name: item.name,
        product: {
          variant_id: item.product?.variant_id,
          product_id: item.product?.product_id,
          image: item.product?.image,
          name: item.product?.name,
        },
      })),
      costs: result.costs || {
        currency: "USD",
        subtotal: "0.00",
        discount: "0.00",
        shipping: "0.00",
        tax: "0.00",
        total: "0.00",
      },
      retail_costs: result.retail_costs || {
        currency: "USD",
        subtotal: "0.00",
        discount: "0.00",
        shipping: "0.00",
        tax: "0.00",
        total: "0.00",
      },
      shipments: (result.shipments || []).map((shipment: any) => ({
        id: shipment.id,
        carrier: shipment.carrier,
        service: shipment.service,
        tracking_number: shipment.tracking_number,
        tracking_url: shipment.tracking_url,
        created: shipment.created,
        ship_date: shipment.ship_date,
        shipped_at: shipment.shipped_at,
        reshipment: shipment.reshipment,
        items: shipment.items,
      })),
      gift: result.gift || null,
      packing_slip: result.packing_slip || null,
    };
  } catch (error) {
    console.error("Error fetching Printful order:", error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Fetching order:", params.id);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        associations: {
          include: {
            user: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("PRISMA ORDER:", JSON.stringify(order, null, 2));

    let printfulDetails = null;
    if (order.printfulId) {
      console.log("Using Printful ID:", order.printfulId);
      printfulDetails = await fetchPrintfulOrder(order.printfulId);
    } else if (order.stripePaymentId) {
      console.log("Using Stripe Payment ID:", order.stripePaymentId);
      printfulDetails = await fetchPrintfulOrder(order.stripePaymentId);
    }

    console.log(
      "FINAL PRINTFUL DETAILS:",
      JSON.stringify(printfulDetails, null, 2)
    );

    return NextResponse.json({
      ...order,
      printfulDetails,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error fetching order details" },
      { status: 500 }
    );
  }
}
