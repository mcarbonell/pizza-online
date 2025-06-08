
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type { CartItem, ShippingAddressDetails, ExtraItem } from '@/lib/types';

// Function to get base URL
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    if (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http://') || process.env.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
        return process.env.NEXT_PUBLIC_SITE_URL;
    }
    return `https://${process.env.NEXT_PUBLIC_SITE_URL}`;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return 'http://localhost:9002';
};


export async function POST(req: NextRequest) {
  try {
    const { items, userId, shippingAddress } = (await req.json()) as { 
      items: CartItem[]; // CartItem now includes selectedExtras and cartItemId
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

    const line_items = items.map((item) => {
      const extrasPrice = item.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
      const unitPriceWithExtras = item.price + extrasPrice;
      
      let productName = item.name;
      let productDescription = item.description;

      if (item.selectedExtras && item.selectedExtras.length > 0) {
        const extrasNames = item.selectedExtras.map(ex => ex.name).join(', ');
        productName += ` (Extras: ${extrasNames})`;
        // You could also add extras to description if desired, carefully managing length
        // productDescription += ` \nExtras: ${extrasNames}`;
      }

      return {
        price_data: {
          currency: 'eur', 
          product_data: {
            name: productName,
            images: [item.imageUrl],
            description: productDescription, // Keep original or append extras if space allows
          },
          unit_amount: Math.round(unitPriceWithExtras * 100), // Price in cents, including extras
        },
        quantity: item.quantity,
      };
    });

    // Simplify cart items for metadata, now including selectedExtras
    const simplifiedCartItemsForMetadata = items.map(item => ({
      id: item.id, // Original product ID
      cartItemId: item.cartItemId, // Unique ID for this cart instance (product + extras)
      quantity: item.quantity,
      selectedExtras: item.selectedExtras || [], // Ensure it's an array
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
        // cartItems metadata is crucial for webhook to reconstruct the order with extras
        cartItems: JSON.stringify(simplifiedCartItemsForMetadata) 
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    if (error.type === 'StripeInvalidRequestError' && error.message) {
        return NextResponse.json({ error: `Stripe Error: ${error.message}` }, { status: error.statusCode || 500 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}
