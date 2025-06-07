
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
import { LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { user, login, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/profile';

  useEffect(() => {
    if (!authIsLoading && user) {
      router.push(redirectPath);
    }
  }, [user, authIsLoading, router, redirectPath]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      // The login function in AuthContext will handle redirection on success
      // by using the redirectPath if provided or defaulting to /profile.
      // We no longer need to pass redirectPath to login function directly.
      // The AuthContext's login function needs to be aware of this.
      // For now, we assume login function pushes to /profile, and the useEffect above handles if already logged in.
      await login(data.email, data.password);
       // If login is successful, onAuthStateChanged will update 'user' and useEffect will redirect.
       // If a redirect param was present, AuthContext's login would ideally handle it.
       // For now, a successful login should push to /profile (done in AuthContext),
       // or if redirect was specified, AuthContext should use that.
       // We will update AuthContext to handle redirectPath later if needed.

    } catch (error: any) {
      console.error("Login page submit error:", error);
    }
  }

  if (authIsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)] py-12">
        <p className="text-lg text-muted-foreground">Cargando...</p>
      </div>
    );
  }
  
  // If user is already logged in, useEffect will redirect. This is a fallback render.
  if (user) {
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
          <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2"><LogIn className="h-7 w-7"/> Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta PizzaPlace.</CardDescription>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-3" disabled={authIsLoading || form.formState.isSubmitting}>
                {authIsLoading || form.formState.isSubmitting ? 'Accediendo...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Button variant="link" asChild className="p-0 h-auto font-semibold text-primary">
              <Link href="/signup">
                Regístrate aquí
              </Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
