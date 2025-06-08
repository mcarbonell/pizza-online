
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
    <div className="flex items-start sm:items-center gap-3 py-4 border-b flex-col sm:flex-row">
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={64}
        height={64}
        className="rounded-md object-cover self-center sm:self-start"
        data-ai-hint={item.dataAiHint}
      />
      <div className="flex-grow w-full">
        <h4 className="font-headline text-lg">{item.name}</h4>
        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} (base)</p>
        {item.selectedExtras && item.selectedExtras.length > 0 && (
          <div className="mt-1">
            <p className="text-xs font-medium text-muted-foreground">Extras:</p>
            <ul className="list-disc list-inside pl-1">
              {item.selectedExtras.map(extra => (
                <li key={extra.name} className="text-xs text-muted-foreground">
                  {extra.name} (+${extra.price.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
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
          className="h-8 w-12 text-center"
          min="0"
          aria-label="Cantidad"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          aria-label="Aumentar cantidad"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col items-end w-full sm:w-24 mt-2 sm:mt-0">
        <p className="font-semibold text-right">${totalItemPrice.toFixed(2)}</p>
        {item.quantity > 1 && <p className="text-xs text-muted-foreground text-right mt-0.5">(${unitPriceWithExtras.toFixed(2)} c/u)</p> }
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => removeFromCart(item.cartItemId)} 
        className="text-destructive hover:text-destructive/80 mt-2 sm:mt-0 ml-auto sm:ml-2"
        aria-label="Eliminar del carrito"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
