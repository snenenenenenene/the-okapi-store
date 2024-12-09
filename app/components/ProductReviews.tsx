'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  email: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        setReviews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (isLoading) {
    return <div className="animate-pulse">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-gray-500 italic">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              className={`w-5 h-5 ${
                value <= averageRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-medium">
          {averageRating.toFixed(1)} out of 5
        </span>
        <span className="text-gray-500">
          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">
                    {review.email[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium">{review.email}</p>
                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`w-4 h-4 ${
                    value <= review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>

            {review.title && (
              <h4 className="font-medium mb-2">{review.title}</h4>
            )}
            <p className="text-gray-700">{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
