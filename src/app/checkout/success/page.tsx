
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext"; // Keep for potential future use, but not clearing cart here
import { useEffect } from "react";
import { useSearchParams } from 'next/navigation';


export default function CheckoutSuccessPage() {
  const { clearCart } = useCart(); // Get clearCart from context
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');


  useEffect(() => {
    // Attempt to clear the cart if a Stripe session ID is present.
    // This is a client-side fallback. The primary order creation and cart management
    // should ideally be handled robustly by the webhook.
    if (sessionId) {
        console.log("Stripe session ID on success page:", sessionId, "Payment successful, attempting to clear cart.");
        clearCart(); // Clear cart items from localStorage
    }
  }, [sessionId, clearCart]);

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">¡Pago Exitoso!</CardTitle>
          <CardDescription className="text-lg">
            Gracias por tu pedido en PizzaPlace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Tu pago ha sido procesado. Tu pedido se está registrando en nuestro sistema y recibirás una confirmación en breve.
            (La creación final del pedido en nuestra base de datos se completa a través de un webhook seguro de Stripe).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">Volver al Menú</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/profile">Ver Mis Pedidos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
