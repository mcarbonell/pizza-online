
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, PackagePlus, ListOrdered, Edit, Trash2, AlertCircle, ShoppingBasket, Loader2, UploadCloud, ShieldAlert } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, writeBatch, addDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { initialProductData } from '@/data/products'; // Import new initial data
import { useToast } from '@/hooks/use-toast';

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


export default function AdminPage() {
  const { user, userProfile, isLoading: authIsLoading, isLoadingUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

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

  const handleImportInitialMenu = async () => {
    setIsImporting(true);
    try {
      const batch = writeBatch(db);
      const productsCollection = collection(db, 'products');
      
      initialProductData.forEach(productData => {
        const newProductRef = doc(productsCollection); // Firestore generates ID
        batch.set(newProductRef, productData);
      });

      await batch.commit();
      toast({
        title: "Menú Importado",
        description: `${initialProductData.length} productos han sido importados a Firestore.`,
        variant: "default",
      });
      fetchProducts(); // Refresh product list
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
                          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" disabled>
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
    </div>
  );
}
