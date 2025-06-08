
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
    <div className="flex items-start gap-3 sm:gap-4 py-4 border-b last:border-b-0">
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={64} 
        height={64}
        className="rounded-md object-cover self-start shrink-0" // Added shrink-0
        data-ai-hint={item.dataAiHint}
      />
      <div className="flex-grow space-y-1.5">
        <h4 className="font-headline text-base sm:text-lg leading-tight mb-0.5">{item.name}</h4>
        <p className="text-xs text-muted-foreground">Precio base: €{item.price.toFixed(2)}</p>
        {item.selectedExtras && item.selectedExtras.length > 0 && (
          <div className="mt-1">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Extras:</p>
            <ul className="list-disc list-inside pl-3 space-y-0.5">
              {item.selectedExtras.map(extra => (
                <li key={extra.name} className="text-xs text-muted-foreground">
                  {extra.name} (+€{extra.price.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end justify-between self-stretch gap-2 min-w-[100px] sm:min-w-[110px]">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0" // Consistent size
            onClick={() => handleQuantityChange(item.quantity - 1)}
            aria-label="Reducir cantidad"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) handleQuantityChange(val);
            }}
            className="h-8 w-10 text-center px-1 py-1" // Adjusted padding & width
            min="0"
            aria-label="Cantidad"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0" // Consistent size
            onClick={() => handleQuantityChange(item.quantity + 1)}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-4 w-4" />
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
          className="text-destructive hover:text-destructive/80 h-8 w-8 mt-auto" // Consistent size
          aria-label="Eliminar del carrito"
        >
          <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
        </Button>
      </div>
    </div>
  );
}
