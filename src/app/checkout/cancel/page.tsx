
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto py-12 px-4 flex justify-center">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-3xl font-headline">Pago Cancelado</CardTitle>
          <CardDescription className="text-lg">
            Parece que has cancelado el proceso de pago.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Tu pedido no ha sido procesado. Si tienes algún problema, por favor, contacta con nosotros.
            Puedes volver al menú e intentarlo de nuevo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">Volver al Menú</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#contact">Contactar Soporte</Link> {/* Placeholder, you might not have a contact section */}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
