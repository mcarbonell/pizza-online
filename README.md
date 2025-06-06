# PizzaPlace - Tu Pizzería Online

¡Bienvenido a PizzaPlace! Esta es una aplicación web moderna construida con Next.js y React, diseñada para permitir a los usuarios explorar un menú de pizzas, acompañamientos, bebidas y postres, agregarlos a un carrito de compras y realizar un pedido.

## Características Principales

- **Menú Interactivo:** Navega por las diferentes categorías de productos (Pizzas, Acompañamientos, Bebidas, Postres) y visualiza los detalles de cada artículo.
- **Carrito de Compras:** Agrega productos a tu carrito, ajusta las cantidades o elimina artículos fácilmente. El carrito se actualiza en tiempo real y persiste entre sesiones utilizando el almacenamiento local del navegador.
- **Proceso de Checkout:** Un formulario de pago simulado donde los usuarios pueden ingresar su información de contacto, dirección de entrega y detalles de pago (simulados).
- **Diseño Responsivo:** La aplicación está diseñada para funcionar sin problemas en dispositivos de escritorio, tabletas y móviles.
- **Estilo Moderno:** Utiliza ShadCN UI para componentes de interfaz de usuario elegantes y Tailwind CSS para un diseño personalizable y eficiente.
- **Notificaciones:** Se utilizan "toasts" para proporcionar retroalimentación al usuario, como cuando se agrega un artículo al carrito o se realiza un pedido.

## Tecnologías Utilizadas

- **Next.js:** Framework de React para renderizado del lado del servidor (SSR) y generación de sitios estáticos (SSG), optimizando el rendimiento y SEO.
- **React:** Biblioteca de JavaScript para construir interfaces de usuario interactivas.
- **TypeScript:** Superset de JavaScript que añade tipado estático para mejorar la calidad y mantenibilidad del código.
- **ShadCN UI:** Colección de componentes de interfaz de usuario reutilizables y accesibles.
- **Tailwind CSS:** Framework de CSS de utilidad primero para un diseño rápido y personalizable.
- **Lucide Icons:** Biblioteca de iconos SVG ligeros y personalizables.
- **React Hook Form & Zod:** Para la gestión y validación de formularios.
- **Genkit (para IA):** Aunque no implementado activamente en la funcionalidad principal de pedidos, la estructura está preparada para integrar funciones de IA con Genkit si fuera necesario.

## Cómo Empezar

Para ejecutar este proyecto localmente:

1.  Clona el repositorio.
2.  Instala las dependencias: `npm install`
3.  Inicia el servidor de desarrollo: `npm run dev`
4.  Abre [http://localhost:9002](http://localhost:9002) (o el puerto que hayas configurado) en tu navegador.

El código fuente principal de la aplicación se encuentra en el directorio `src/`. La página de inicio es `src/app/page.tsx`.

Este proyecto sirve como una excelente plantilla para una tienda en línea o una aplicación de pedidos de comida, demostrando buenas prácticas en el desarrollo front-end con Next.js y el ecosistema de React.
