
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';
import CartSidebar from '@/components/cart/CartSidebar';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productsCollection = collection(db, 'products');
        // Optionally, order products by name or another field
        const q = query(productsCollection, orderBy('category'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("No se pudieron cargar los productos. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const pizzaProducts = products.filter(p => p.category === 'Pizzas');
  const sideProducts = products.filter(p => p.category === 'Sides');
  const drinkProducts = products.filter(p => p.category === 'Drinks');
  const dessertProducts = products.filter(p => p.category === 'Desserts');

  const renderProductSection = (title: string, items: Product[]) => {
    if (isLoading) {
      return (
        <section className="mb-12">
          <h2 className="text-4xl font-headline mb-8 text-center text-primary">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[225px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-10 w-[150px] self-end" />
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (!items || items.length === 0) {
       return null; // Don't render section if no items and not loading (e.g. after fetch)
    }

    return (
      <section className="mb-12">
        <h2 className="text-4xl font-headline mb-8 text-center text-primary">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  };


  return (
    <div className="relative">
      <div className="py-8">
        <h1 className="text-5xl font-headline mb-12 text-center text-primary drop-shadow-sm">
          ¡Bienvenido a Pizzería Serranillo!
        </h1>
        <p className="text-xl font-body text-center mb-12 text-foreground/80 max-w-2xl mx-auto">
          Disfruta de nuestras deliciosas pizzas recién hechas, sabrosos acompañamientos, bebidas refrescantes y postres encantadores. ¡Haz tu pedido ahora para una experiencia de sabor inolvidable!
        </p>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!isLoading && products.length === 0 && !error && (
            <Alert className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Hay Productos Disponibles</AlertTitle>
                <AlertDescription>
                    Parece que no hay productos en el menú en este momento. ¡Por favor, vuelve más tarde!
                    Si eres administrador, añade productos a la colección 'products' en Firestore.
                </AlertDescription>
            </Alert>
        )}

        {renderProductSection("Nuestras Famosas Pizzas", pizzaProducts)}
        {renderProductSection("Acompañamientos Deliciosos", sideProducts)}
        {renderProductSection("Bebidas Refrescantes", drinkProducts)}
        {renderProductSection("Postres Dulces", dessertProducts)}
      </div>
      <CartSidebar />
    </div>
  );
}
