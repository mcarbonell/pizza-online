
"use client";

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import CartItemCard from './CartItemCard';
import Link from 'next/link';
import { ShoppingCart, X } from 'lucide-react';

export default function CartSidebar() {
  const { cartItems, getCartTotal, getTotalItems, clearCart, isCartOpen, toggleCart, closeCart } = useCart();

  const total = getCartTotal();
  const totalItems = getTotalItems();

  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="font-headline text-2xl flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" /> Tu Carrito ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
          </SheetTitle>
           <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </SheetClose>
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
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="p-6 border-t flex-col space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button onClick={clearCart} variant="outline" className="w-full">Vaciar Carrito</Button>
              <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
                <Link href="/checkout" onClick={closeCart}>Proceder al Pago</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
