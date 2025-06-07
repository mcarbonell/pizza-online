
import Link from 'next/link';
import { Pizza } from 'lucide-react';

export function PizzaPlaceLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
      <Pizza className="h-8 w-8" />
      <h1 className="text-3xl font-headline tracking-tight">Pizzería Serranillo</h1>
    </Link>
  );
}
