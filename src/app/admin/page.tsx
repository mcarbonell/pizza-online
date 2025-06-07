
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, PackagePlus, ListOrdered, Edit, Trash2, AlertCircle, ShoppingBasket, Loader2, UploadCloud, ShieldAlert, Save, ImagePlus } from 'lucide-react';
import { db, storage } from '@/lib/firebase'; // Import storage
import { collection, getDocs, query, orderBy, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Storage imports
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress"; // Import Progress component

const productCategories = ['Pizzas', 'Sides', 'Drinks', 'Desserts'] as const;

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
  // imageUrl is still a string, as it stores the download URL. The file upload will populate this.
  imageUrl: z.string().url({ message: "Se requiere una URL de imagen válida o subir una nueva imagen." }).or(z.literal('')),
  dataAiHint: z.string().optional(),
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

  // States for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);


  const form = useForm<ProductFormValues>({
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

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      const productsCollection = collection(db, 'products');
      const q = query(productsCollection, orderBy('category'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category as typeof productCategories[number],
        imageUrl: editingProduct.imageUrl, // This will be the current URL
        dataAiHint: editingProduct.dataAiHint || "",
      });
      setImageFile(null); // Reset file states when a new product is selected for editing
      setImagePreview(null);
      setUploadProgress(null);
    }
  }, [editingProduct, form]);


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
      const productsCollection = collection(db, 'products');

      initialProductData.forEach(productData => {
        const newProductRef = doc(productsCollection); 
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

  const handleUpdateProduct = async (formData: ProductFormValues) => {
    if (!editingProduct) return;

    setIsUploading(true); // Indicate start of general update process
    setUploadProgress(0); // Reset progress for potential new upload

    let finalImageUrl = formData.imageUrl; // Use existing imageUrl from form by default

    try {
      if (imageFile) { // If a new file was selected for upload
        const imageStorageRef = storageRef(storage, `products/${editingProduct.id}/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(imageStorageRef, imageFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Upload failed:", error);
              toast({
                title: "Error al Subir Imagen",
                description: "No se pudo subir la nueva imagen. Verifica las reglas de Storage y la consola.",
                variant: "destructive",
              });
              reject(error);
            },
            async () => {
              finalImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      // Prepare data for Firestore update, ensuring imageUrl is the potentially new one
      const productDataToUpdate: ProductFormValues = {
        ...formData,
        imageUrl: finalImageUrl,
      };
      
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, productDataToUpdate);
      
      toast({
        title: "Producto Actualizado",
        description: `El producto "${productDataToUpdate.name}" ha sido actualizado correctamente.`,
        variant: "default",
      });
      setIsEditModalOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview(null);
      fetchProducts();

    } catch (error) {
      // This catch block handles errors from Firestore update or from the image upload promise rejection
      console.error("Error updating product or uploading image:", error);
      toast({
        title: "Error al Actualizar",
        description: "No se pudo actualizar el producto. Revisa la consola para más detalles.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
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
                  <Button variant="outline" disabled={isImporting}>
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
                      Asegúrate de que las reglas de seguridad de Firestore permitan la escritura en la colección 'products' para administradores.
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
              <Button disabled>
                <PackagePlus className="mr-2 h-4 w-4" /> Añadir Producto (Próximamente)
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
                No se encontraron productos en la base de datos. Puedes usar el botón "Importar Menú Inicial"
                para cargar el conjunto de productos predefinido o añadir productos individualmente (próximamente).
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
                          src={product.imageUrl || 'https://placehold.co/80x80.png'}
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
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleOpenEditModal(product)}>
                            <Edit className="h-4 w-4" />
                             <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" disabled>
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
                Funcionalidades CRUD para productos y gestión de pedidos se añadirán próximamente.
            </p>
        </CardFooter>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
        setIsEditModalOpen(isOpen);
        if (!isOpen) {
          setEditingProduct(null);
          form.reset();
          setImageFile(null);
          setImagePreview(null);
          setUploadProgress(null);
          setIsUploading(false);
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5"/> Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica los detalles del producto "{editingProduct?.name}". Haz clic en guardar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateProduct)} className="space-y-4 py-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio ($)</FormLabel>
                      <FormControl><Input type="number" placeholder="0.00" {...field} step="0.01" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
              
              {/* Image Upload Section */}
              <FormItem>
                <FormLabel>Imagen del Producto</FormLabel>
                <div className="space-y-2">
                  {(imagePreview || (editingProduct && editingProduct.imageUrl)) && (
                    <div className="relative w-full h-48 rounded-md overflow-hidden border">
                      <Image
                        src={imagePreview || editingProduct?.imageUrl || 'https://placehold.co/600x400.png'}
                        alt={editingProduct?.name || "Vista previa"}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                  <FormControl>
                    <div className="flex items-center gap-2">
                       <Button type="button" variant="outline" size="sm" asChild>
                        <label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2">
                           <ImagePlus className="h-4 w-4" />
                           {imageFile ? "Cambiar imagen" : "Subir imagen"}
                        </label>
                      </Button>
                      <Input id="image-upload" type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                      {imageFile && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{imageFile.name}</span>}
                    </div>
                  </FormControl>
                  {isUploading && uploadProgress !== null && (
                    <div className="space-y-1">
                       <Progress value={uploadProgress} className="w-full h-2" />
                       <p className="text-xs text-muted-foreground text-center">{Math.round(uploadProgress)}% subido</p>
                    </div>
                  )}
                  <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="dataAiHint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pista para IA (Opcional, 1-2 palabras)</FormLabel>
                    <FormControl><Input placeholder="ej: pepperoni pizza" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isUploading || form.formState.isSubmitting}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Subiendo...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
