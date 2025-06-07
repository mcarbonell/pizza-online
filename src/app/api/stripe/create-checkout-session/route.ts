
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type { CartItem, ShippingAddressDetails } from '@/lib/types';

// Ensure this path is correct for your project structure
// import { absoluteUrl } from '@/lib/utils'; // If you have a helper for absolute URLs

// Function to get base URL (adapt as needed, Vercel provides NEXT_PUBLIC_VERCEL_URL)
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  // Fallback for local development
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';
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
        currency: 'usd', // Or your desired currency
        product_data: {
          name: item.name,
          images: [item.imageUrl], // Stripe expects an array of image URLs
          description: item.description,
        },
        unit_amount: Math.round(item.price * 100), // Price in cents
      },
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
        shippingAddress: JSON.stringify(shippingAddress), // Store shipping address for webhook
        cartItems: JSON.stringify(items.map(item => ({id: item.id, quantity: item.quantity, price: item.price }))) // Store cart item details for webhook
      },
      // You can also pass customer_email if you have it
      // customer_email: shippingAddress.email, // If you want Stripe to prefill email
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}
