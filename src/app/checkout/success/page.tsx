
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";
import { useSearchParams } from 'next/navigation';


export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');


  useEffect(() => {
    // Clear the cart when the success page is loaded after a successful Stripe payment.
    // This is a temporary measure. Ideally, cart clearing and order creation
    // should be robustly handled by the webhook.
    if (sessionId) {
        console.log("Stripe session ID:", sessionId, "Payment successful, clearing cart.");
        clearCart();
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
            Tu pedido ha sido procesado correctamente. Recibirás una confirmación por correo electrónico en breve.
            (Nota: La creación del pedido en nuestra base de datos se completará a través de un webhook de Stripe.)
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
