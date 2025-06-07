
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type { CartItem, ShippingAddressDetails } from '@/lib/types';

// Function to get base URL
const getBaseUrl = () => {
  // 1. Use NEXT_PUBLIC_SITE_URL if explicitly set (ideal for Cloud Workstations, Gitpod, etc.)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    // Ensure it starts with http:// or https://
    if (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http://') || process.env.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
        return process.env.NEXT_PUBLIC_SITE_URL;
    }
    // Default to https if no protocol is provided, common for bare domains in env vars
    return `https://${process.env.NEXT_PUBLIC_SITE_URL}`;
  }
  // 2. Use Vercel's provided URL if deploying on Vercel
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  // 3. Fallback for local development (typically http://localhost:PORT)
  return 'http://localhost:9002'; // Default to your local dev port
};


export async function POST(req: NextRequest) {
  try {
    const { items, userId, shippingAddress } = (await req.json()) as { 
      items: CartItem[]; 
      userId: string;
      shippingAddress: ShippingAddressDetails;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!shippingAddress) {
        return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }
    

    const baseUrl = getBaseUrl();
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout/cancel`;

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur', // Changed currency to EUR
        product_data: {
          name: item.name,
          images: [item.imageUrl], // Stripe expects an array of image URLs
          description: item.description,
        },
        unit_amount: Math.round(item.price * 100), // Price in cents
      },
      quantity: item.quantity,
    }));

    // Simplify cart items for metadata to avoid exceeding 500 char limit
    const simplifiedCartItems = items.map(item => ({
      id: item.id,
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        shippingAddress: JSON.stringify(shippingAddress),
        cartItems: JSON.stringify(simplifiedCartItems) // Store simplified cart item details
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    // Check if the error is from Stripe and has a specific message
    if (error.type === 'StripeInvalidRequestError' && error.message) {
        return NextResponse.json({ error: `Stripe Error: ${error.message}` }, { status: error.statusCode || 500 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}

