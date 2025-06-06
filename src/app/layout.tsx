
import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'PizzaPlace - Delicious Pizza & More',
  description: 'Order your favorite pizza, sides, and drinks online from PizzaPlace!',
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
      </head>
      <body className="font-body antialiased">
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-primary text-primary-foreground py-6 text-center">
              <p className="font-body">&copy; {new Date().getFullYear()} PizzaPlace. All rights reserved.</p>
            </footer>
          </div>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
