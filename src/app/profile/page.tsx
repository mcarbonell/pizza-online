
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, Edit3, ShieldCheck, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <p className="text-lg text-muted-foreground">Cargando perfil...</p>
        {/* You could add a spinner here */}
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    // Navigation is handled within the logout function of AuthContext
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <UserCircle className="mx-auto h-24 w-24 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">{user.displayName || user.email?.split('@')[0] || 'Mi Perfil'}</CardTitle>
          <CardDescription>Gestiona la información de tu cuenta PizzaPlace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {user.email && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
                  <p className="text-md font-semibold">{user.email}</p>
                </div>
              </div>
            )}
            {user.displayName && (
                 <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                        <p className="text-md font-semibold">{user.displayName}</p>
                    </div>
                </div>
            )}
             <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <UserCircle className="h-5 w-5 text-primary" />
                <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID (UID)</p>
                    <p className="text-md font-semibold break-all">{user.uid}</p>
                </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Button variant="outline" disabled>
              <Edit3 className="mr-2 h-4 w-4" /> Editar Perfil (Próximamente)
            </Button>
            <Button variant="outline" disabled>
              <ShieldCheck className="mr-2 h-4 w-4" /> Cambiar Contraseña (Próximamente)
            </Button>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full mt-6" disabled={isLoading}>
            <LogOut className="mr-2 h-4 w-4" />
            {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
