
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { LayoutDashboard, PackagePlus, ListOrdered, Edit, Trash2, AlertCircle, ShoppingBasket, Loader2, UploadCloud, ShieldAlert, Save, ImagePlus, ClipboardList, RefreshCcw, Users, UserCheck, UserCog } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, writeBatch, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import type { Product, Order, UserProfile } from '@/lib/types';
import { initialProductData } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const productCategories = ['Pizzas', 'Sides', 'Drinks', 'Desserts'] as const;
const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
const userRoles = ['user', 'admin'] as const;
const DEFAULT_PLACEHOLDER_IMAGE = 'https://placehold.co/600x400.png';

const productFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  price: z.preprocess(
    (val) => {
      if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
      if (typeof val === 'number') return val;
      return NaN;
    },
    z.number({ invalid_type_error: "El precio debe ser un número."}).positive({ message: "El precio debe ser un número positivo." })
  ),
  category: z.enum(productCategories, {
    errorMap: () => ({ message: "Por favor selecciona una categoría válida." }),
  }),
  imageUrl: z.string().url({ message: "Se requiere una URL de imagen válida." }).optional().or(z.literal('')),
  dataAiHint: z.string().max(30, "La pista de IA no debe exceder los 30 caracteres.").optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;


export default function AdminPage() {
  const { user, userProfile, isLoading: authIsLoading, isLoadingUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Product States
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Order States
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false);

  // User Management States
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userManagementError, setUserManagementError] = useState<string | null>(null);
  const [isUpdatingUserRole, setIsUpdatingUserRole] = useState(false);


  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "", description: "", price: 0, category: "Pizzas", imageUrl: "", dataAiHint: "",
    },
  });

  const addForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "", description: "", price: 0, category: "Pizzas", imageUrl: DEFAULT_PLACEHOLDER_IMAGE, dataAiHint: "",
    },
  });

  const resetImageStates = () => {
    setImageFile(null); setImagePreview(null); setUploadProgress(null); setIsUploading(false);
  };

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true); setProductError(null);
    try {
      const q = query(collection(db, 'products'), orderBy('category'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Product)));
    } catch (err) {
      console.error("Error fetching products for admin:", err);
      setProductError("Failed to load products.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true); setOrderError(null);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Order)));
    } catch (err) {
      console.error("Error fetching orders for admin:", err);
      setOrderError("Failed to load orders.");
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true); setUserManagementError(null);
    try {
      const q = query(collection(db, 'users'), orderBy('email'));
      const querySnapshot = await getDocs(q);
      setAllUsers(querySnapshot.docs.map(docSnap => ({ ...docSnap.data() } as UserProfile)));
    } catch (err) {
      console.error("Error fetching users for admin:", err);
      setUserManagementError("Failed to load users.");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);


  useEffect(() => {
    if (!authIsLoading && !isLoadingUserProfile) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (userProfile && userProfile.role !== 'admin') {
        router.push('/');
      } else if (userProfile && userProfile.role === 'admin') {
        fetchProducts();
        fetchOrders();
        fetchUsers();
      }
    }
  }, [user, userProfile, authIsLoading, isLoadingUserProfile, router, fetchProducts, fetchOrders, fetchUsers]);

  useEffect(() => {
    if (editingProduct) {
      editForm.reset({
        name: editingProduct.name, description: editingProduct.description, price: editingProduct.price,
        category: editingProduct.category as typeof productCategories[number],
        imageUrl: editingProduct.imageUrl, dataAiHint: editingProduct.dataAiHint || "",
      });
      setImagePreview(editingProduct.imageUrl || null); resetImageStates();
    } else {
       editForm.reset(editForm.formState.defaultValues); 
    }
  }, [editingProduct, editForm]);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); } 
    else { setImageFile(null); setImagePreview(null); }
  };

  const handleImportInitialMenu = async () => {
    setIsImporting(true);
    try {
      const batch = writeBatch(db);
      initialProductData.forEach(p => batch.set(doc(collection(db, 'products')), p));
      await batch.commit();
      toast({ title: "Menú Importado", description: `${initialProductData.length} productos importados.` });
      fetchProducts();
    } catch (error) {
      console.error("Error importing initial menu:", error);
      toast({ title: "Error de Importación", description: "No se pudo importar el menú.", variant: "destructive" });
    } finally { setIsImporting(false); }
  };

  const handleOpenEditModal = (product: Product) => { setEditingProduct(product); setIsEditModalOpen(true); };
  const handleOpenAddModal = () => { addForm.reset(); resetImageStates(); setIsAddModalOpen(true); };
  const handleOpenDeleteAlert = (product: Product) => { setProductToDelete(product); setIsDeleteAlertOpen(true); };

  const handleUpdateProduct = async (formData: ProductFormValues) => {
    if (!editingProduct) return;
    setIsUploading(true); setUploadProgress(0);
    let finalImageUrl = editingProduct.imageUrl; 
    try {
      if (imageFile) {
        if (editingProduct.imageUrl && editingProduct.imageUrl.includes("firebasestorage.googleapis.com") && editingProduct.imageUrl !== DEFAULT_PLACEHOLDER_IMAGE) {
          try { await deleteObject(storageRef(storage, editingProduct.imageUrl)); } 
          catch (error) { console.warn("Could not delete old image:", error); }
        }
        const uploadTask = uploadBytesResumable(storageRef(storage, `products/${editingProduct.id}/${imageFile.name}`), imageFile);
        finalImageUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed', (s) => setUploadProgress((s.bytesTransferred / s.totalBytes) * 100), reject, 
          async () => resolve(await getDownloadURL(uploadTask.snapshot.ref)));
        });
      }
      await updateDoc(doc(db, 'products', editingProduct.id), { ...formData, price: Number(formData.price), imageUrl: finalImageUrl });
      toast({ title: "Producto Actualizado", description: `"${formData.name}" actualizado.` });
      setIsEditModalOpen(false); setEditingProduct(null); resetImageStates(); fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({ title: "Error al Actualizar", description: "No se pudo actualizar.", variant: "destructive" });
    } finally { setIsUploading(false); setUploadProgress(null); }
  };
  
  const handleAddNewProduct = async (formData: ProductFormValues) => {
    setIsUploading(true); setUploadProgress(0);
    try {
      const newDocRef = await addDoc(collection(db, 'products'), { ...formData, price: Number(formData.price), imageUrl: '', createdAt: serverTimestamp() });
      let finalImageUrl = DEFAULT_PLACEHOLDER_IMAGE;
      if (imageFile) {
        const uploadTask = uploadBytesResumable(storageRef(storage, `products/${newDocRef.id}/${imageFile.name}`), imageFile);
        finalImageUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed', (s) => setUploadProgress((s.bytesTransferred / s.totalBytes) * 100), reject, 
          async () => resolve(await getDownloadURL(uploadTask.snapshot.ref)));
        });
      }
      await updateDoc(newDocRef, { imageUrl: finalImageUrl });
      toast({ title: "Producto Añadido", description: `"${formData.name}" añadido.` });
      setIsAddModalOpen(false); resetImageStates(); addForm.reset(); fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({ title: "Error al Añadir", description: "No se pudo añadir.", variant: "destructive" });
    } finally { setIsUploading(false); setUploadProgress(null); }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      if (productToDelete.imageUrl && productToDelete.imageUrl.includes("firebasestorage.googleapis.com") && productToDelete.imageUrl !== DEFAULT_PLACEHOLDER_IMAGE) {
        try { await deleteObject(storageRef(storage, productToDelete.imageUrl)); } 
        catch (storageError: any) { 
          console.warn(`Could not delete image ${productToDelete.imageUrl}:`, storageError);
          if (storageError.code !== 'storage/object-not-found') {
            toast({ title: "Advertencia", description: `Imagen no eliminada: ${storageError.message}`, duration: 7000 });
          }
        }
      }
      await deleteDoc(doc(db, 'products', productToDelete.id));
      toast({ title: "Producto Eliminado", description: `"${productToDelete.name}" eliminado.` });
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({ title: "Error al Eliminar", description: `No se pudo eliminar "${productToDelete.name}".`, variant: "destructive" });
    } finally { setIsDeletingProduct(false); setIsDeleteAlertOpen(false); setProductToDelete(null); }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: typeof orderStatuses[number]) => {
    setIsUpdatingOrderStatus(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus, updatedAt: serverTimestamp() });
      toast({ title: "Estado del Pedido Actualizado", description: `El pedido #${orderId.substring(0,6)}... ahora está ${newStatus}.` });
      fetchOrders(); 
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({ title: "Error al Actualizar Estado", description: "No se pudo actualizar el estado del pedido.", variant: "destructive" });
    } finally {
      setIsUpdatingOrderStatus(false);
    }
  };

  const handleUpdateUserRole = async (userIdToUpdate: string, newRole: typeof userRoles[number]) => {
    if (user?.uid === userIdToUpdate) {
      toast({ title: "Acción no permitida", description: "No puedes cambiar tu propio rol.", variant: "destructive"});
      return;
    }
    setIsUpdatingUserRole(true);
    try {
      await updateDoc(doc(db, 'users', userIdToUpdate), { role: newRole, updatedAt: serverTimestamp() });
      toast({ title: "Rol de Usuario Actualizado", description: `El rol del usuario ha sido cambiado a ${newRole}.` });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({ title: "Error al Actualizar Rol", description: "No se pudo actualizar el rol del usuario.", variant: "destructive" });
    } finally {
      setIsUpdatingUserRole(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate ? timestamp.toDate().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Fecha inválida';
  };

  if (authIsLoading || isLoadingUserProfile) {
    return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p>Cargando...</p></div>;
  }
  if (!user || (userProfile && userProfile.role !== 'admin')) {
    return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"><ShieldAlert className="h-12 w-12 text-destructive mb-4" /><p>Acceso denegado.</p><Button onClick={() => router.push('/')} variant="link">Inicio</Button></div>;
  }

  const isAnyActionInProgress = isImporting || isUploading || isDeletingProduct || isUpdatingOrderStatus || isUpdatingUserRole;

  const renderProductFormFields = (currentForm: typeof editForm | typeof addForm, currentImagePreview: string | null) => (
    <>
      <FormField control={currentForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
      <FormField control={currentForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
      <div className="grid grid-cols-2 gap-4">
        <FormField control={currentForm.control} name="price" render={({ field }) => (<FormItem><FormLabel>Precio (€)</FormLabel><FormControl><Input type="number" {...field} step="0.01" /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={currentForm.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoría</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{productCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
      </div>
      <FormItem><FormLabel>Imagen</FormLabel>
        <div className="space-y-2">
          {(currentImagePreview || (editingProduct && currentForm === editForm && editingProduct.imageUrl)) && (
            <div className="relative w-full h-48 rounded-md overflow-hidden border">
              <Image src={currentImagePreview || (editingProduct && currentForm === editForm ? editingProduct.imageUrl : DEFAULT_PLACEHOLDER_IMAGE)} alt={currentForm.getValues('name') || "Vista previa"} layout="fill" objectFit="cover" />
            </div>
          )}
          <FormControl><div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" asChild><label htmlFor="img-upload-modal" className="cursor-pointer flex items-center gap-2"><ImagePlus className="h-4 w-4" />{imageFile ? "Cambiar" : "Subir"}</label></Button><Input id="img-upload-modal" type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />{imageFile && <span className="text-xs truncate max-w-[150px]">{imageFile.name}</span>}</div></FormControl>
          {isUploading && uploadProgress !== null && (<div className="space-y-1"><Progress value={uploadProgress} className="w-full h-2" /><p className="text-xs text-center">{Math.round(uploadProgress)}%</p></div>)}
        </div>
      </FormItem>
      <FormField control={currentForm.control} name="dataAiHint" render={({ field }) => (<FormItem><FormLabel>Pista IA (1-2 palabras)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
    </>
  );

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <Card className="shadow-xl">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-3xl font-headline flex items-center gap-2"><LayoutDashboard /> Panel Admin</CardTitle>
          <CardDescription>Gestiona productos, pedidos y usuarios.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="products"><ShoppingBasket className="mr-2 h-5 w-5"/>Productos</TabsTrigger>
              <TabsTrigger value="orders"><ClipboardList className="mr-2 h-5 w-5"/>Pedidos</TabsTrigger>
              <TabsTrigger value="users"><Users className="mr-2 h-5 w-5"/>Usuarios</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-2xl font-headline flex items-center gap-2"><ShoppingBasket />Gestión de Productos</CardTitle>
                      <CardDescription>Añade, edita o elimina productos del menú.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" disabled={isAnyActionInProgress}><UploadCloud />Importar Menú</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>¿Confirmar Importación?</AlertDialogTitle><AlertDialogDescription>Añadirá productos iniciales. No borrará existentes.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isImporting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleImportInitialMenu} disabled={isImporting}>{isImporting && <Loader2 className="animate-spin"/>}Confirmar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button onClick={handleOpenAddModal} disabled={isAnyActionInProgress}><PackagePlus />Añadir Producto</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoadingProducts ? (<div className="flex justify-center py-10"><Loader2 className="animate-spin mr-2" />Cargando...</div>)
                  : productError ? (<Alert variant="destructive"><AlertCircle /><AlertTitle>Error</AlertTitle><AlertDescription>{productError}</AlertDescription></Alert>)
                  : products.length === 0 ? (<Alert><AlertCircle /><AlertTitle>No Hay Productos</AlertTitle><AlertDescription>Usa "Importar Menú" o "Añadir Producto".</AlertDescription></Alert>)
                  : (<div className="overflow-x-auto"><Table><TableCaption>Productos en Firestore.</TableCaption><TableHeader><TableRow><TableHead>Imagen</TableHead><TableHead>Nombre</TableHead><TableHead className="hidden md:table-cell">Categoría</TableHead><TableHead className="hidden lg:table-cell max-w-[300px] truncate">Descripción</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-center">Acciones</TableHead></TableRow></TableHeader>
                      <TableBody>{products.map((p) => (<TableRow key={p.id}><TableCell><Image src={p.imageUrl || DEFAULT_PLACEHOLDER_IMAGE} alt={p.name} width={48} height={48} className="rounded object-cover" data-ai-hint={p.dataAiHint}/></TableCell><TableCell className="font-medium">{p.name}</TableCell><TableCell className="hidden md:table-cell"><Badge variant="secondary">{p.category}</Badge></TableCell><TableCell className="hidden lg:table-cell text-xs max-w-[300px] truncate" title={p.description}>{p.description}</TableCell><TableCell className="text-right">€{p.price.toFixed(2)}</TableCell><TableCell className="text-center"><div className="flex justify-center gap-1 sm:gap-2"><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(p)} disabled={isAnyActionInProgress}><Edit /></Button><Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleOpenDeleteAlert(p)} disabled={isAnyActionInProgress}><Trash2 /></Button></div></TableCell></TableRow>))}</TableBody>
                    </Table></div>)}
                </CardContent>
                <CardFooter className="border-t pt-4"><p className="text-xs text-muted-foreground">Gestión CRUD de productos.</p></CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-headline flex items-center gap-2"><ClipboardList /> Pedidos Recibidos</CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoadingOrders || isAnyActionInProgress}><RefreshCcw className={isLoadingOrders ? "animate-spin" : ""} /> Refrescar</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoadingOrders ? (<div className="flex justify-center py-10"><Loader2 className="animate-spin mr-2" />Cargando pedidos...</div>)
                  : orderError ? (<Alert variant="destructive"><AlertCircle /><AlertTitle>Error</AlertTitle><AlertDescription>{orderError}</AlertDescription></Alert>)
                  : orders.length === 0 ? (<Alert><AlertCircle /><AlertTitle>No Hay Pedidos</AlertTitle><AlertDescription>Aún no se han realizado pedidos.</AlertDescription></Alert>)
                  : (<div className="overflow-x-auto"><Table><TableCaption>Pedidos registrados en Firestore.</TableCaption><TableHeader><TableRow><TableHead>ID Pedido</TableHead><TableHead>Fecha</TableHead><TableHead>Cliente (Email)</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-center">Estado</TableHead></TableRow></TableHeader>
                      <TableBody>{orders.map((order) => (<TableRow key={order.id}><TableCell className="font-mono text-xs">{order.id?.substring(0,8)}...</TableCell><TableCell>{formatDate(order.createdAt)}</TableCell><TableCell>{order.shippingAddress.email}</TableCell><TableCell className="text-right">€{order.totalAmount.toFixed(2)}</TableCell><TableCell className="text-center">
                        <Select value={order.status} onValueChange={(newStatus) => handleUpdateOrderStatus(order.id!, newStatus as typeof orderStatuses[number])} disabled={isAnyActionInProgress}>
                            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Cambiar estado" /></SelectTrigger>
                            <SelectContent>{orderStatuses.map(status => (<SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>))}</SelectContent>
                        </Select>
                      </TableCell></TableRow>))}</TableBody>
                    </Table></div>)}
                </CardContent>
                <CardFooter className="border-t pt-4"><p className="text-xs text-muted-foreground">Gestión de estados de pedidos.</p></CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-headline flex items-center gap-2"><Users /> Gestión de Usuarios</CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoadingUsers || isAnyActionInProgress}><RefreshCcw className={isLoadingUsers ? "animate-spin" : ""} /> Refrescar</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoadingUsers ? (<div className="flex justify-center py-10"><Loader2 className="animate-spin mr-2" />Cargando usuarios...</div>)
                  : userManagementError ? (<Alert variant="destructive"><AlertCircle /><AlertTitle>Error</AlertTitle><AlertDescription>{userManagementError}</AlertDescription></Alert>)
                  : allUsers.length === 0 ? (<Alert><AlertCircle /><AlertTitle>No Hay Usuarios</AlertTitle><AlertDescription>No hay usuarios registrados.</AlertDescription></Alert>)
                  : (<div className="overflow-x-auto"><Table><TableCaption>Usuarios registrados en Firestore.</TableCaption><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Nombre</TableHead><TableHead className="text-center">Rol</TableHead></TableRow></TableHeader>
                      <TableBody>{allUsers.map((u) => (<TableRow key={u.uid}><TableCell className="font-medium">{u.email}</TableCell><TableCell>{u.displayName || 'N/A'}</TableCell><TableCell className="text-center">
                        <Select 
                          value={u.role || 'user'} 
                          onValueChange={(newRole) => handleUpdateUserRole(u.uid, newRole as typeof userRoles[number])} 
                          disabled={isAnyActionInProgress || u.uid === user?.uid}
                        >
                            <SelectTrigger className="w-[120px] h-9 text-xs mx-auto">
                                <SelectValue placeholder="Cambiar rol">
                                    {u.role === 'admin' ? <UserCog className="inline mr-1.5 h-3.5 w-3.5" /> : <UserCheck className="inline mr-1.5 h-3.5 w-3.5" />}
                                    {u.role}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>{userRoles.map(role => (<SelectItem key={role} value={role} className="text-xs">
                                {role === 'admin' ? <UserCog className="inline mr-1.5 h-3.5 w-3.5" /> : <UserCheck className="inline mr-1.5 h-3.5 w-3.5" />}
                                {role}
                            </SelectItem>))}</SelectContent>
                        </Select>
                        {u.uid === user?.uid && <p className="text-xs text-muted-foreground mt-1">(Tu cuenta)</p>}
                      </TableCell></TableRow>))}</TableBody>
                    </Table></div>)}
                </CardContent>
                <CardFooter className="border-t pt-4"><p className="text-xs text-muted-foreground">Gestión de roles de usuarios.</p></CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>


      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => { setIsEditModalOpen(isOpen); if (!isOpen) { setEditingProduct(null); editForm.reset(); resetImageStates();}}}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Edit/>Editar Producto</DialogTitle><DialogDescription>Modifica "{editingProduct?.name}".</DialogDescription></DialogHeader>
          <Form {...editForm}><form onSubmit={editForm.handleSubmit(handleUpdateProduct)} className="space-y-4 py-4">{renderProductFormFields(editForm, imagePreview || editingProduct?.imageUrl || null)}<DialogFooter className="mt-6"><DialogClose asChild><Button type="button" variant="ghost" disabled={isAnyActionInProgress}>Cancelar</Button></DialogClose><Button type="submit" disabled={isUploading || editForm.formState.isSubmitting || isAnyActionInProgress}>{isUploading?<Loader2 className="animate-spin"/>:<Save/>}{isUploading?'Subiendo...':'Guardar'}</Button></DialogFooter></form></Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddModalOpen} onOpenChange={(isOpen) => { setIsAddModalOpen(isOpen); if (!isOpen) { addForm.reset(); resetImageStates();}}}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><PackagePlus/>Añadir Producto</DialogTitle><DialogDescription>Completa los detalles.</DialogDescription></DialogHeader>
          <Form {...addForm}><form onSubmit={addForm.handleSubmit(handleAddNewProduct)} className="space-y-4 py-4">{renderProductFormFields(addForm, imagePreview)}<DialogFooter className="mt-6"><DialogClose asChild><Button type="button" variant="ghost" disabled={isAnyActionInProgress}>Cancelar</Button></DialogClose><Button type="submit" disabled={isUploading || addForm.formState.isSubmitting || isAnyActionInProgress}>{isUploading?<Loader2 className="animate-spin"/>:<Save/>}{isUploading?'Subiendo...':'Añadir'}</Button></DialogFooter></form></Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar "{productToDelete?.name}"?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará de Firestore y Storage.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setProductToDelete(null)} disabled={isDeletingProduct}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} disabled={isDeletingProduct || isAnyActionInProgress} className={buttonVariants({ variant: "destructive" })}>{isDeletingProduct && <Loader2 className="animate-spin"/>}{isDeletingProduct ? 'Eliminando...' : 'Eliminar'}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

