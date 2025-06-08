
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
// No se importa useSearchParams de 'next/navigation'

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Efecto para obtener el sessionId de la URL solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const idFromParams = params.get('session_id');
      setSessionId(idFromParams);
    }
  }, []); // Se ejecuta solo una vez al montar en el cliente

  // Efecto para actuar cuando sessionId tiene un valor
  useEffect(() => {
    if (sessionId) {
        console.log("Stripe session ID on success page:", sessionId, "Payment successful, attempting to clear cart (if webhook hasn't already).");
        // Es generalmente mejor para el webhook ser la fuente de verdad para limpiar el carrito
        // después de que un pedido se crea exitosamente en la BD.
        // Sin embargo, esta limpieza del lado del cliente puede actuar como un respaldo o una actualización de UX más rápida.
        clearCart(); 
    }
  }, [sessionId, clearCart]); // Se ejecuta cuando sessionId cambia (o clearCart, aunque esta última es estable)

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-headline text-green-600">¡Pago Exitoso!</CardTitle>
          <CardDescription className="text-lg">
            Gracias por tu pedido en Pizzería Serranillo.
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
