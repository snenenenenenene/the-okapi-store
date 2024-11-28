/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

async function fetchPrintfulOrder(orderId: string) {
  // Add @ prefix if it's a stripe payment ID and doesn't already have it
  const printfulId =
    !orderId.startsWith("@") && orderId.length > 30 ? `@${orderId}` : orderId;

  console.log("Fetching Printful order with ID:", printfulId);

  const response = await fetch(`${PRINTFUL_API_URL}/orders/#${printfulId}`, {
    headers: {
      Authorization: `Bearer ${PRINTFUL_TOKEN}`,
    },
  });

  if (!response.ok) {
    console.error("Printful API error:", await response.text());
    return null;
  }

  const data = await response.json();
  const result = data.result;

  return {
    status: result.status,
    created: new Date(result.created * 1000).toISOString(),
    updated: new Date(result.updated * 1000).toISOString(),
    shipping_service: result.shipping_service_name,
    estimated_delivery: result.ship_date,
    recipient: {
      name: result.recipient.name,
      address1: result.recipient.address1,
      address2: result.recipient.address2,
      city: result.recipient.city,
      state: result.recipient.state_name,
      country: result.recipient.country_name,
      zip: result.recipient.zip,
    },
    items: result.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      status: item.status,
      retail_price: item.retail_price,
    })),
    costs: {
      subtotal: result.retail_costs.subtotal,
      shipping: result.retail_costs.shipping,
      tax: result.retail_costs.tax,
      total: result.retail_costs.total,
    },
    shipments:
      result.shipments?.map((shipment: any) => ({
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
      })) || [],
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    console.log("Fetching order:", orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    // Get Printful order details
    let printfulDetails: any = null;
    if (order.printfulId) {
      printfulDetails = await fetchPrintfulOrder(order.printfulId);
    } else if (order.stripePaymentId) {
      printfulDetails = await fetchPrintfulOrder(order.stripePaymentId);
      console.log(order.stripePaymentId);
      console.log(printfulDetails);
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
