
"use client";

import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useCart } from "@/context/CartContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const { cartItems, getCartTotal, getTotalItems } = useCart();
  const router = useRouter();
  
  const total = getCartTotal();
  const totalItems = getTotalItems();

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, authIsLoading, router]);

  if (authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    // User will be redirected by useEffect, this is a fallback or if redirect is slow
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Redirigiendo a inicio de sesión...</p>
      </div>
    );
  }
  
  // This check must come AFTER auth check
  if (totalItems === 0 && typeof window !== 'undefined') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-headline mb-4">Tu Carrito está Vacío</h1>
        <p className="text-muted-foreground mb-8">Por favor, añade algunos productos a tu carrito antes de proceder al pago.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú
          </Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-headline mb-10 text-center text-primary">Proceso de Pago</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm />
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Resumen del Pedido</CardTitle>
              <CardDescription>{totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} en tu carrito</CardDescription>
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
                        <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
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
