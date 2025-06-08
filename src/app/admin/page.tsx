
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { LayoutDashboard, PackagePlus, ListOrdered, Edit, Trash2, AlertCircle, ShoppingBasket, Loader2, UploadCloud, ShieldAlert, Save, ImagePlus, ClipboardList, RefreshCcw, Users, UserCheck, UserCog, MapPin, Sprout, Info } from 'lucide-react'; // Added Sprout for allergens
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, writeBatch, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import type { Product, Order, UserProfile, ProductCategory, OrderStatus, AllergenCode, ProductSeedData } from '@/lib/types';
import { translateOrderStatus } from '@/lib/types'; 
import { initialProductData } from '@/data/products';
import { ALLERGEN_LIST, COMMON_PIZZA_ALLERGENS } from '@/data/allergens';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getDownloadURL, ref as storageRef, uploadBytesResumable, deleteObject } from "firebase/storage";

import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription as ShadDialogDescription, // Renamed to avoid conflict
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
import { ScrollArea } from '@/components/ui/scroll-area';

const productCategories: ProductCategory[] = ['Pizzas', 'Sides', 'Drinks', 'Desserts'];
const orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled', 'PaymentFailed'];
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
  category: z.custom<ProductCategory>((val) => productCategories.includes(val as ProductCategory), {
    message: "Por favor selecciona una categoría válida.",
  }),
  imageUrl: z.string().url({ message: "Se requiere una URL de imagen válida." }).optional().or(z.literal('')),
  dataAiHint: z.string().max(30, "La pista de IA no debe exceder los 30 caracteres.").optional(),
  allergens: z.array(z.string()).optional(), // Array of AllergenCode strings
});

type ProductFormValues = z.infer<typeof productFormSchema>;


export default function AdminPage() {
  const { user, userProfile, isLoading: authIsLoading, isLoadingUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [isSyncingMenu, setIsSyncingMenu] = useState(false);
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

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false);
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userManagementError, setUserManagementError] = useState<string | null>(null);
  const [isUpdatingUserRole, setIsUpdatingUserRole] = useState(false);

  const activeWatchIdsRef = useRef<Record<string, number>>({});


  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: "", description: "", price: 0, category: "Pizzas", imageUrl: "", dataAiHint: "", allergens: [] },
  });

  const addForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: "", description: "", price: 0, category: "Pizzas", imageUrl: DEFAULT_PLACEHOLDER_IMAGE, dataAiHint: "", allergens: [] },
  });

  const watchedCategoryAddForm = addForm.watch("category");
  useEffect(() => {
    if (isAddModalOpen) { 
      if (watchedCategoryAddForm === "Pizzas") {
        addForm.setValue("allergens", [...COMMON_PIZZA_ALLERGENS], { shouldValidate: true });
      } else {
        const currentAllergens = addForm.getValues("allergens") || [];
        const allergensToRemove = COMMON_PIZZA_ALLERGENS.filter(ca => products.find(p => p.category !== "Pizzas" && p.allergens?.includes(ca)) === undefined); 
        const newAllergens = currentAllergens.filter(a => !allergensToRemove.includes(a as AllergenCode));
        if (newAllergens.length !== currentAllergens.length) {
             addForm.setValue("allergens", newAllergens, { shouldValidate: true });
        }
      }
    }
  }, [watchedCategoryAddForm, addForm, isAddModalOpen, products]);


  const resetImageStates = () => { setImageFile(null); setImagePreview(null); setUploadProgress(null); setIsUploading(false); };

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true); setProductError(null);
    try {
      const q = query(collection(db, 'products'), orderBy('category'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Product)));
    } catch (err) { console.error("Error fetching products for admin:", err); setProductError("Failed to load products."); } 
    finally { setIsLoadingProducts(false); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true); setOrderError(null);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Order)));
    } catch (err) { console.error("Error fetching orders for admin:", err); setOrderError("Failed to load orders."); }
    finally { setIsLoadingOrders(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true); setUserManagementError(null);
    try {
      const q = query(collection(db, 'users'), orderBy('email'));
      const querySnapshot = await getDocs(q);
      setAllUsers(querySnapshot.docs.map(docSnap => ({ ...docSnap.data() } as UserProfile)));
    } catch (err) { console.error("Error fetching users for admin:", err); setUserManagementError("Failed to load users."); }
    finally { setIsLoadingUsers(false); }
  }, []);


  useEffect(() => {
    if (!authIsLoading && !isLoadingUserProfile) {
      if (!user) { router.push('/login?redirect=/admin'); } 
      else if (userProfile && userProfile.role !== 'admin') { router.push('/'); } 
      else if (userProfile && userProfile.role === 'admin') { fetchProducts(); fetchOrders(); fetchUsers(); }
    }
  }, [user, userProfile, authIsLoading, isLoadingUserProfile, router, fetchProducts, fetchOrders, fetchUsers]);

  useEffect(() => {
    if (editingProduct) {
      editForm.reset({ 
        name: editingProduct.name, 
        description: editingProduct.description, 
        price: editingProduct.price, 
        category: editingProduct.category, 
        imageUrl: editingProduct.imageUrl, 
        dataAiHint: editingProduct.dataAiHint || "", 
        allergens: editingProduct.allergens || [] 
      });
      setImagePreview(editingProduct.imageUrl || null); resetImageStates();
    } else { editForm.reset(editForm.formState.defaultValues); }
  }, [editingProduct, editForm]);
  
  useEffect(() => {
    return () => {
      Object.values(activeWatchIdsRef.current).forEach(watchId => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
      });
      activeWatchIdsRef.current = {};
    };
  }, []);


  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); } 
    else { setImageFile(null); setImagePreview(null); }
  };

  const handleSyncMenuFromFile = async () => {
    setIsSyncingMenu(true);
    try {
      const productsCollectionRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsCollectionRef);
      const existingProducts = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Product));
      
      const batch = writeBatch(db);
      let addedCount = 0;
      let updatedCount = 0;

      for (const productSeed of initialProductData) {
        const existingProduct = existingProducts.find(p => p.name === productSeed.name && p.category === productSeed.category);

        if (existingProduct) {
          // Product exists, update it
          const productRef = doc(db, 'products', existingProduct.id);
          const updateData: Partial<Product> = { // Use Partial<Product> for update
            name: productSeed.name,
            description: productSeed.description,
            price: productSeed.price,
            category: productSeed.category,
            dataAiHint: productSeed.dataAiHint,
            allergens: productSeed.allergens || [],
            updatedAt: serverTimestamp(),
          };

          // Protect existing non-placeholder image
          if (existingProduct.imageUrl && 
              !existingProduct.imageUrl.includes('placehold.co') && 
              productSeed.imageUrl && 
              productSeed.imageUrl.includes('placehold.co')) {
            updateData.imageUrl = existingProduct.imageUrl;
          } else {
            updateData.imageUrl = productSeed.imageUrl;
          }
          
          batch.update(productRef, updateData);
          updatedCount++;
        } else {
          // Product does not exist, create it
          const productRef = doc(collection(db, 'products'));
          const dataToAdd: Omit<Product, 'id'> & { createdAt: any, updatedAt: any } = {
            ...productSeed,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          batch.set(productRef, dataToAdd);
          addedCount++;
        }
      }

      await batch.commit();
      toast({ 
        title: "Menú Sincronizado", 
        description: `${addedCount} productos añadidos, ${updatedCount} productos actualizados desde el archivo.` 
      });
      fetchProducts();
    } catch (error) { 
      console.error("Error syncing menu from file:", error); 
      toast({ title: "Error de Sincronización", description: "No se pudo sincronizar el menú.", variant: "destructive" }); 
    } finally { 
      setIsSyncingMenu(false); 
    }
  };


  const handleOpenEditModal = (product: Product) => { setEditingProduct(product); setIsEditModalOpen(true); };
  const handleOpenAddModal = () => { 
    addForm.reset({ name: "", description: "", price: 0, category: "Pizzas", imageUrl: DEFAULT_PLACEHOLDER_IMAGE, dataAiHint: "", allergens: [] });
    resetImageStates(); 
    setIsAddModalOpen(true); 
    addForm.setValue("category", "Pizzas", { shouldValidate: true, shouldDirty: true });
  };
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
        const imageRef = storageRef(storage, `products/${editingProduct.id}/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(imageRef, imageFile);
        finalImageUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed', (s) => setUploadProgress((s.bytesTransferred / s.totalBytes) * 100), reject, async () => resolve(await getDownloadURL(uploadTask.snapshot.ref)));
        });
      }
      const dataToUpdate = { ...formData, price: Number(formData.price), imageUrl: finalImageUrl, allergens: formData.allergens || [], updatedAt: serverTimestamp() };
      await updateDoc(doc(db, 'products', editingProduct.id), dataToUpdate);
      toast({ title: "Producto Actualizado", description: `"${formData.name}" actualizado.` });
      setIsEditModalOpen(false); setEditingProduct(null); resetImageStates(); fetchProducts();
    } catch (error) { console.error("Error updating product:", error); toast({ title: "Error al Actualizar", description: "No se pudo actualizar.", variant: "destructive" }); } 
    finally { setIsUploading(false); setUploadProgress(null); }
  };
  
  const handleAddNewProduct = async (formData: ProductFormValues) => {
    setIsUploading(true); setUploadProgress(0);
    try {
      const dataToAdd = { ...formData, price: Number(formData.price), imageUrl: '', allergens: formData.allergens || [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
      const newDocRef = await addDoc(collection(db, 'products'), dataToAdd);
      let finalImageUrl = DEFAULT_PLACEHOLDER_IMAGE;
      if (imageFile) {
        const imageRef = storageRef(storage, `products/${newDocRef.id}/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(imageRef, imageFile);
        finalImageUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed', (s) => setUploadProgress((s.bytesTransferred / s.totalBytes) * 100), reject, async () => resolve(await getDownloadURL(uploadTask.snapshot.ref)));
        });
      }
      await updateDoc(newDocRef, { imageUrl: finalImageUrl });
      toast({ title: "Producto Añadido", description: `"${formData.name}" añadido.` });
      setIsAddModalOpen(false); resetImageStates(); addForm.reset(); fetchProducts();
    } catch (error) { console.error("Error adding product:", error); toast({ title: "Error al Añadir", description: "No se pudo añadir.", variant: "destructive" }); }
    finally { setIsUploading(false); setUploadProgress(null); }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      if (productToDelete.imageUrl && productToDelete.imageUrl.includes("firebasestorage.googleapis.com") && productToDelete.imageUrl !== DEFAULT_PLACEHOLDER_IMAGE) {
        try { await deleteObject(storageRef(storage, productToDelete.imageUrl)); } 
        catch (storageError: any) { console.warn(`Could not delete image ${productToDelete.imageUrl}:`, storageError); if (storageError.code !== 'storage/object-not-found') { toast({ title: "Advertencia", description: `Imagen no eliminada: ${storageError.message}`, duration: 7000 }); } }
      }
      await deleteDoc(doc(db, 'products', productToDelete.id));
      toast({ title: "Producto Eliminado", description: `"${productToDelete.name}" eliminado.` });
      fetchProducts();
    } catch (error: any) { console.error("Error deleting product:", error); toast({ title: "Error al Eliminar", description: `No se pudo eliminar "${productToDelete.name}".`, variant: "destructive" }); }
    finally { setIsDeletingProduct(false); setIsDeleteAlertOpen(false); setProductToDelete(null); }
  };

  const startDeliveryTracking = (orderId: string) => {
    if (!navigator.geolocation) {
      toast({ title: "Error GPS", description: "Geolocalización no soportada por este navegador.", variant: "destructive" });
      return;
    }
    if (activeWatchIdsRef.current[orderId]) { 
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            deliveryLocation: { latitude, longitude, timestamp: serverTimestamp() },
            updatedAt: serverTimestamp(), 
          });
          console.log(`Location sent for order ${orderId}: ${latitude}, ${longitude}`);
        } catch (error) {
          console.error(`Error updating location for order ${orderId}:`, error);
          toast({ title: "Error GPS", description: "No se pudo enviar la ubicación.", variant: "destructive" });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let message = "Error al obtener la ubicación.";
        if (error.code === error.PERMISSION_DENIED) message = "Permiso de ubicación denegado.";
        else if (error.code === error.POSITION_UNAVAILABLE) message = "Información de ubicación no disponible.";
        else if (error.code === error.TIMEOUT) message = "Timeout al obtener la ubicación.";
        toast({ title: "Error GPS", description: message, variant: "destructive" });
        stopDeliveryTracking(orderId); 
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    activeWatchIdsRef.current = { ...activeWatchIdsRef.current, [orderId]: watchId };
    toast({ title: "Seguimiento Iniciado", description: `Reparto del pedido #${orderId.substring(0,6)}... en curso.` });
  };

  const stopDeliveryTracking = async (orderId: string) => {
    const watchId = activeWatchIdsRef.current[orderId];
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      const {[orderId]: _, ...rest} = activeWatchIdsRef.current; 
      activeWatchIdsRef.current = rest;
    }
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        deliveryLocation: null, 
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Seguimiento Detenido", description: `Seguimiento para pedido #${orderId.substring(0,6)}... finalizado.` });
    } catch (error) {
      console.error(`Error clearing location for order ${orderId}:`, error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingOrderStatus(true);
    const orderToUpdate = orders.find(o => o.id === orderId);
    const oldStatus = orderToUpdate?.status;

    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus, updatedAt: serverTimestamp() });
      toast({ title: "Estado del Pedido Actualizado", description: `El pedido #${orderId.substring(0,6)}... ahora está ${translateOrderStatus(newStatus)}.` });
      
      if (newStatus === 'Out for Delivery') {
        startDeliveryTracking(orderId);
      } else if (oldStatus === 'Out for Delivery' && newStatus !== 'Out for Delivery') {
        await stopDeliveryTracking(orderId); 
      }
      
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
    } catch (error) { console.error("Error updating user role:", error); toast({ title: "Error al Actualizar Rol", description: "No se pudo actualizar el rol del usuario.", variant: "destructive" }); } 
    finally { setIsUpdatingUserRole(false); }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate ? timestamp.toDate().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Fecha inválida';
  };

  if (authIsLoading || isLoadingUserProfile) { return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p>Cargando...</p></div>; }
  if (!user || (userProfile && userProfile.role !== 'admin')) { return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"><ShieldAlert className="h-12 w-12 text-destructive mb-4" /><p>Acceso denegado.</p><Button onClick={() => router.push('/')} variant="link">Inicio</Button></div>; }

  const isAnyActionInProgress = isSyncingMenu || isUploading || isDeletingProduct || isUpdatingOrderStatus || isUpdatingUserRole;

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
      
      <FormField
        control={currentForm.control}
        name="allergens"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1.5"><Sprout className="h-4 w-4"/>Alérgenos</FormLabel>
            <ScrollArea className="h-40 border rounded-md p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {ALLERGEN_LIST.map((allergenInfo) => (
                  <FormField
                    key={allergenInfo.code}
                    control={currentForm.control}
                    name="allergens"
                    render={() => { 
                      return (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(allergenInfo.code)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                return checked
                                  ? field.onChange([...currentValues, allergenInfo.code])
                                  : field.onChange(
                                      currentValues.filter(
                                        (value) => value !== allergenInfo.code
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm cursor-pointer" title={allergenInfo.description}>
                            {allergenInfo.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <Card className="shadow-xl">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-3xl font-headline flex items-center gap-2"><LayoutDashboard /> Panel Admin</CardTitle>
          <ShadDialogDescription>Gestiona productos, pedidos y usuarios.</ShadDialogDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="orders"><ClipboardList className="mr-2 h-5 w-5"/>Pedidos</TabsTrigger>
              <TabsTrigger value="users"><Users className="mr-2 h-5 w-5"/>Usuarios</TabsTrigger>
              <TabsTrigger value="products"><ShoppingBasket className="mr-2 h-5 w-5"/>Productos</TabsTrigger>
            </TabsList>

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
                  : (<div className="overflow-x-auto"><Table><TableCaption>Pedidos registrados en Firestore.</TableCaption><TableHeader><TableRow><TableHead>ID Pedido</TableHead><TableHead>Fecha</TableHead><TableHead>Cliente (Email)</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-center">Estado</TableHead><TableHead className="text-center">GPS</TableHead></TableRow></TableHeader>
                      <TableBody>{orders.map((order) => (<TableRow key={order.id}><TableCell className="font-mono text-xs">{order.id?.substring(0,8)}...</TableCell><TableCell>{formatDate(order.createdAt)}</TableCell><TableCell>{order.shippingAddress.email}</TableCell><TableCell className="text-right">€{order.totalAmount.toFixed(2)}</TableCell><TableCell className="text-center">
                        <Select value={order.status} onValueChange={(newStatus) => handleUpdateOrderStatus(order.id!, newStatus as OrderStatus)} disabled={isAnyActionInProgress}>
                            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Cambiar estado" /></SelectTrigger>
                            <SelectContent>{orderStatuses.map(status => (<SelectItem key={status} value={status} className="text-xs">{translateOrderStatus(status)}</SelectItem>))}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        {order.status === 'Out for Delivery' ? (
                            activeWatchIdsRef.current[order.id!] ? (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Enviando <MapPin className="ml-1 h-3 w-3"/></Badge>
                            ) : (
                                <Badge variant="outline">Inactivo</Badge>
                            )
                        ) : (
                            <Badge variant="secondary">N/A</Badge>
                        )}
                      </TableCell>
                      </TableRow>))}</TableBody>
                    </Table></div>)}
                </CardContent>
                <CardFooter className="border-t pt-4"><p className="text-xs text-muted-foreground">Gestión de estados de pedidos y seguimiento GPS.</p></CardFooter>
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
                        <Select value={u.role || 'user'} onValueChange={(newRole) => handleUpdateUserRole(u.uid, newRole as typeof userRoles[number])} disabled={isAnyActionInProgress || u.uid === user?.uid}>
                            <SelectTrigger className="w-[120px] h-9 text-xs mx-auto"><SelectValue placeholder="Cambiar rol">{u.role === 'admin' ? <UserCog className="inline mr-1.5 h-3.5 w-3.5" /> : <UserCheck className="inline mr-1.5 h-3.5 w-3.5" />}{u.role}</SelectValue></SelectTrigger>
                            <SelectContent>{userRoles.map(role => (<SelectItem key={role} value={role} className="text-xs">{role === 'admin' ? <UserCog className="inline mr-1.5 h-3.5 w-3.5" /> : <UserCheck className="inline mr-1.5 h-3.5 w-3.5" />}{role}</SelectItem>))}</SelectContent>
                        </Select>
                        {u.uid === user?.uid && <p className="text-xs text-muted-foreground mt-1">(Tu cuenta)</p>}
                      </TableCell></TableRow>))}</TableBody>
                    </Table></div>)}
                </CardContent>
                <CardFooter className="border-t pt-4"><p className="text-xs text-muted-foreground">Gestión de roles de usuarios.</p></CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div><CardTitle className="text-2xl font-headline flex items-center gap-2"><ShoppingBasket />Gestión de Productos</CardTitle><ShadDialogDescription>Añade, edita o elimina productos del menú.</ShadDialogDescription></div>
                    <div className="flex gap-2">
                      <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" disabled={isAnyActionInProgress}><UploadCloud className="mr-2"/>Sincr. Menú</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Confirmar Sincronización de Menú?</AlertDialogTitle>
                            <AlertDialogDescription>
                              <div>
                                <div className="mb-2">Esta acción comparará los productos del archivo de datos inicial (`src/data/products.ts`) con los productos existentes en Firestore.</div>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  <li><Info className="inline h-4 w-4 mr-1 text-blue-500"/>Los productos nuevos del archivo se añadirán a Firestore.</li>
                                  <li><Info className="inline h-4 w-4 mr-1 text-orange-500"/>Los productos existentes en Firestore que también estén en el archivo se actualizarán (incluyendo alérgenos).</li>
                                  <li><Info className="inline h-4 w-4 mr-1 text-green-500"/>Las imágenes ya subidas a Firebase Storage se protegerán y no se sobrescribirán con placeholders del archivo.</li>
                                  <li><Info className="inline h-4 w-4 mr-1 text-red-500"/>Esta acción no elimina productos de Firestore que no estén en el archivo.</li>
                                </ul>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSyncingMenu}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSyncMenuFromFile} disabled={isSyncingMenu}>
                              {isSyncingMenu && <Loader2 className="animate-spin mr-2"/>}
                              {isSyncingMenu ? 'Sincronizando...' : 'Confirmar Sincronización'}
                            </AlertDialogAction>
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
                  : products.length === 0 ? (<Alert><AlertCircle /><AlertTitle>No Hay Productos</AlertTitle><AlertDescription>Usa "Sincronizar Menú" o "Añadir Producto".</AlertDescription></Alert>)
                  : (<div className="overflow-x-auto"><Table><TableCaption>Productos en Firestore.</TableCaption><TableHeader><TableRow><TableHead>Imagen</TableHead><TableHead>Nombre</TableHead><TableHead className="hidden md:table-cell">Categoría</TableHead><TableHead className="hidden lg:table-cell max-w-[300px] truncate">Descripción</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-center">Acciones</TableHead></TableRow></TableHeader>
                      <TableBody>{products.map((p) => (<TableRow key={p.id}><TableCell><Image src={p.imageUrl || DEFAULT_PLACEHOLDER_IMAGE} alt={p.name} width={48} height={48} className="rounded object-cover" data-ai-hint={p.dataAiHint}/></TableCell><TableCell className="font-medium">{p.name}</TableCell><TableCell className="hidden md:table-cell"><Badge variant="secondary">{p.category}</Badge></TableCell><TableCell className="hidden lg:table-cell text-xs max-w-[300px] truncate" title={p.description}>{p.description}</TableCell><TableCell className="text-right">€{p.price.toFixed(2)}</TableCell><TableCell className="text-center"><div className="flex justify-center gap-1 sm:gap-2"><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(p)} disabled={isAnyActionInProgress}><Edit /></Button><Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleOpenDeleteAlert(p)} disabled={isAnyActionInProgress}><Trash2 /></Button></div></TableCell></TableRow>))}</TableBody>
                    </Table></div>)}
                </CardContent>
                <CardFooter className="border-t pt-4"><p className="text-xs text-muted-foreground">Gestión CRUD de productos.</p></CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => { setIsEditModalOpen(isOpen); if (!isOpen) { setEditingProduct(null); editForm.reset(); resetImageStates();}}}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Edit/>Editar Producto</DialogTitle><ShadDialogDescription>Modifica "{editingProduct?.name}".</ShadDialogDescription></DialogHeader>
          <Form {...editForm}><form onSubmit={editForm.handleSubmit(handleUpdateProduct)} className="space-y-4 py-4">{renderProductFormFields(editForm, imagePreview || editingProduct?.imageUrl || null)}<DialogFooter className="mt-6"><DialogClose asChild><Button type="button" variant="ghost" disabled={isAnyActionInProgress}>Cancelar</Button></DialogClose><Button type="submit" disabled={isUploading || editForm.formState.isSubmitting || isAnyActionInProgress}>{isUploading?<Loader2 className="animate-spin"/>:<Save/>}{isUploading?'Subiendo...':'Guardar'}</Button></DialogFooter></form></Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddModalOpen} onOpenChange={(isOpen) => { setIsAddModalOpen(isOpen); if (!isOpen) { addForm.reset(); resetImageStates();}}}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><PackagePlus/>Añadir Producto</DialogTitle><ShadDialogDescription>Completa los detalles.</ShadDialogDescription></DialogHeader>
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

    

    
