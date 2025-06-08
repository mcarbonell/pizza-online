
"use client";

import { useState, useEffect } from 'react';
import type { Product, ExtraItem } from '@/lib/types';
import { availableExtras } from '@/data/availableExtras';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { PlusCircle } from 'lucide-react';

interface CustomizePizzaDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, extras: ExtraItem[]) => void;
}

export default function CustomizePizzaDialog({ product, isOpen, onClose, onAddToCart }: CustomizePizzaDialogProps) {
  const [selectedExtras, setSelectedExtras] = useState<ExtraItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(product.price);

  useEffect(() => {
    if (isOpen) {
      // Reset selections when dialog opens for a new product (or re-opens)
      setSelectedExtras([]);
      setTotalPrice(product.price);
    }
  }, [isOpen, product]);

  useEffect(() => {
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    setTotalPrice(product.price + extrasTotal);
  }, [selectedExtras, product.price]);

  const handleExtraChange = (extra: ExtraItem, checked: boolean) => {
    setSelectedExtras(prev =>
      checked ? [...prev, extra] : prev.filter(item => item.name !== extra.name)
    );
  };

  const handleSubmit = () => {
    onAddToCart(product, selectedExtras); // Pass the base product and selected extras
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Personaliza tu {product.name}</DialogTitle>
          <DialogDescription>Añade ingredientes extra a tu pizza. Cada extra tiene un coste adicional.</DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-hidden flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4 px-1">
            <Image src={product.imageUrl} alt={product.name} width={80} height={80} className="rounded-md object-cover" data-ai-hint={product.dataAiHint} />
            <div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <p className="text-lg font-semibold">Precio Base: ${product.price.toFixed(2)}</p>
            </div>
          </div>
          
          <h3 className="text-md font-semibold px-1 mt-2">Ingredientes Extra (1€ cada uno, salvo excepciones):</h3>
          <ScrollArea className="flex-grow max-h-[250px] border rounded-md p-1">
            <div className="space-y-3 p-3">
              {availableExtras.map(extra => (
                <div key={extra.name} className="flex items-center space-x-3">
                  <Checkbox
                    id={`extra-${extra.name.replace(/\s+/g, '-')}`}
                    checked={selectedExtras.some(se => se.name === extra.name)}
                    onCheckedChange={(checked) => handleExtraChange(extra, !!checked)}
                  />
                  <Label htmlFor={`extra-${extra.name.replace(/\s+/g, '-')}`} className="flex-grow cursor-pointer text-sm">
                    {extra.name}
                  </Label>
                  <span className="text-sm text-muted-foreground">${extra.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <div className="w-full flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-primary">Total: ${totalPrice.toFixed(2)}</span>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-5 w-5" />Añadir al Carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
