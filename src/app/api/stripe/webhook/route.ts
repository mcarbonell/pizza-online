
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe'; // Backend Stripe instance
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { ShippingAddressDetails, Order, PaymentDetails, Product, SimplifiedCartItem, OrderItem, ExtraItem } from '@/lib/types';
import type Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SimplifiedCartItemWithExtras extends SimplifiedCartItem {
  selectedExtras?: ExtraItem[];
  // cartItemId is also present in metadata for logging/tracing if needed
}

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
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('paymentDetails.stripePaymentIntentId', '==', session.payment_intent));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log(`Order for session ${session.id} (PaymentIntent: ${session.payment_intent}) already processed.`);
          return NextResponse.json({ received: true, message: 'Order already processed.' }, { status: 200 });
        }

        const simplifiedCartItems = JSON.parse(simplifiedCartItemsString) as SimplifiedCartItemWithExtras[];
        const shippingAddress = JSON.parse(shippingAddressString) as ShippingAddressDetails;
        
        const fullOrderItems: OrderItem[] = [];
        let calculatedTotalAmount = 0;

        for (const simplifiedItem of simplifiedCartItems) {
          const productRef = doc(db, 'products', simplifiedItem.id); // simplifiedItem.id is the original product ID
          const productSnap = await getDoc(productRef);

          if (!productSnap.exists()) {
            console.error(`Product with ID ${simplifiedItem.id} not found in Firestore.`);
            throw new Error(`Product ID ${simplifiedItem.id} not found. Order creation failed.`);
          }
          const productData = productSnap.data() as Omit<Product, 'id'>; // Base product data
          
          const extrasPrice = simplifiedItem.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
          const unitPriceWithExtras = productData.price + extrasPrice;

          fullOrderItems.push({
            productId: simplifiedItem.id, // Store the original product ID
            name: productData.name,
            description: productData.description,
            price: productData.price, // Base price of the product
            imageUrl: productData.imageUrl,
            category: productData.category,
            dataAiHint: productData.dataAiHint,
            quantity: simplifiedItem.quantity,
            selectedExtras: simplifiedItem.selectedExtras || [],
            unitPriceWithExtras: unitPriceWithExtras, // Store the calculated unit price including extras
          });
          calculatedTotalAmount += unitPriceWithExtras * simplifiedItem.quantity;
        }

        // Verify Stripe's total with calculated total (optional, for sanity check)
        const stripeTotal = session.amount_total ? session.amount_total / 100 : 0;
        if (Math.abs(calculatedTotalAmount - stripeTotal) > 0.01) { // Allow for small floating point discrepancies
          console.warn(`Mismatch between calculated total (€${calculatedTotalAmount.toFixed(2)}) and Stripe total (€${stripeTotal.toFixed(2)}) for session ${session.id}. Using Stripe total.`);
          // Potentially use stripeTotal for the order if there's a discrepancy,
          // or log for investigation. For now, we'll use our calculated total
          // but it's good to be aware of this.
        }

        const paymentDetails: PaymentDetails = {
          stripePaymentIntentId: session.payment_intent as string,
        };

        const newOrder: Omit<Order, 'id'> = {
          userId,
          items: fullOrderItems,
          totalAmount: calculatedTotalAmount, // Use the recalculated total, or session.amount_total / 100
          shippingAddress,
          paymentDetails,
          status: 'Pending', 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
