
# Pizzería Serranillo - Tu Pizzería Online

¡Bienvenido a Pizzería Serranillo! Esta es una aplicación web moderna construida con Next.js y React, diseñada para permitir a los usuarios explorar un menú de pizzas, acompañamientos, bebidas y postres, agregarlos a un carrito de compras y realizar un pedido.

## Características Principales

- **Menú Interactivo:** Navega por las diferentes categorías de productos (Pizzas, Acompañamientos, Bebidas, Postres) y visualiza los detalles de cada artículo.
- **Carrito de Compras:** Agrega productos a tu carrito, ajusta las cantidades o elimina artículos fácilmente. El carrito se actualiza en tiempo real y persiste entre sesiones utilizando el almacenamiento local del navegador.
- **Proceso de Checkout:** Un formulario de pago integrado con Stripe (en EUR) donde los usuarios pueden ingresar su información de contacto, dirección de entrega y realizar el pago.
- **Diseño Responsivo:** La aplicación está diseñada para funcionar sin problemas en dispositivos de escritorio, tabletas y móviles.
- **Estilo Moderno:** Utiliza ShadCN UI para componentes de interfaz de usuario elegantes y Tailwind CSS para un diseño personalizable y eficiente.
- **Notificaciones:** Se utilizan "toasts" para proporcionar retroalimentación al usuario, como cuando se agrega un artículo al carrito o se realiza un pedido.
- **PWA (Progressive Web App):** Habilitada para una experiencia similar a una aplicación nativa, incluyendo la posibilidad de instalarla.
- **Información del Negocio:** Dirección, teléfonos, enlace a Facebook e información de IVA visible en el pie de página. Horario de apertura detallado en la página de inicio.
- **Seguimiento de Pedidos (Simplificado):** Los clientes pueden ver la ubicación del repartidor en un mapa para pedidos "En Reparto".

## Tecnologías Utilizadas

- **Next.js:** Framework de React para renderizado del lado del servidor (SSR) y generación de sitios estáticos (SSG), optimizando el rendimiento y SEO.
- **React:** Biblioteca de JavaScript para construir interfaces de usuario interactivas.
- **TypeScript:** Superset de JavaScript que añade tipado estático para mejorar la calidad y mantenibilidad del código.
- **ShadCN UI:** Colección de componentes de interfaz de usuario reutilizables y accesibles.
- **Tailwind CSS:** Framework de CSS de utilidad primero para un diseño rápido y personalizable.
- **Lucide Icons:** Biblioteca de iconos SVG ligeros y personalizables.
- **React Hook Form & Zod:** Para la gestión y validación de formularios.
- **Firebase:**
    - Authentication: Para el registro e inicio de sesión de usuarios (Email/Password, Google).
    - Firestore: Como base de datos NoSQL para almacenar productos, pedidos y perfiles de usuario.
    - Storage: Para almacenar imágenes de productos.
- **Stripe:** Para el procesamiento de pagos (configurado en EUR).
- **React-Leaflet:** Para la visualización de mapas en el seguimiento de pedidos (usando `react-leaflet@5.0.0-rc.1` compatible con React 18).
- **Genkit (para IA):** Aunque no implementado activamente en la funcionalidad principal de pedidos, la estructura está preparada para integrar funciones de IA con Genkit si fuera necesario.
- **next-pwa:** Para habilitar la funcionalidad de Progressive Web App.

## Cómo Empezar

Para ejecutar este proyecto localmente:

1.  Clona el repositorio.
2.  Configura tus variables de entorno en un archivo `.env.local` (ver `.env.local.example` si existe o configura las variables de Firebase y Stripe).
3.  Instala las dependencias: `npm install`
4.  Inicia el servidor de desarrollo: `npm run dev`
5.  Abre [http://localhost:9002](http://localhost:9002) (o el puerto que hayas configurado) en tu navegador.
6.  Para probar los webhooks de Stripe localmente, ejecuta en otra terminal: `stripe listen --forward-to localhost:9002/api/stripe/webhook` (asegúrate de tener Stripe CLI instalado y configurado).

El código fuente principal de la aplicación se encuentra en el directorio `src/`. La página de inicio (`src/app/page.tsx`) incluye el menú de productos y el horario de apertura. El layout principal (`src/app/layout.tsx`) contiene la cabecera y un pie de página detallado con información del negocio.

Este proyecto sirve como una excelente plantilla para una tienda en línea o una aplicación de pedidos de comida, demostrando buenas prácticas en el desarrollo front-end con Next.js y el ecosistema de React.
