'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Página No Encontrada</h2>
      <p className="text-muted-foreground text-center mb-8">Lo sentimos, la página que buscas no existe.</p>
      <Link href="/" className="underline text-primary hover:text-primary/90">
        Volver a la página de inicio
      </Link>
    </div>
  );
}