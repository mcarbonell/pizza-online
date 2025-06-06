
"use client";

import { PizzaPlaceLogo } from '@/components/icons/PizzaPlaceLogo';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { getTotalItems, toggleCart } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4">
        <PizzaPlaceLogo />
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">Menu</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/#contact">Contact</Link>
            </Button>
          </nav>
          <Button variant="outline" size="icon" onClick={toggleCart} aria-label="Open cart">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
