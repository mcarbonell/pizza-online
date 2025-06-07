
"use client";

import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: `¡${product.name} añadido al carrito!`,
      description: "Puedes ver tu carrito o seguir comprando.",
    });
  };

  return (
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
        <CardDescription className="font-body text-sm text-muted-foreground mb-3">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
        <Button variant="default" onClick={handleAddToCart} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
