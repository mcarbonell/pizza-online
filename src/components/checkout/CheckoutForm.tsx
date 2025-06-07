
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, User as UserIcon, Mail, Home, Phone } from 'lucide-react'; // Renamed User to UserIcon
import { db } from "@/lib/firebase"; // Import Firestore instance
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore functions
import type { OrderDetails as OrderDetailsType, PaymentDetails, Order } from "@/lib/types";


const addressSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  postalCode: z.string().min(3, { message: "Postal code is too short." }),
});

const paymentSchema = z.object({
  cardNumber: z.string()
    .min(13, { message: "Card number must be between 13 and 19 digits." })
    .max(19, { message: "Card number must be between 13 and 19 digits." })
    .regex(/^\d+$/, { message: "Card number must contain only digits." }),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Expiry date must be in MM/YY format." }),
  cvv: z.string().min(3, { message: "CVV must be 3 or 4 digits." }).max(4, { message: "CVV must be 3 or 4 digits." })
    .regex(/^\d+$/, { message: "CVV must contain only digits." }),
});

const checkoutFormSchema = addressSchema.merge(paymentSchema);

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutForm() {
  const { user } = useAuth(); // Get current user
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  async function onSubmit(data: CheckoutFormValues) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      router.push('/login?redirect=/checkout');
      return;
    }

    const shippingAddress: OrderDetailsType = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
    };

    const paymentDetails: PaymentDetails = {
      cardNumber: data.cardNumber, // Still simulated
      expiryDate: data.expiryDate,
      cvv: data.cvv,
    };

    const orderData: Omit<Order, 'id'> = {
      userId: user.uid,
      items: cartItems,
      totalAmount: getCartTotal(),
      shippingAddress,
      paymentDetails,
      createdAt: serverTimestamp(),
      status: 'Pending',
    };

    try {
      // In a real app, payment processing would happen here BEFORE saving the order.
      // For this prototype, we directly save to Firestore.
      
      const docRef = await addDoc(collection(db, "orders"), orderData);
      console.log("Order submitted to Firestore with ID: ", docRef.id);

      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your order. We'll start preparing it right away!",
        variant: "default",
      });
      clearCart();
      router.push('/');
    } catch (error) {
      console.error("Error placing order: ", error);
      toast({
        title: "Error Placing Order",
        description: "There was a problem submitting your order. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><UserIcon /> Contact & Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="123-456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Pizza Lane" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Pizzaville" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><CreditCard /> Payment Details (Simulated)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Number</FormLabel>
                <FormControl>
                  <Input placeholder="•••• •••• •••• ••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (MM/YY)</FormLabel>
                  <FormControl>
                    <Input placeholder="MM/YY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVV</FormLabel>
                  <FormControl>
                    <Input placeholder="•••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          </CardContent>
        </Card>
        
        <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg py-3" disabled={form.formState.isSubmitting || !user}>
          {form.formState.isSubmitting ? 'Processing...' : 'Pay and Place Order'}
        </Button>
      </form>
    </Form>
  );
}
