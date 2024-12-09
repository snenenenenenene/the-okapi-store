import prisma from "@/lib/prisma";
import ReviewForm from "./ReviewForm";
import { redirect } from "next/navigation";

interface ReviewPageProps {
  params: {
    orderId: string;
    productId: string;
    variantId: string;
  };
  searchParams: {
    email?: string;
  };
}

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
  const email = searchParams.email;
  
  if (!email) {
    redirect("/");
  }

  // Verify the order belongs to the email and hasn't been reviewed yet
  const order = await prisma.order.findUnique({
    where: {
      id: params.orderId,
      email: email,
    },
    include: {
      reviews: {
        where: {
          productId: params.productId,
          variantId: params.variantId,
        },
      },
    },
  });

  if (!order) {
    redirect("/");
  }

  if (order.reviews.length > 0) {
    redirect(`/products/${params.productId}`);
  }

  // Find the product details from the order items
  const orderItem = order.items.find(
    (item: any) =>
      item.id === params.productId && item.variant_id === params.variantId
  );

  if (!orderItem) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Write a Review</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={orderItem.image}
              alt={orderItem.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <h2 className="font-semibold">{orderItem.name}</h2>
              <p className="text-gray-600">Size: {orderItem.size}</p>
            </div>
          </div>
          
          <ReviewForm
            email={email}
            orderId={params.orderId}
            productId={params.productId}
            variantId={params.variantId}
          />
        </div>
      </div>
    </div>
  );
}
