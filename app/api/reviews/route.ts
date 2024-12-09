import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(10),
  email: z.string().email(),
  productId: z.string(),
  variantId: z.string(),
  orderId: z.string(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = reviewSchema.parse(json);

    // Verify that the email matches the order
    const order = await prisma.order.findUnique({
      where: {
        id: body.orderId,
        email: body.email,
      },
      include: {
        reviews: {
          where: {
            productId: body.productId,
            variantId: body.variantId,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if this product has already been reviewed from this order
    if (order.reviews.length > 0) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating: body.rating,
        title: body.title,
        content: body.content,
        email: body.email,
        productId: body.productId,
        variantId: body.variantId,
        orderId: body.orderId,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
      },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the reviews to protect email privacy
    const transformedReviews = reviews.map(review => ({
      ...review,
      email: review.email.split('@')[0] + '@***', // Hide email domain
    }));

    return NextResponse.json(transformedReviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
