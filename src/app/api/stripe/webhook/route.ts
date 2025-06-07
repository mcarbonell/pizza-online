
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe'; // Backend Stripe instance
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import type { CartItem, ShippingAddressDetails, Order, PaymentDetails } from '@/lib/types';
import type Stripe from 'stripe';

// Ensure environment variable is loaded
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable Next.js body parsing for this route, as Stripe needs the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  const rawBodyBuffer = await req.arrayBuffer();
  const rawBody = Buffer.from(rawBodyBuffer).toString('utf8');
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed:', session.id);

      // --- Idempotency Check (simple version) ---
      // To prevent creating duplicate orders if Stripe sends the event multiple times.
      // More robust checks might involve a dedicated 'processed_events' collection.
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('paymentDetails.stripePaymentIntentId', '==', session.payment_intent));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log(`Order for session ${session.id} (PaymentIntent: ${session.payment_intent}) already processed.`);
        return NextResponse.json({ received: true, message: 'Order already processed.' }, { status: 200 });
      }
      // --- End Idempotency Check ---
      
      const userId = session.metadata?.userId;
      const cartItemsString = session.metadata?.cartItems;
      const shippingAddressString = session.metadata?.shippingAddress;

      if (!userId || !cartItemsString || !shippingAddressString) {
        console.error('Missing metadata in Stripe session:', session.id);
        return NextResponse.json({ error: 'Missing metadata in session.' }, { status: 400 });
      }

      try {
        const items = JSON.parse(cartItemsString) as CartItem[]; // These are simplified CartItems
        const shippingAddress = JSON.parse(shippingAddressString) as ShippingAddressDetails;

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const paymentDetails: PaymentDetails = {
          stripePaymentIntentId: session.payment_intent as string,
        };

        const newOrder: Omit<Order, 'id'> = {
          userId,
          items, // Make sure these items have all necessary fields from CartItem type if needed later
          totalAmount,
          shippingAddress,
          paymentDetails,
          status: 'Pending', // Or 'Processing'
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'orders'), newOrder);
        console.log('Order created with ID:', docRef.id, "for Stripe session:", session.id);

        // Here you might also:
        // - Send a confirmation email to the user
        // - Clear the user's cart (if not handled on client-side, or for robustness)
        // - Update inventory, etc.

      } catch (parseError: any) {
        console.error('Error parsing metadata or creating order:', parseError);
        return NextResponse.json({ error: `Error processing order: ${parseError.message}` }, { status: 500 });
      }
      break;
    
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntentSucceeded.id);
      // Handle successful payment intent if needed, e.g., update order status if not already done by checkout.session.completed
      // Note: checkout.session.completed usually fires when payment is confirmed.
      break;

    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      console.warn('PaymentIntent failed:', paymentIntentFailed.id, 'Reason:', paymentIntentFailed.last_payment_error?.message);
      // Handle failed payment intent, e.g., update order status to 'PaymentFailed', notify user.
      // You might want to find the order associated with this payment_intent_id and update its status.
      break;
      
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
