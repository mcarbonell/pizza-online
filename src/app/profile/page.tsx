
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, Edit3, ShieldCheck, LogOut, Package, ShoppingBag, CalendarDays, Hash, DollarSign, Home, Phone, CreditCardIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types'; 
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user, userProfile, logout, isLoading: authIsLoading, isLoadingUserProfile } = useAuth(); 
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, authIsLoading, router]);

  useEffect(() => {
    if (user?.uid) {
      const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
          const ordersRef = collection(db, "orders");
          const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          const userOrders: Order[] = [];
          querySnapshot.forEach((doc) => {
            userOrders.push({ id: doc.id, ...doc.data() } as Order);
          });
          setOrders(userOrders);
        } catch (error) {
          console.error("Error fetching orders: ", error);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user?.uid]);

  if (authIsLoading || isLoadingUserProfile || !user) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <p className="text-lg text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return 'Fecha no disponible';
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card className="shadow-xl mb-12">
        <CardHeader className="text-center">
          <UserCircle className="mx-auto h-24 w-24 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">{userProfile?.displayName || user.email?.split('@')[0] || 'Mi Perfil'}</CardTitle>
          <CardDescription>Gestiona la información de tu cuenta PizzaPlace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {userProfile?.email && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
                  <p className="text-md font-semibold">{userProfile.email}</p>
                </div>
              </div>
            )}
            {userProfile?.displayName && (
                 <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                        <p className="text-md font-semibold">{userProfile.displayName}</p>
                    </div>
                </div>
            )}
             <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <UserCircle className="h-5 w-5 text-primary" /> {/* Consider changing icon if UID is not user-facing */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID (UID)</p>
                    <p className="text-md font-semibold break-all">{user.uid}</p>
                </div>
            </div>
            {userProfile?.defaultShippingAddress && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2"><Home className="h-5 w-5"/> Dirección de Envío Predeterminada</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Nombre:</strong> {userProfile.defaultShippingAddress.name}</p>
                  <p><strong>Email:</strong> {userProfile.defaultShippingAddress.email}</p>
                  <p><strong>Dirección:</strong> {userProfile.defaultShippingAddress.address}, {userProfile.defaultShippingAddress.city}, {userProfile.defaultShippingAddress.postalCode}</p>
                  {userProfile.defaultShippingAddress.phone && <p><strong><Phone className="inline h-4 w-4 mr-1"/>Teléfono:</strong> {userProfile.defaultShippingAddress.phone}</p>}
                </CardContent>
              </Card>
            )}
            {userProfile?.defaultPaymentMethod && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2"><CreditCardIcon className="h-5 w-5"/> Método de Pago Predeterminado (Simulado)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Tarjeta terminada en:</strong> •••• {userProfile.defaultPaymentMethod.last4Digits}</p>
                  <p><strong>Fecha de caducidad:</strong> {userProfile.defaultPaymentMethod.expiryDate}</p>
                  <p className="text-xs text-muted-foreground">(Solo se almacenan los últimos 4 dígitos y la fecha de caducidad. CVV nunca se guarda.)</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Button variant="outline" disabled>
              <Edit3 /> Editar Perfil, Dirección y Pago (Próximamente)
            </Button>
            <Button variant="outline" disabled>
              <ShieldCheck /> Cambiar Contraseña (Próximamente)
            </Button>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full mt-6" disabled={authIsLoading}>
            <LogOut />
            {authIsLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Button>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-3xl font-headline mb-8 text-center text-primary flex items-center justify-center gap-2">
          <ShoppingBag /> Mis Pedidos
        </h2>
        {isLoadingOrders ? (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">Cargando tus pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">Aún no has realizado ningún pedido.</p>
            <Button asChild variant="link" className="mt-4 text-primary">
              <a href="/">Ir al Menú</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-headline text-xl md:text-2xl mb-1 flex items-center gap-2">
                        <Hash /> Pedido #{order.id?.substring(0, 8)}...
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs md:text-sm">
                        <CalendarDays className="h-4 w-4" /> {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge variant={order.status === 'Pending' ? 'secondary' : 'default'} className="mt-1">
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="items">
                      <AccordionTrigger className="text-base font-semibold">
                        Ver {order.items.length} Artículo(s)
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-3 pt-2">
                          {order.items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/20">
                              <div className="flex items-center gap-3">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="rounded object-cover"
                                  data-ai-hint={item.dataAiHint}
                                />
                                <div>
                                  <p className="font-semibold text-sm">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="shipping">
                      <AccordionTrigger className="text-base font-semibold">
                        Detalles de Envío
                      </AccordionTrigger>
                      <AccordionContent className="text-sm space-y-1 pt-2">
                        <p><strong>Nombre:</strong> {order.shippingAddress.name}</p>
                        <p><strong>Email:</strong> {order.shippingAddress.email}</p>
                        <p><strong>Dirección:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                         {order.shippingAddress.phone && <p><strong>Teléfono:</strong> {order.shippingAddress.phone}</p>}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 rounded-b-lg flex justify-end items-center">
                  <div className="flex items-center gap-1.5 text-lg font-bold text-primary">
                    <DollarSign className="h-5 w-5" />
                    Total: ${order.totalAmount.toFixed(2)}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
