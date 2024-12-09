/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

async function fetchPrintfulOrder(orderId: string) {
  // For Stripe payment IDs, add @ prefix if not present and ensure # is included
  let printfulId = orderId;
  if (orderId.startsWith("pi_")) {
    // If it's a Stripe payment ID, ensure it has the @ prefix
    // printfulId = orderId.startsWith("@") ? orderId : `@${orderId}`;
    // Add the # before the ID for external ID lookup
    printfulId = `#${printfulId}`;
  }

  
  

  try {
    const response = await fetch(`${PRINTFUL_API_URL}/orders/${printfulId}`, {
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
    

    if (!data.result) {
      
      return null;
    }

    const result = data.result;

    return {
      status: result[0].status,
      created: result[0].created,
      updated: result[0].updated,
      shipping_service_name: result[0].shipping_service_name,
      estimated_delivery: result[0].estimated_delivery || result[0].ship_date,
      recipient: {
        name: result[0].recipient?.name || "",
        address1: result[0].recipient?.address1 || "",
        address2: result[0].recipient?.address2 || "",
        city: result[0].recipient?.city || "",
        state_name: result[0].recipient?.state_name || "",
        country_name: result[0].recipient?.country_name || "",
        zip: result[0].recipient?.zip || "",
      },
      items: (result[0].items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        status: item.status || "pending",
        retail_price: item.retail_price,
      })),
      retail_costs: result[0].retail_costs || {
        currency: "EUR",
        subtotal: "0.00",
        discount: "0.00",
        shipping: "0.00",
        tax: "0.00",
        vat: "0.00",
        total: "0.00"
      },
      costs: result[0].costs || {
        subtotal: "0.00",
        shipping: "0.00",
        tax: "0.00",
        total: "0.00",
      },
      shipments: (result[0].shipments || []).map((shipment: any) => ({
        carrier: shipment.carrier,
        service: shipment.service,
        tracking_number: shipment.tracking_number,
        tracking_url: shipment.tracking_url,
        ship_date: shipment.ship_date,
        shipped_at: shipment.shipped_at
          ? new Date(shipment.shipped_at * 1000).toISOString()
          : null,
        estimated_delivery: shipment.estimated_delivery_date,
        status: shipment.status,
      })),
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

    

    let printfulDetails = null;
    if (order.stripePaymentId) {
      
      printfulDetails = await fetchPrintfulOrder(order.stripePaymentId);
    }

    

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
