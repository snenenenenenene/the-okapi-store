import Stripe from "stripe";

const PRINTFUL_API_URL = "https://api.printful.com";
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;

interface CartItem {
  id: string | number;
  variant_id: string | number;
  quantity: number;
  size?: string;
  name?: string;
  price?: number;
}

async function fetchPrintfulProduct(productId: string | number) {
  console.log("Fetching Printful product:", productId);

  const response = await fetch(
    `${PRINTFUL_API_URL}/store/products/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${PRINTFUL_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Printful product ${productId}`);
  }

  const data = await response.json();
  console.log("Printful product data:", JSON.stringify(data.result, null, 2));
  return data.result;
}

async function validateAndGetPrintfulVariant(
  productId: string | number,
  cartItem: CartItem
) {
  const printfulProduct = await fetchPrintfulProduct(productId);

  // Find the matching variant
  const variant = printfulProduct.sync_variants.find((v: any) => {
    // If we have a size, match on that too
    if (cartItem.size) {
      return v.name.includes(cartItem.size);
    }
    // Otherwise just match on variant_id
    return v.id === parseInt(cartItem.variant_id.toString());
  });

  if (!variant) {
    console.error("No matching variant found:", {
      productId,
      cartItem,
      availableVariants: printfulProduct.sync_variants.map((v: any) => ({
        id: v.id,
        name: v.name,
      })),
    });
    throw new Error(`No matching variant found for product ${productId}`);
  }

  // Check availability
  if (variant.availability_status !== "active") {
    console.log("Variant not available:", variant);
    throw new Error(`Product variant ${variant.id} is not available`);
  }

  // Verify price matches (optional)
  if (
    cartItem.price &&
    Math.abs(parseFloat(variant.retail_price) - cartItem.price) > 0.01
  ) {
    console.warn("Price mismatch:", {
      cartPrice: cartItem.price,
      printfulPrice: variant.retail_price,
    });
  }

  return variant;
}

export async function createPrintfulOrder(
  charge: Stripe.Charge,
  paymentIntent: Stripe.PaymentIntent,
  session?: Stripe.Checkout.Session | null
) {
  console.log("=== Starting Printful Order Creation ===");
  console.log("Charge:", JSON.stringify(charge, null, 2));

  const shippingDetails =
    charge.shipping?.address ||
    paymentIntent.shipping?.address ||
    session?.shipping_details?.address;
  if (!shippingDetails) {
    throw new Error("No shipping details found");
  }

  // Get cart items from metadata
  let cartItems: CartItem[] = [];
  try {
    const metadataItems =
      charge.metadata?.items ||
      paymentIntent.metadata?.items ||
      session?.metadata?.items;
    cartItems = JSON.parse(metadataItems || "[]");
    console.log("Parsed cart items:", cartItems);
  } catch (error) {
    console.error("Error parsing cart items:", error);
    throw new Error("Failed to parse cart items");
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("No items found in cart");
  }

  // Validate and get Printful variants for each item
  const printfulItems = await Promise.all(
    cartItems.map(async (item) => {
      console.log("Validating item:", item);
      const validatedVariant = await validateAndGetPrintfulVariant(
        item.id,
        item
      );

      return {
        sync_variant_id: validatedVariant.id,
        quantity: item.quantity,
        retail_price: validatedVariant.retail_price,
      };
    })
  );

  const printfulOrderData = {
    external_id: paymentIntent.id,
    shipping: "STANDARD",
    recipient: {
      name:
        charge.shipping?.name ||
        paymentIntent.shipping?.name ||
        session?.shipping_details?.name ||
        "",
      address1: shippingDetails.line1 || "",
      address2: shippingDetails.line2 || "",
      city: shippingDetails.city || "",
      state_code: shippingDetails.state || "",
      country_code: shippingDetails.country || "",
      zip: shippingDetails.postal_code || "",
      email: charge.billing_details.email || paymentIntent.receipt_email || "",
    },
    items: printfulItems,
    retail_costs: {
      currency: charge.currency.toUpperCase(),
      subtotal: (charge.amount / 100).toFixed(2),
      discount: "0.00",
      shipping: "5.00",
      tax: "0.00",
    },
  };

  console.log("=== Printful Order Data ===");
  console.log(JSON.stringify(printfulOrderData, null, 2));

  // Create the order
  const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PRINTFUL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(printfulOrderData),
  });

  const responseData = await response.json();
  console.log("Printful API Response:", JSON.stringify(responseData, null, 2));

  if (!response.ok) {
    console.error("Failed to create Printful order:", responseData);
    throw new Error(
      `Failed to create Printful order: ${JSON.stringify(responseData)}`
    );
  }

  return responseData;
}

export async function getAvailableVariants(productId: string | number) {
  const product = await fetchPrintfulProduct(productId);
  return product.sync_variants.map((variant: any) => ({
    id: variant.id,
    name: variant.name,
    retail_price: variant.retail_price,
    availability_status: variant.availability_status,
  }));
}
