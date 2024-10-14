// app/api/printful/products/[id]/route.ts
import { NextResponse } from 'next/server'

const PRINTFUL_API_URL = 'https://api.printful.com'
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${PRINTFUL_API_URL}/store/products/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch product from Printful')
    }

    const json = await response.json()
    const product_data = json.result
    console.log(product_data)

    const product = {
      id: product_data.sync_product.id,
      name: product_data.sync_product.name,
      variants: product_data.sync_variants.map((variant: any) => ({
        id: variant.id,
        name: variant.name,
        price: variant.retail_price,
        size: variant.size,
        currency: variant.currency,
        availability_status: variant.availability_status,
        thumbnailUrl: variant.files.find((file: any) => file.type === 'preview')?.thumbnail_url || null,
        previewUrl: variant.files.find((file: any) => file.type === 'preview')?.preview_url || null
      }))
    };

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product from Printful:', error)
    return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 })
  }
}