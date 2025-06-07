
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, PackagePlus, ListOrdered, Edit, Trash2, AlertCircle, ShoppingBasket, Loader2, UploadCloud, ShieldAlert, Save, ImagePlus } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, writeBatch, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import type { Product } from '@/lib/types';
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
  AlertDialogTrigger, // Keep if direct trigger is needed, otherwise not used here
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

const productCategories = ['Pizzas', 'Sides', 'Drinks', 'Desserts'] as const;
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

  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Pizzas",
      imageUrl: "",
      dataAiHint: "",
    },
  });

  const addForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Pizzas",
      imageUrl: DEFAULT_PLACEHOLDER_IMAGE, 
      dataAiHint: "",
    },
  });

  const resetImageStates = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(null);
    setIsUploading(false);
  };

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      const productsCollectionRef = collection(db, 'products');
      const q = query(productsCollectionRef, orderBy('category'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Product));
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching products for admin:", err);
      setProductError("Failed to load products. Ensure Firestore is configured correctly and the 'products' collection exists or can be created.");
    } finally {
      setIsLoadingProducts(false);
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
      }
    }
  }, [user, userProfile, authIsLoading, isLoadingUserProfile, router, fetchProducts]);

  useEffect(() => {
    if (editingProduct) {
      editForm.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category as typeof productCategories[number],
        imageUrl: editingProduct.imageUrl,
        dataAiHint: editingProduct.dataAiHint || "",
      });
      setImagePreview(editingProduct.imageUrl || null);
      setImageFile(null); 
      setUploadProgress(null);
    } else {
       editForm.reset(editForm.formState.defaultValues); 
    }
  }, [editingProduct, editForm]);


  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleImportInitialMenu = async () => {
    setIsImporting(true);
    try {
      const batch = writeBatch(db);
      const productsCollectionRef = collection(db, 'products');

      initialProductData.forEach(productData => {
        const newProductRef = doc(productsCollectionRef);
        batch.set(newProductRef, productData);
      });

      await batch.commit();
      toast({
        title: "Menú Importado",
        description: `${initialProductData.length} productos han sido importados a Firestore.`,
        variant: "default",
      });
      fetchProducts();
    } catch (error) {
      console.error("Error importing initial menu:", error);
      toast({
        title: "Error de Importación",
        description: "No se pudo importar el menú inicial. Revisa la consola para más detalles.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    addForm.reset({
        name: "",
        description: "",
        price: 0,
        category: "Pizzas",
        imageUrl: DEFAULT_PLACEHOLDER_IMAGE,
        dataAiHint: "",
    });
    resetImageStates();
    setIsAddModalOpen(true);
  };

  const handleUpdateProduct = async (formData: ProductFormValues) => {
    if (!editingProduct) return;

    setIsUploading(true);
    setUploadProgress(0);

    let finalImageUrl = editingProduct.imageUrl; 

    try {
      if (imageFile) {
        // Delete old image from storage if it's a Firebase Storage URL and not a placeholder
        if (editingProduct.imageUrl && editingProduct.imageUrl.includes("firebasestorage.googleapis.com") && editingProduct.imageUrl !== DEFAULT_PLACEHOLDER_IMAGE) {
          try {
            const oldImageRef = storageRef(storage, editingProduct.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.warn("Could not delete old image or it didn't exist:", error);
          }
        }

        const imageStoragePath = `products/${editingProduct.id}/${imageFile.name}`;
        const imageStorageRefInstance = storageRef(storage, imageStoragePath);
        const uploadTask = uploadBytesResumable(imageStorageRefInstance, imageFile);

        finalImageUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Upload failed:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      const productDataToUpdate = {
        ...formData,
        price: Number(formData.price), 
        imageUrl: finalImageUrl,
      };
      
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, productDataToUpdate);
      
      toast({
        title: "Producto Actualizado",
        description: `El producto "${productDataToUpdate.name}" ha sido actualizado.`,
      });
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetImageStates();
      fetchProducts();

    } catch (error) {
      console.error("Error updating product or uploading image:", error);
      toast({
        title: "Error al Actualizar",
        description: "No se pudo actualizar el producto. Revisa la consola.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };
  
  const handleAddNewProduct = async (formData: ProductFormValues) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const productDataForFirestore = {
        ...formData,
        price: Number(formData.price), 
        imageUrl: '', 
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'products'), productDataForFirestore);
      const newProductId = docRef.id;
      let finalImageUrl = DEFAULT_PLACEHOLDER_IMAGE;

      if (imageFile) {
        const imageStoragePath = `products/${newProductId}/${imageFile.name}`;
        const imageStorageRefInstance = storageRef(storage, imageStoragePath);
        const uploadTask = uploadBytesResumable(imageStorageRefInstance, imageFile);

        finalImageUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => { console.error("Upload failed:", error); reject(error); },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
        await updateDoc(docRef, { imageUrl: finalImageUrl });
      } else {
         await updateDoc(docRef, { imageUrl: finalImageUrl }); // Save placeholder if no image uploaded
      }
      
      toast({
        title: "Producto Añadido",
        description: `El producto "${formData.name}" ha sido añadido correctamente.`,
      });
      setIsAddModalOpen(false);
      resetImageStates();
      addForm.reset();
      fetchProducts();

    } catch (error) {
      console.error("Error adding new product or uploading image:", error);
      toast({
        title: "Error al Añadir Producto",
        description: "No se pudo añadir el producto. Revisa la consola.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleOpenDeleteAlert = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeletingProduct(true);
    try {
      // Delete image from Firebase Storage if it's a Firebase URL and not the default placeholder
      if (productToDelete.imageUrl && productToDelete.imageUrl.includes("firebasestorage.googleapis.com") && productToDelete.imageUrl !== DEFAULT_PLACEHOLDER_IMAGE) {
        try {
          const imageRef = storageRef(storage, productToDelete.imageUrl);
          await deleteObject(imageRef);
        } catch (storageError: any) {
          // Log error but continue if image deletion fails (e.g., file not found)
          console.warn(`Could not delete image ${productToDelete.imageUrl} from Storage:`, storageError);
           if (storageError.code !== 'storage/object-not-found') {
            toast({
                title: "Advertencia de eliminación de imagen",
                description: `No se pudo eliminar la imagen del almacenamiento, pero el producto se eliminará de la base de datos. Error: ${storageError.message}`,
                variant: "default", // Use default variant for warnings that are not critical
                duration: 7000,
            });
           }
        }
      }

      // Delete product document from Firestore
      await deleteDoc(doc(db, 'products', productToDelete.id));

      toast({
        title: "Producto Eliminado",
        description: `El producto "${productToDelete.name}" ha sido eliminado.`,
      });
      fetchProducts(); // Refresh product list
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error al Eliminar",
        description: `No se pudo eliminar el producto "${productToDelete.name}". Revisa la consola.`,
        variant: "destructive",
      });
    } finally {
      setIsDeletingProduct(false);
      setIsDeleteAlertOpen(false);
      setProductToDelete(null);
    }
  };


  if (authIsLoading || isLoadingUserProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando panel de administración...</p>
      </div>
    );
  }

  if (!user || (userProfile && userProfile.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-muted-foreground">Acceso denegado. Debes ser administrador.</p>
         <Button onClick={() => router.push('/')} variant="link" className="mt-4">Volver al inicio</Button>
      </div>
    );
  }

  const renderProductFormFields = (currentForm: typeof editForm | typeof addForm, currentImagePreview: string | null) => (
    <>
      <FormField
        control={currentForm.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Producto</FormLabel>
            <FormControl><Input placeholder="Ej: Pizza Margherita" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={currentForm.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl><Textarea placeholder="Describe el producto..." {...field} rows={3} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={currentForm.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio (€)</FormLabel>
              <FormControl><Input type="number" placeholder="0.00" {...field} step="0.01" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={currentForm.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormItem>
        <FormLabel>Imagen del Producto</FormLabel>
        <div className="space-y-2">
          {(currentImagePreview || (editingProduct && currentForm === editForm && editingProduct.imageUrl)) && (
            <div className="relative w-full h-48 rounded-md overflow-hidden border">
              <Image
                src={currentImagePreview || (editingProduct && currentForm === editForm ? editingProduct.imageUrl : DEFAULT_PLACEHOLDER_IMAGE)}
                alt={currentForm.getValues('name') || "Vista previa"}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          <FormControl>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                <label htmlFor="image-upload-modal" className="cursor-pointer flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />
                    {imageFile ? "Cambiar imagen" : "Subir imagen"}
                </label>
                </Button>
                <Input id="image-upload-modal" type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                {imageFile && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{imageFile.name}</span>}
            </div>
          </FormControl>
          {isUploading && uploadProgress !== null && (
            <div className="space-y-1">
                <Progress value={uploadProgress} className="w-full h-2" />
                <p className="text-xs text-muted-foreground text-center">{Math.round(uploadProgress)}% subido</p>
            </div>
          )}
        </div>
      </FormItem>

      <FormField
        control={currentForm.control}
        name="dataAiHint"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pista para IA (Opcional, 1-2 palabras)</FormLabel>
            <FormControl><Input placeholder="ej: pepperoni pizza" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );


  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="shadow-xl">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-headline flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-primary" /> Panel de Administración
              </CardTitle>
              <CardDescription>Gestiona productos, pedidos y más.</CardDescription>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={isImporting || isUploading || isDeletingProduct}>
                    {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Importar Menú Inicial
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar Importación de Menú?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esto añadirá los productos del menú inicial a la colección 'products' en Firestore.
                      Esta acción no borrará los productos existentes, solo añadirá los nuevos.
                      Asegúrate de que las reglas de seguridad de Firestore permitan la escritura.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isImporting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleImportInitialMenu} disabled={isImporting}>
                      {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Confirmar e Importar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleOpenAddModal} disabled={isImporting || isUploading || isDeletingProduct}>
                <PackagePlus className="mr-2 h-4 w-4" /> Añadir Producto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-headline mb-6 flex items-center gap-2">
            <ShoppingBasket className="h-6 w-6 text-primary" /> Lista de Productos
          </h2>
          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          ) : productError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error al Cargar Productos</AlertTitle>
              <AlertDescription>{productError}</AlertDescription>
            </Alert>
          ) : products.length === 0 ? (
             <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Hay Productos</AlertTitle>
              <AlertDescription>
                No se encontraron productos en la base de datos. Puedes usar "Importar Menú Inicial" o "Añadir Producto".
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Una lista de todos los productos disponibles en Firestore.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px] sm:w-[80px]">Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Categoría</TableHead>
                    <TableHead className="hidden lg:table-cell max-w-[300px] truncate">Descripción</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          src={product.imageUrl || DEFAULT_PLACEHOLDER_IMAGE}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded object-cover"
                          data-ai-hint={product.dataAiHint}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                       <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[300px] truncate" title={product.description}>
                        {product.description}
                      </TableCell>
                      <TableCell className="text-right">€{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleOpenEditModal(product)} disabled={isUploading || isDeletingProduct}>
                            <Edit className="h-4 w-4" />
                             <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleOpenDeleteAlert(product)} disabled={isUploading || isDeletingProduct}>
                            <Trash2 className="h-4 w-4" />
                             <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
                Gestión completa de productos (CRUD).
            </p>
        </CardFooter>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
        setIsEditModalOpen(isOpen);
        if (!isOpen) {
          setEditingProduct(null); 
          editForm.reset();
          resetImageStates();
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5"/> Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica los detalles del producto "{editingProduct?.name}". Haz clic en guardar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateProduct)} className="space-y-4 py-4">
              {renderProductFormFields(editForm, imagePreview || editingProduct?.imageUrl || null)}
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" disabled={isUploading || isDeletingProduct}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isUploading || editForm.formState.isSubmitting || isDeletingProduct}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Subiendo...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={(isOpen) => {
        setIsAddModalOpen(isOpen);
        if (!isOpen) {
          addForm.reset();
          resetImageStates();
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PackagePlus className="h-5 w-5"/> Añadir Nuevo Producto</DialogTitle>
            <DialogDescription>
              Completa los detalles para añadir un nuevo producto al menú.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddNewProduct)} className="space-y-4 py-4">
              {renderProductFormFields(addForm, imagePreview)}
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" disabled={isUploading || isDeletingProduct}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isUploading || addForm.formState.isSubmitting || isDeletingProduct}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Subiendo...' : 'Añadir Producto'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto "{productToDelete?.name}" de la base de datos y su imagen asociada del almacenamiento (si existe).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)} disabled={isDeletingProduct}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isDeletingProduct}
              className={buttonVariants({ variant: "destructive" })}
            >
              {isDeletingProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isDeletingProduct ? 'Eliminando...' : 'Eliminar Producto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}


    