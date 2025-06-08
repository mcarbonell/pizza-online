
"use client";

import type { CartItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { updateItemQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.cartItemId);
    } else {
      updateItemQuantity(item.cartItemId, newQuantity);
    }
  };

  const extrasPrice = item.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
  const unitPriceWithExtras = item.price + extrasPrice;
  const totalItemPrice = unitPriceWithExtras * item.quantity;

  return (
    <div className="flex items-start gap-4 py-4 border-b">
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={72} // Slightly larger image
        height={72}
        className="rounded-md object-cover self-start"
        data-ai-hint={item.dataAiHint}
      />
      <div className="flex-grow space-y-1.5">
        <h4 className="font-headline text-base sm:text-lg leading-tight">{item.name}</h4>
        <p className="text-xs sm:text-sm text-muted-foreground">Precio base: €{item.price.toFixed(2)}</p>
        {item.selectedExtras && item.selectedExtras.length > 0 && (
          <div className="mt-1.5">
            <p className="text-xs font-medium text-muted-foreground">Extras:</p>
            <ul className="list-disc list-inside pl-3 sm:pl-4 space-y-0.5">
              {item.selectedExtras.map(extra => (
                <li key={extra.name} className="text-xs text-muted-foreground">
                  {extra.name} (+€{extra.price.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end justify-between self-stretch gap-2 min-w-[110px] sm:min-w-[120px]">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            aria-label="Reducir cantidad"
          >
            <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) handleQuantityChange(val);
            }}
            className="h-7 w-10 sm:h-8 sm:w-12 text-center"
            min="0"
            aria-label="Cantidad"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <div className="text-right mt-1">
          <p className="font-semibold text-sm sm:text-base">€{totalItemPrice.toFixed(2)}</p>
          {item.quantity > 1 && <p className="text-xs text-muted-foreground mt-0.5">(€{unitPriceWithExtras.toFixed(2)} c/u)</p> }
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => removeFromCart(item.cartItemId)} 
          className="text-destructive hover:text-destructive/80 h-7 w-7 sm:h-8 sm:w-8 mt-auto"
          aria-label="Eliminar del carrito"
        >
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
}

