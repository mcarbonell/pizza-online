
"use client";

import type { Product, ExtraItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { PlusCircle, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import CustomizePizzaDialog from './CustomizePizzaDialog'; // Ensure this path is correct

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);

  const handleOpenCustomizeDialog = () => {
    if (product.category === 'Pizzas') {
      setIsCustomizeDialogOpen(true);
    } else {
      // For non-pizza items, add directly to cart without customization
      addToCart(product, []);
      toast({
        title: `¡${product.name} añadido al carrito!`,
        description: "Puedes ver tu carrito o seguir comprando.",
      });
    }
  };

  const handleAddToCartWithExtras = (customizedProduct: Product, extras: ExtraItem[]) => {
    addToCart(customizedProduct, extras); // product here is the base product, extras are selected
    toast({
      title: `¡${customizedProduct.name} ${extras.length > 0 ? '(con extras)' : ''} añadido al carrito!`,
      description: "Puedes ver tu carrito o seguir comprando.",
    });
    setIsCustomizeDialogOpen(false);
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
        <CardHeader className="p-0 relative aspect-video">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            data-ai-hint={product.dataAiHint}
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-2xl mb-2">{product.name}</CardTitle>
          <CardDescription className="font-body text-sm text-muted-foreground mb-3 h-12 overflow-hidden text-ellipsis">
            {product.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center border-t">
          <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
          <Button 
            variant="default" 
            onClick={handleOpenCustomizeDialog} 
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {product.category === 'Pizzas' ? <Settings2 className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {product.category === 'Pizzas' ? 'Personalizar' : 'Añadir'}
          </Button>
        </CardFooter>
      </Card>

      {product.category === 'Pizzas' && (
        <CustomizePizzaDialog
          product={product}
          isOpen={isCustomizeDialogOpen}
          onClose={() => setIsCustomizeDialogOpen(false)}
          onAddToCart={handleAddToCartWithExtras}
        />
      )}
    </>
  );
}
