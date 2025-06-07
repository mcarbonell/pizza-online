
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

export default function AdminPage() {
  const { user, userProfile, isLoading: authIsLoading, isLoadingUserProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !isLoadingUserProfile) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (userProfile && userProfile.role !== 'admin') {
        router.push('/'); 
        // Optionally, show a toast message for access denied
      }
    }
  }, [user, userProfile, authIsLoading, isLoadingUserProfile, router]);

  if (authIsLoading || isLoadingUserProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <LayoutDashboard className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando panel de administración...</p>
      </div>
    );
  }

  if (!user || (userProfile && userProfile.role !== 'admin')) {
    // This state is usually brief as useEffect will redirect
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <LayoutDashboard className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-muted-foreground">Acceso denegado. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <LayoutDashboard className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Panel de Administración</CardTitle>
          <CardDescription>Bienvenido al panel de control de PizzaPlace.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Aquí podrás gestionar productos, pedidos y usuarios en el futuro.
          </p>
          {/* Placeholder for future admin functionalities */}
        </CardContent>
      </Card>
    </div>
  );
}
