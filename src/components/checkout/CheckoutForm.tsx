
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
import { User as UserIcon, Loader2 } from 'lucide-react'; // Added Loader2
import type { ShippingAddressDetails } from "@/lib/types";
import { useEffect, useState } from "react";
import { getStripe } from "@/lib/stripe"; // Import Stripe loader

const addressSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  phone: z.string().optional(),
  address: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres." }),
  city: z.string().min(2, { message: "La ciudad debe tener al menos 2 caracteres." }),
  postalCode: z.string().min(3, { message: "El código postal es demasiado corto." }),
});

const checkoutFormSchema = addressSchema.extend({
  saveAddress: z.boolean().default(true).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutForm() {
  const { 
    user, 
    userProfile, 
    fetchUserProfile, 
    isLoading: authLoading, 
    isLoadingUserProfile,
    updateUserProfileDetails // Already available here
  } = useAuth();
  const { cartItems, getCartTotal } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isFormPreFilled, setIsFormPreFilled] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);


  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
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
        saveAddress: !!userProfile.defaultShippingAddress, 
      };
      form.reset(defaultVals);
      setIsFormPreFilled(true);
    }
  }, [userProfile, isLoadingUserProfile, form, isFormPreFilled]);


  async function onSubmit(data: CheckoutFormValues) {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar un pedido.",
        variant: "destructive",
      });
      router.push('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Tu carrito está vacío.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingPayment(true);

    const shippingAddressPayload: ShippingAddressDetails = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
    };

    try {
      // 1. Save address preference if selected (optional, can be done via webhook too)
      if (data.saveAddress && userProfile && user) { // Added user check for fetchUserProfile
         if (JSON.stringify(userProfile.defaultShippingAddress) !== JSON.stringify(shippingAddressPayload)) {
            // Only update if it's different or new
            // This is a simplified update, a more robust one would be in AuthContext
            // const { updateUserProfileDetails } = useAuth(); // REMOVED: Incorrect hook call
            await updateUserProfileDetails({ // USE the one from component scope
                displayName: userProfile.displayName || '',
                shippingName: shippingAddressPayload.name,
                shippingEmail: shippingAddressPayload.email,
                shippingAddress: shippingAddressPayload.address,
                shippingCity: shippingAddressPayload.city,
                shippingPostalCode: shippingAddressPayload.postalCode,
                shippingPhone: shippingAddressPayload.phone,
            });
            await fetchUserProfile(user.uid); // USE the one from component scope
            toast({
                title: "Dirección Guardada",
                description: "Tu dirección de envío ha sido guardada para futuros pedidos.",
            });
         }
      }

      // 2. Create Stripe Checkout Session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            items: cartItems, 
            userId: user.uid, 
            shippingAddress: shippingAddressPayload 
        }),
      });

      const sessionData = await response.json();

      if (!response.ok) {
        throw new Error(sessionData.error || 'No se pudo crear la sesión de Stripe.');
      }

      // 3. Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe.js aún no se ha cargado.');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionData.sessionId,
      });

      if (error) {
        console.error('Error de redirección de Stripe:', error);
        toast({
          title: "Error de Redirección a Stripe",
          description: error.message || "No se pudo redirigir a la página de pago.",
          variant: "destructive",
        });
      }
      // If redirectToCheckout is successful, the user is navigated away,
      // so no further client-side processing for order creation happens here.
      // Order creation will be handled by the webhook.

    } catch (error: any) {
      console.error("Error procesando el pago: ", error);
      toast({
        title: "Error al Procesar el Pago",
        description: error.message || "Hubo un problema. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
        setIsProcessingPayment(false);
    }
  }
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><UserIcon /> Información de Contacto y Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
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
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan.perez@ejemplo.com" {...field} />
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
                  <FormLabel>Número de Teléfono (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="600 123 456" {...field} />
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
                  <FormLabel>Dirección (Calle y Número)</FormLabel>
                  <FormControl>
                    <Input placeholder="C/ Falsa, 123" {...field} />
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
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="Pizzalandia" {...field} />
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
                  <FormLabel>Código Postal</FormLabel>
                  <FormControl>
                    <Input placeholder="28080" {...field} />
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
        
        <Button 
          type="submit" 
          size="lg" 
          className="w-full bg-primary hover:bg-primary/90 text-lg py-3" 
          disabled={isProcessingPayment || authLoading || !user || cartItems.length === 0}
        >
          {isProcessingPayment ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Procesando...
            </>
          ) : (
            'Proceder al Pago con Stripe'
          )}
        </Button>
      </form>
    </Form>
  );
}
