
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, PackagePlus, ListOrdered, Edit, Trash2, AlertCircle, ShoppingBasket, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
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

export default function AdminPage() {
  const { user, userProfile, isLoading: authIsLoading, isLoadingUserProfile } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    if (!authIsLoading && !isLoadingUserProfile) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (userProfile && userProfile.role !== 'admin') {
        router.push('/');
      } else if (userProfile && userProfile.role === 'admin') {
        // Fetch products if user is admin
        const fetchProducts = async () => {
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
            setProductError("Failed to load products. Ensure the 'products' collection exists and has data.");
          } finally {
            setIsLoadingProducts(false);
          }
        };
        fetchProducts();
      }
    }
  }, [user, userProfile, authIsLoading, isLoadingUserProfile, router]);

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
        <LayoutDashboard className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-muted-foreground">Acceso denegado. Redirigiendo...</p>
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
            <Button disabled> {/* Replace with actual Add Product Dialog Trigger */}
              <PackagePlus className="mr-2 h-4 w-4" /> Añadir Producto (Próximamente)
            </Button>
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
                No se encontraron productos en la base de datos. Añade algunos para empezar.
                Asegúrate de haber creado la colección 'products' en Firestore y añadido documentos.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Una lista de todos los productos disponibles.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded object-cover"
                          data-ai-hint={product.dataAiHint}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                             <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="destructive" size="icon" disabled>
                            <Trash2 className="h-4 w-4" />
                             <span className="sr-only">Delete</span>
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
