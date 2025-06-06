
"use client";

import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useCart } from "@/context/CartContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const { cartItems, getCartTotal, getTotalItems } = useCart();
  const total = getCartTotal();
  const totalItems = getTotalItems();

  if (totalItems === 0 && typeof window !== 'undefined') {
     // This check ensures it only runs on the client after mount
     // If cart is empty, redirect to home. Can't use useRouter hook at top level of Server Component.
     // For a client component page, this would be fine.
     // For simplicity in this structure, we'll show a message if cart is empty.
     // A useEffect with router.push('/') would be typical in a fully client-rendered scenario.
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-headline mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Please add some items to your cart before proceeding to checkout.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Menu
          </Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-headline mb-10 text-center text-primary">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm />
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
              <CardDescription>{totalItems} item(s) in your cart</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="rounded object-cover"
                        data-ai-hint={item.dataAiHint}
                      />
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pt-4 border-t">
              <div className="flex justify-between w-full font-semibold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
