
"use client";

import { useEffect, useState, useRef } from 'react'; // Added useRef
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, Edit3, ShieldCheck, LogOut, Package, ShoppingBag, CalendarDays, Hash, DollarSign, Home, Phone, KeyRound, AlertTriangle, MailCheck, MailWarning, ListOrdered, UserCog } from 'lucide-react'; 
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore'; // Added onSnapshot
import type { Order, UpdateUserProfileFormValues, ShippingAddressDetails } from '@/lib/types'; 
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida."),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
  confirmNewPassword: z.string().min(6, "Confirma tu nueva contraseña."),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Las nuevas contraseñas no coinciden.",
  path: ["confirmNewPassword"], 
});
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const updateUserProfileSchema = z.object({
  displayName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50, "El nombre no puede exceder los 50 caracteres."),
  
  shippingName: z.string().min(2, "El nombre para envío es requerido.").optional().or(z.literal('')),
  shippingEmail: z.string().email("Introduce un email de envío válido.").optional().or(z.literal('')),
  shippingAddress: z.string().min(5, "La dirección de envío es requerida.").optional().or(z.literal('')),
  shippingCity: z.string().min(2, "La ciudad de envío es requerida.").optional().or(z.literal('')),
  shippingPostalCode: z.string().min(3, "El código postal de envío es requerido.").optional().or(z.literal('')),
  shippingPhone: z.string().optional().or(z.literal('')),
}).refine(data => { 
  const shippingFields = [data.shippingName, data.shippingEmail, data.shippingAddress, data.shippingCity, data.shippingPostalCode];
  
  const someShippingPresent = shippingFields.some(field => field && field.length > 0);
  const allRequiredShippingPresent = data.shippingName && data.shippingEmail && data.shippingAddress && data.shippingCity && data.shippingPostalCode;
  
  if (someShippingPresent && (!allRequiredShippingPresent && (
        !data.shippingName || !data.shippingEmail || !data.shippingAddress || !data.shippingCity || !data.shippingPostalCode
    ))) {
        return false;
    }
  return true;
}, {
  message: "Si se proporciona un detalle de envío, todos sus campos principales son requeridos (excepto teléfono).",
  path: ["shippingName"], 
});

type UpdateUserProfileFormValuesZod = z.infer<typeof updateUserProfileSchema>;


export default function ProfilePage() {
  const { 
    user, 
    userProfile, 
    logout, 
    updateUserPassword, 
    updateUserProfileDetails,
    resendVerificationEmail,
    isLoading: authIsLoading, 
    isLoadingUserProfile 
  } = useAuth(); 
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const initialDataLoadedRef = useRef(false); // Used to track initial data load for orders

  const hasPasswordProvider = user?.providerData?.some(p => p.providerId === 'password');

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const editProfileForm = useForm<UpdateUserProfileFormValuesZod>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: { 
      displayName: userProfile?.displayName || user?.displayName || "",
      shippingName: userProfile?.defaultShippingAddress?.name || "",
      shippingEmail: userProfile?.defaultShippingAddress?.email || "",
      shippingAddress: userProfile?.defaultShippingAddress?.address || "",
      shippingCity: userProfile?.defaultShippingAddress?.city || "",
      shippingPostalCode: userProfile?.defaultShippingAddress?.postalCode || "",
      shippingPhone: userProfile?.defaultShippingAddress?.phone || "",
    },
  });

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, authIsLoading, router]);
  
  useEffect(() => {
    if (userProfile && isEditProfileDialogOpen && !editProfileForm.formState.isDirty) {
      editProfileForm.reset({ 
        displayName: userProfile.displayName || user?.displayName || "",
        shippingName: userProfile.defaultShippingAddress?.name || "",
        shippingEmail: userProfile.defaultShippingAddress?.email || "",
        shippingAddress: userProfile.defaultShippingAddress?.address || "",
        shippingCity: userProfile.defaultShippingAddress?.city || "",
        shippingPostalCode: userProfile.defaultShippingAddress?.postalCode || "",
        shippingPhone: userProfile.defaultShippingAddress?.phone || "",
      });
    }
  }, [userProfile, user, editProfileForm, isEditProfileDialogOpen]);


  useEffect(() => {
    if (!user?.uid) {
      setOrders([]);
      setIsLoadingOrders(false);
      initialDataLoadedRef.current = false; // Reset when user logs out
      return;
    }

    setIsLoadingOrders(true);
    // initialDataLoadedRef.current is false here, will be set to true after first snapshot
    
    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders: Order[] = snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() } as Order));

      if (initialDataLoadedRef.current) {
        // Only compare and notify after the initial data load
        fetchedOrders.forEach(newOrder => {
          const oldOrder = orders.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            // Check if updatedAt exists and is more recent, or if status simply changed
            const newOrderUpdatedAtMs = newOrder.updatedAt?.toMillis ? newOrder.updatedAt.toMillis() : 0;
            const oldOrderUpdatedAtMs = oldOrder.updatedAt?.toMillis ? oldOrder.updatedAt.toMillis() : 0;

            if (newOrderUpdatedAtMs > oldOrderUpdatedAtMs || (!newOrder.updatedAt && oldOrder.status !== newOrder.status)) {
               toast({
                title: "Actualización de Pedido",
                description: `El estado de tu pedido #${newOrder.id?.substring(0, 8)}... es ahora: ${newOrder.status}.`,
                duration: 7000,
              });
            }
          }
        });
      } else {
        // This is the first data snapshot
        initialDataLoadedRef.current = true;
      }

      setOrders(fetchedOrders);
      setIsLoadingOrders(false);
    }, (error) => {
      console.error("Error fetching orders with onSnapshot: ", error);
      toast({
        title: "Error al Cargar Pedidos",
        description: "No se pudieron obtener los pedidos en tiempo real.",
        variant: "destructive",
      });
      setIsLoadingOrders(false);
    });

    // Cleanup subscription on unmount or if user.uid changes
    return () => {
      unsubscribe();
      initialDataLoadedRef.current = false; // Reset for next user or remount
    };
  }, [user?.uid, toast, orders]); // `orders` is included for comparison logic with the current state


  async function onSubmitPasswordChange(data: ChangePasswordFormValues) {
    try {
      await updateUserPassword(data.currentPassword, data.newPassword);
      passwordForm.reset();
      setIsPasswordDialogOpen(false); 
    } catch (error) {
      console.error("Failed to change password from profile page", error)
    }
  }

  async function onSubmitEditProfile(data: UpdateUserProfileFormValuesZod) {
    const mappedData: UpdateUserProfileFormValues = {
      displayName: data.displayName || '',
      shippingName: data.shippingName || '',
      shippingEmail: data.shippingEmail || '',
      shippingAddress: data.shippingAddress || '',
      shippingCity: data.shippingCity || '',
      shippingPostalCode: data.shippingPostalCode || '',
      shippingPhone: data.shippingPhone || '',
    };
    try {
      await updateUserProfileDetails(mappedData);
      setIsEditProfileDialogOpen(false);
    } catch (error) {
      console.error("Failed to update profile from profile page", error);
    }
  }


  if (authIsLoading || isLoadingUserProfile || !user || !userProfile) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <p className="text-lg text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

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
      <Card className="shadow-xl">
        <CardHeader className="text-center border-b pb-6">
          <UserCircle className="mx-auto h-24 w-24 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">{userProfile?.displayName || user.email?.split('@')[0] || 'Mi Perfil'}</CardTitle>
          <CardDescription>Gestiona la información de tu cuenta y pedidos.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="account"><UserCog className="mr-2 h-5 w-5"/>Detalles de Cuenta</TabsTrigger>
              <TabsTrigger value="orders"><ListOrdered className="mr-2 h-5 w-5"/>Historial de Pedidos</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              {user && !user.emailVerified && hasPasswordProvider && (
                <Alert variant="default" className="bg-yellow-50 border-yellow-300 text-yellow-700">
                  <MailWarning className="h-5 w-5 text-yellow-600" />
                  <AlertTitle className="font-semibold text-yellow-800">Verifica tu correo electrónico</AlertTitle>
                  <AlertDescription>
                    Tu dirección de correo electrónico aún no ha sido verificada. Por favor, revisa tu bandeja de entrada para el correo de verificación.
                    <Button variant="link" className="p-0 h-auto ml-1 text-yellow-700 hover:text-yellow-800" onClick={resendVerificationEmail} disabled={authIsLoading}>
                      Reenviar correo
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-3">
                {userProfile?.email && (
                  <div className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
                          <p className="text-md font-semibold">{userProfile.email}</p>
                        </div>
                    </div>
                    {user.emailVerified ? (
                        <Badge variant="default" className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">
                            <MailCheck className="mr-1.5 h-4 w-4" /> Verificado
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-100">
                            <MailWarning className="mr-1.5 h-4 w-4" /> No Verificado
                        </Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <UserCircle className="h-5 w-5 text-primary" /> 
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">User ID (UID)</p>
                        <p className="text-md font-semibold break-all">{user.uid}</p>
                    </div>
                </div>
                {userProfile?.defaultShippingAddress && (userProfile.defaultShippingAddress.name || userProfile.defaultShippingAddress.address) && (
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
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Dialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Edit3 /> Editar Perfil y Dirección
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Edit3/> Editar Perfil</DialogTitle>
                            <DialogDescription>
                                Actualiza tu nombre y dirección de envío predeterminada.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] p-1 pr-5">
                        <Form {...editProfileForm}>
                            <form onSubmit={editProfileForm.handleSubmit(onSubmitEditProfile)} className="space-y-6 py-4">
                                <FormField
                                    control={editProfileForm.control}
                                    name="displayName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre Público</FormLabel>
                                            <FormControl><Input placeholder="Tu nombre" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Accordion type="single" collapsible className="w-full" defaultValue="shipping">
                                    <AccordionItem value="shipping">
                                        <AccordionTrigger className="text-lg font-semibold">Dirección de Envío Predeterminada</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            <FormField control={editProfileForm.control} name="shippingName" render={({ field }) => ( <FormItem> <FormLabel>Nombre del destinatario</FormLabel> <FormControl><Input placeholder="Nombre completo" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                            <FormField control={editProfileForm.control} name="shippingEmail" render={({ field }) => ( <FormItem> <FormLabel>Email de contacto</FormLabel> <FormControl><Input type="email" placeholder="email@ejemplo.com" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                            <FormField control={editProfileForm.control} name="shippingAddress" render={({ field }) => ( <FormItem> <FormLabel>Dirección</FormLabel> <FormControl><Input placeholder="Calle, Número, etc." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                            <div className="grid grid-cols-2 gap-4">
                                              <FormField control={editProfileForm.control} name="shippingCity" render={({ field }) => ( <FormItem> <FormLabel>Ciudad</FormLabel> <FormControl><Input placeholder="Ciudad" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                              <FormField control={editProfileForm.control} name="shippingPostalCode" render={({ field }) => ( <FormItem> <FormLabel>Código Postal</FormLabel> <FormControl><Input placeholder="C.P." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                            </div>
                                            <FormField control={editProfileForm.control} name="shippingPhone" render={({ field }) => ( <FormItem> <FormLabel>Teléfono (Opcional)</FormLabel> <FormControl><Input placeholder="Número de teléfono" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                <DialogFooter className="mt-6">
                                    <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                                    <Button type="submit" disabled={editProfileForm.formState.isSubmitting || authIsLoading}>
                                        {editProfileForm.formState.isSubmitting || authIsLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
                
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <TooltipProvider>
                    <Tooltip open={!hasPasswordProvider ? undefined : false }>
                      <TooltipTrigger asChild>
                        <span tabIndex={hasPasswordProvider ? -1 : 0} className="w-full"> 
                          <Button variant="outline" disabled={!hasPasswordProvider} onClick={() => hasPasswordProvider && setIsPasswordDialogOpen(true)} className="w-full">
                            <ShieldCheck /> Cambiar Contraseña
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!hasPasswordProvider && (
                        <TooltipContent>
                          <p className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-amber-500" />No puedes cambiar la contraseña porque iniciaste sesión con un proveedor externo (ej. Google).</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  {hasPasswordProvider && (
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><KeyRound/> Cambiar Contraseña</DialogTitle>
                        <DialogDescription>Introduce tu contraseña actual y la nueva contraseña.</DialogDescription>
                      </DialogHeader>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-4 py-4">
                          <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => ( <FormItem> <FormLabel>Contraseña Actual</FormLabel> <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                          <FormField control={passwordForm.control} name="newPassword" render={({ field }) => ( <FormItem> <FormLabel>Nueva Contraseña</FormLabel> <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                          <FormField control={passwordForm.control} name="confirmNewPassword" render={({ field }) => ( <FormItem> <FormLabel>Confirmar Nueva Contraseña</FormLabel> <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                          <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={passwordForm.formState.isSubmitting || authIsLoading}>
                              {passwordForm.formState.isSubmitting || authIsLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <section>
                <h2 className="text-2xl font-headline mb-6 text-center text-primary flex items-center justify-center gap-2">
                  <ShoppingBag /> Mis Pedidos
                </h2>
                {isLoadingOrders ? (
                  <div className="text-center py-10"><p className="text-lg text-muted-foreground">Cargando tus pedidos...</p></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">Aún no has realizado ningún pedido.</p>
                    <Button asChild variant="link" className="mt-4 text-primary"><Link href="/">Ir al Menú</Link></Button>
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
                            <Badge variant={order.status === 'Pending' ? 'secondary' : 'default'} className="mt-1">{order.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="items">
                              <AccordionTrigger className="text-base font-semibold">Ver {order.items.length} Artículo(s)</AccordionTrigger>
                              <AccordionContent>
                                <ul className="space-y-3 pt-2">
                                  {order.items.map((item) => (
                                    <li key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/20">
                                      <div className="flex items-center gap-3">
                                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded object-cover" data-ai-hint={item.dataAiHint}/>
                                        <div><p className="font-semibold text-sm">{item.name}</p><p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p></div>
                                      </div>
                                      <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="shipping">
                              <AccordionTrigger className="text-base font-semibold">Detalles de Envío</AccordionTrigger>
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
                          <div className="flex items-center gap-1.5 text-lg font-bold text-primary"><DollarSign className="h-5 w-5" />Total: ${order.totalAmount.toFixed(2)}</div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={logout} variant="destructive" className="w-full" disabled={authIsLoading}>
            <LogOut />
            {authIsLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

