
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
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, User as UserIcon, Mail, Home, Phone, Save } from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import type { ShippingAddressDetails, PaymentDetails, Order, UserProfile } from "@/lib/types";
import { useEffect, useState } from "react";

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

const checkoutFormSchema = addressSchema.merge(paymentSchema).extend({
  saveAddress: z.boolean().default(true).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutForm() {
  const { user, userProfile, fetchUserProfile, isLoading: authLoading, isLoadingUserProfile } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isFormPreFilled, setIsFormPreFilled] = useState(false);

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
      saveAddress: true,
    },
  });

  useEffect(() => {
    if (!isLoadingUserProfile && userProfile && !form.formState.isDirty && !isFormPreFilled) {
      const defaultVals: Partial<CheckoutFormValues> = {
        name: userProfile.defaultShippingAddress?.name || userProfile.displayName || '',
        email: userProfile.defaultShippingAddress?.email || userProfile.email || '',
        phone: userProfile.defaultShippingAddress?.phone || '',
        address: userProfile.defaultShippingAddress?.address || '',
        city: userProfile.defaultShippingAddress?.city || '',
        postalCode: userProfile.defaultShippingAddress?.postalCode || '',
        saveAddress: true, // Default to true if we have address data
      };
      form.reset(defaultVals);
      setIsFormPreFilled(true);
    }
  }, [userProfile, isLoadingUserProfile, form, isFormPreFilled]);


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

    const shippingAddressPayload: ShippingAddressDetails = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
    };

    const paymentDetailsPayload: PaymentDetails = {
      cardNumber: data.cardNumber, 
      expiryDate: data.expiryDate,
      cvv: data.cvv,
    };

    const orderData: Omit<Order, 'id'> = {
      userId: user.uid,
      items: cartItems,
      totalAmount: getCartTotal(),
      shippingAddress: shippingAddressPayload,
      paymentDetails: paymentDetailsPayload,
      createdAt: serverTimestamp(),
      status: 'Pending',
    };

    try {
      // Save/Update shipping address in user's profile if checked
      if (data.saveAddress && user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          defaultShippingAddress: shippingAddressPayload,
          updatedAt: serverTimestamp(),
        });
        await fetchUserProfile(user.uid); // Refresh profile data in context
        toast({
          title: "Dirección Guardada",
          description: "Tu dirección de envío ha sido guardada para futuros pedidos.",
          variant: "default",
        });
      }
      
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
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
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
            <FormField
              control={form.control}
              name="saveAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Guardar esta dirección para futuros pedidos
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
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
        
        <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg py-3" disabled={form.formState.isSubmitting || authLoading || !user}>
          {form.formState.isSubmitting ? 'Processing...' : 'Pay and Place Order'}
        </Button>
      </form>
    </Form>
  );
}
