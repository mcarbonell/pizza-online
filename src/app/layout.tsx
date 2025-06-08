
import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import { MapPin, Phone, Facebook, Heart, Info, MessageSquare } from 'lucide-react';

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
    <html lang="es">
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
              <footer className="bg-primary text-primary-foreground py-8">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-6">
                    {/* Columna 1: Nombre y Dirección */}
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-semibold mb-2">Pizzería Serranillo</h3>
                      <p className="flex items-start text-sm">
                        <MapPin className="h-4 w-4 mr-2 mt-1 shrink-0" />
                        <span>Carretera Hellín, Siles, Andalucía 23380</span>
                      </p>
                    </div>

                    {/* Columna 2: Pedidos y Contacto */}
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-semibold mb-2">Pedidos y Contacto</h3>
                      <p className="text-xs mb-2">Realiza tu pedido por teléfono o WhatsApp:</p>
                      <div className="flex items-center mb-2">
                        <Phone className="h-5 w-5 mr-2 shrink-0" />
                        <a href="tel:625377127" className="hover:underline text-base font-semibold">625 37 71 27</a>
                        <a href="https://wa.me/34625377127" target="_blank" rel="noopener noreferrer" className="ml-2 flex items-center hover:underline text-sm" aria-label="Pedir por WhatsApp al 625377127">
                          (<MessageSquare className="h-4 w-4 mr-1 shrink-0" /> WhatsApp)
                        </a>
                      </div>
                      <div className="flex items-center mb-2">
                         <Phone className="h-5 w-5 mr-2 shrink-0" /> 
                        <a href="tel:953490434" className="hover:underline text-base font-semibold">953 49 04 34</a>
                      </div>
                      <a 
                        href="https://www.facebook.com/Pizzer%C3%ADa-Serranillo-329258410599768/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center hover:underline mt-1 text-sm"
                        aria-label="Pizzería Serranillo en Facebook"
                      >
                        <Facebook className="h-4 w-4 mr-2 shrink-0" /> Facebook
                      </a>
                    </div>
                    
                    {/* Columna 3: Aviso IVA */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold mb-2">Importante</h3>
                        <p className="flex items-center text-sm">
                          <Info className="h-4 w-4 mr-2 shrink-0" />
                          <span>IVA INCLUIDO EN TODOS LOS PRECIOS</span>
                        </p>
                    </div>
                  </div>

                  {/* Copyright y Diseño */}
                  <div className="mt-8 pt-6 border-t border-primary-foreground/30 text-center text-xs text-primary-foreground/80">
                    <p>&copy; 2025 Pizzería Serranillo. Todos los derechos reservados.</p>
                    <p className="flex items-center justify-center gap-1 mt-1">
                      Diseño web con cariño <Heart className="h-3 w-3 text-white fill-white" />
                    </p>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
