import { useState, useEffect } from 'react';

export function useProducts() {
  const [products, setProducts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Only fetch once when component mounts
  useEffect(() => {
    // If we already have products, don't fetch again
    if (products) return;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/printful/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  // Manual refresh function
  const refresh = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/printful/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    isLoading,
    error,
    refresh // Expose refresh function for manual updates
  };
}
