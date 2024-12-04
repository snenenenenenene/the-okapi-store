import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.printful.com/store/products', {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await res.json();
    return NextResponse.json(data.result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
