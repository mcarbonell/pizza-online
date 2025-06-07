
import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Pizzería Serranillo - Pizzas y Más',
  description: '¡Pide tu pizza favorita, acompañamientos y bebidas online en Pizzería Serranillo!',
  manifest: '/manifest.json', // Link to the manifest file
  themeColor: '#E63946', // Corresponds to primary color
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400;1,500;1,700;1,800;1,900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E63946" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <footer className="bg-primary text-primary-foreground py-6 text-center">
                <p className="font-body">&copy; {new Date().getFullYear()} Pizzería Serranillo. Todos los derechos reservados.</p>
              </footer>
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
