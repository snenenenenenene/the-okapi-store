// app/api/orders/lookup/route.ts
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

// Helper to create a secure token from order ID and email
function createOrderToken(orderId: string, email: string): string {
  const hmac = crypto.createHmac("sha256", process.env.AUTH_SECRET || "");
  hmac.update(`${orderId}:${email.toLowerCase()}`);
  return hmac.digest("hex");
}

// Verify an order token
function verifyOrderToken(
  token: string,
  orderId: string,
  email: string
): boolean {
  const expectedToken = createOrderToken(orderId, email);
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

// Fetch Printful order details
async function fetchPrintfulOrder(printfulId: string) {
  const response = await fetch(`${PRINTFUL_API_URL}/orders/${printfulId}`, {
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

  // Extract only the useful order information
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

// POST endpoint for initial order lookup
export async function POST(req: Request) {
  try {
    const { email, orderId } = await req.json();

    if (!email || !orderId) {
      return NextResponse.json(
        { error: "Email and order ID are required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          {
            associations: {
              some: {
                user: {
                  email: email,
                },
              },
            },
          },
          {
            user: {
              email: email,
            },
          },
        ],
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found for this email" },
        { status: 404 }
      );
    }

    // Get Printful order details if available
    let printfulOrder = null;
    if (order.printfulId) {
      printfulOrder = await fetchPrintfulOrder(order.printfulId);
    }

    // Create a secure token for this order
    const token = createOrderToken(orderId, email);

    return NextResponse.json({
      order: {
        ...order,
        printfulDetails: printfulOrder,
      },
      token,
    });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup order" },
      { status: 500 }
    );
  }
}

// GET endpoint for token-based lookup
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const orderId = searchParams.get("orderId");
    const email = searchParams.get("email");

    if (!token || !orderId || !email) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify the token
    if (!verifyOrderToken(token, orderId, email)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

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

    // Get Printful order details if available
    let printfulOrder = null;
    if (order.printfulId) {
      printfulOrder = await fetchPrintfulOrder(order.printfulId);
    }

    return NextResponse.json({
      order: {
        ...order,
        printfulDetails: printfulOrder,
      },
    });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup order" },
      { status: 500 }
    );
  }
}
