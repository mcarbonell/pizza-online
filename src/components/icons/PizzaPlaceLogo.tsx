
import Link from 'next/link';
import { Pizza } from 'lucide-react';

export function PizzaPlaceLogo() {
  return (
    <Link href="/" className="text-primary hover:text-primary/90 transition-colors py-1">
      <div className="flex items-center gap-2">
        <Pizza className="h-10 w-10 md:h-8 md:w-8" />
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-headline tracking-tight leading-tight">Pizzería Serranillo</h1>
          <span className="text-xs md:text-sm font-body text-primary/80 -mt-1 md:-mt-1">Horno de Leña</span>
        </div>
      </div>
    </Link>
  );
}
