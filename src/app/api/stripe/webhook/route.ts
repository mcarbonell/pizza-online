
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe'; // Backend Stripe instance
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { ShippingAddressDetails, Order, PaymentDetails, Product, SimplifiedCartItem, CartItem } from '@/lib/types';
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
      
      const userId = session.metadata?.userId;
      const simplifiedCartItemsString = session.metadata?.cartItems;
      const shippingAddressString = session.metadata?.shippingAddress;

      if (!userId || !simplifiedCartItemsString || !shippingAddressString) {
        console.error('Missing metadata in Stripe session:', session.id, {userId, simplifiedCartItemsString, shippingAddressString});
        return NextResponse.json({ error: 'Missing metadata in session.' }, { status: 400 });
      }

      try {
        // --- Idempotency Check ---
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('paymentDetails.stripePaymentIntentId', '==', session.payment_intent));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log(`Order for session ${session.id} (PaymentIntent: ${session.payment_intent}) already processed.`);
          return NextResponse.json({ received: true, message: 'Order already processed.' }, { status: 200 });
        }
        // --- End Idempotency Check ---

        const simplifiedCartItems = JSON.parse(simplifiedCartItemsString) as SimplifiedCartItem[];
        const shippingAddress = JSON.parse(shippingAddressString) as ShippingAddressDetails;
        
        const fullOrderItems: CartItem[] = [];
        let calculatedTotalAmount = 0;

        for (const simplifiedItem of simplifiedCartItems) {
          const productRef = doc(db, 'products', simplifiedItem.id);
          const productSnap = await getDoc(productRef);

          if (!productSnap.exists()) {
            console.error(`Product with ID ${simplifiedItem.id} not found in Firestore.`);
            // Potentially skip this item or fail the order creation
            // For now, we'll throw an error to indicate a data integrity issue
            throw new Error(`Product ID ${simplifiedItem.id} not found. Order creation failed.`);
          }
          const productData = productSnap.data() as Product;
          
          fullOrderItems.push({
            ...productData, // Spread all fields from the Product type
            id: simplifiedItem.id, // Ensure ID is from simplifiedItem (should match productSnap.id)
            quantity: simplifiedItem.quantity,
          });
          calculatedTotalAmount += productData.price * simplifiedItem.quantity;
        }


        const paymentDetails: PaymentDetails = {
          stripePaymentIntentId: session.payment_intent as string,
        };

        const newOrder: Omit<Order, 'id'> = {
          userId,
          items: fullOrderItems,
          totalAmount: calculatedTotalAmount, // Use the recalculated total
          shippingAddress,
          paymentDetails,
          status: 'Pending', 
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'orders'), newOrder);
        console.log('Order created with ID:', docRef.id, "for Stripe session:", session.id);

      } catch (processError: any) {
        console.error('Error processing order from webhook or fetching product details:', processError);
        return NextResponse.json({ error: `Error processing order: ${processError.message}` }, { status: 500 });
      }
      break;
    
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntentSucceeded.id);
      break;

    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      console.warn('PaymentIntent failed:', paymentIntentFailed.id, 'Reason:', paymentIntentFailed.last_payment_error?.message);
      // You might want to find the order associated with this payment_intent_id and update its status.
      // Example:
      // const orderQuery = query(collection(db, 'orders'), where('paymentDetails.stripePaymentIntentId', '==', paymentIntentFailed.id));
      // const orderSnapshot = await getDocs(orderQuery);
      // if (!orderSnapshot.empty) {
      //   const orderDoc = orderSnapshot.docs[0];
      //   await updateDoc(doc(db, 'orders', orderDoc.id), { status: 'PaymentFailed', updatedAt: serverTimestamp() });
      //   console.log(`Order ${orderDoc.id} status updated to PaymentFailed.`);
      // }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
