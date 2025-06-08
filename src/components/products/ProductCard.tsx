
"use client";

import type { Product, ExtraItem, AllergenCode, AllergenDisplayInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { PlusCircle, Settings2, Info } from 'lucide-react'; // Added Info icon for tooltips
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import CustomizePizzaDialog from './CustomizePizzaDialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ALLERGEN_LIST } from '@/data/allergens'; // Import the allergen list

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
      addToCart(product, []);
      toast({
        title: `¡${product.name} añadido al carrito!`,
        description: "Puedes ver tu carrito o seguir comprando.",
      });
    }
  };

  const handleAddToCartWithExtras = (customizedProduct: Product, extras: ExtraItem[]) => {
    addToCart(customizedProduct, extras);
    toast({
      title: `¡${customizedProduct.name} ${extras.length > 0 ? '(con extras)' : ''} añadido al carrito!`,
      description: "Puedes ver tu carrito o seguir comprando.",
    });
    setIsCustomizeDialogOpen(false);
  };

  const getProductAllergenInfo = (allergenCodes?: AllergenCode[]): AllergenDisplayInfo[] => {
    if (!allergenCodes || allergenCodes.length === 0) {
      return [];
    }
    return allergenCodes
      .map(code => ALLERGEN_LIST.find(allergen => allergen.code === code))
      .filter(Boolean) as AllergenDisplayInfo[];
  };

  const productAllergens = getProductAllergenInfo(product.allergens);

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
          <CardDescription className="font-body text-sm text-muted-foreground mb-3 min-h-[3rem] overflow-hidden text-ellipsis">
            {product.description}
          </CardDescription>
          
          {productAllergens.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Contiene:</h4>
              <TooltipProvider delayDuration={300}>
                <div className="flex flex-wrap gap-1.5">
                  {productAllergens.map((allergen) => (
                    <Tooltip key={allergen.code}>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs cursor-default border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100">
                          {allergen.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-semibold text-sm mb-1">{allergen.name}</p>
                        <p className="text-xs">{allergen.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          )}
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

