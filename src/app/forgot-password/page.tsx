
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { user, resetPassword, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is already logged in
    if (!authIsLoading && user) {
      router.push('/profile');
    }
  }, [user, authIsLoading, router]);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    await resetPassword(data.email);
    // Redirection is handled within resetPassword on success
  }

  if (authIsLoading && !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)] py-12">
        <p className="text-lg text-muted-foreground">Cargando...</p>
      </div>
    );
  }
  
  if (user && !authIsLoading) {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)] py-12">
        <p className="text-lg text-muted-foreground">Ya has iniciado sesión. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-20rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
            <KeyRound className="h-7 w-7" /> Restablecer Contraseña
          </CardTitle>
          <CardDescription>
            Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-3" disabled={authIsLoading || form.formState.isSubmitting}>
                {form.formState.isSubmitting || authIsLoading ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <Button variant="link" asChild className="text-primary hover:text-primary/90">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Iniciar Sesión
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
