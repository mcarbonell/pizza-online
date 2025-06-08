
"use client";

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import CartItemCard from './CartItemCard';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartSidebar() {
  const { cartItems, getCartTotal, getTotalItems, clearCart, isCartOpen, toggleCart, closeCart } = useCart();

  const total = getCartTotal();
  const totalItems = getTotalItems();

  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0"> {/* Removed explicit padding from SheetContent itself */}
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="font-headline text-2xl flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" /> Tu Carrito ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
          </SheetTitle>
        </SheetHeader>
        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-body text-center">Tu carrito está vacío.</p>
            <Button variant="link" onClick={closeCart} asChild className="mt-4 text-primary">
              <Link href="/">Empezar a Comprar</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow p-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemCard key={item.cartItemId} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="p-6 border-t flex-col space-y-4">
              <div className="w-full flex justify-between items-center text-lg font-semibold">
                <span>Subtotal:</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button onClick={clearCart} variant="outline" className="w-full">Vaciar Carrito</Button>
                <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
                  <Link href="/checkout" onClick={closeCart}>Proceder al Pago</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
