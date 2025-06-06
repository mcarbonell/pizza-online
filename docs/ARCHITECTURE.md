# Documentación de Arquitectura de PizzaPlace

Este documento describe la arquitectura de la aplicación web PizzaPlace.

## 1. Visión General

PizzaPlace es una aplicación web moderna de comercio electrónico simulado, enfocada en pedidos de pizza en línea. Está construida utilizando Next.js con el App Router, React para la interfaz de usuario, y Tailwind CSS junto con ShadCN UI para el diseño y los componentes. La gestión del estado del carrito se maneja a través de React Context y persiste en el Local Storage del navegador. Genkit está integrado para futuras funcionalidades de Inteligencia Artificial.

## 2. Pila Tecnológica (Tech Stack)

### 2.1. Frontend
- **Framework Principal:** Next.js (con App Router)
    - _Razón:_ Renderizado del lado del servidor (SSR) y del lado del cliente (CSR), optimización de rendimiento, enrutamiento basado en archivos, excelente ecosistema.
- **Biblioteca UI:** React
    - _Razón:_ Componentización, virtual DOM, gran comunidad y herramientas. Se utilizan componentes funcionales y Hooks.
- **Lenguaje:** TypeScript
    - _Razón:_ Tipado estático para mejorar la robustez del código, la mantenibilidad y la experiencia de desarrollo.
- **Componentes UI:** ShadCN UI
    - _Razón:_ Colección de componentes accesibles y personalizables, construidos sobre Radix UI y Tailwind CSS. Permite copiar y pegar componentes directamente en el proyecto.
- **Estilos CSS:** Tailwind CSS
    - _Razón:_ Framework CSS de utilidad primero que permite un desarrollo rápido y un diseño altamente personalizable sin escribir CSS tradicional.
- **Iconos:** Lucide React
    - _Razón:_ Biblioteca de iconos SVG ligera, personalizable y fácil de usar.

### 2.2. Gestión de Estado
- **Estado Global (Carrito):** React Context API (`CartContext`)
    - _Razón:_ Solución integrada en React para compartir estado entre componentes sin prop drilling, adecuada para la complejidad actual del carrito.
- **Persistencia del Carrito:** Local Storage del Navegador
    - _Razón:_ Permite que el carrito del usuario persista entre sesiones en el mismo navegador, mejorando la UX.

### 2.3. Formularios y Validación
- **Gestión de Formularios:** React Hook Form
    - _Razón:_ Manejo eficiente y performante de formularios, fácil integración y validación.
- **Validación de Esquemas:** Zod
    - _Razón:_ Validación de esquemas con inferencia de tipos en TypeScript, potente y fácil de usar.

### 2.4. Datos de Productos
- **Fuente de Datos:** Archivo Estático (`src/data/products.ts`)
    - _Razón:_ Para la simplicidad de este prototipo, los datos de los productos son estáticos. En una aplicación real, esto provendría de una base de datos o una API.

### 2.5. Funcionalidades de IA (Futura Integración)
- **Framework IA:** Genkit
    - _Razón:_ Especificado en los requisitos del proyecto para integrar funcionalidades de IA.
- **Modelo IA:** Google AI (Gemini, a través de `@genkit-ai/googleai`)
    - _Razón:_ Plataforma de IA potente y versátil.

### 2.6. Despliegue (Asumido)
- **Plataforma:** Firebase App Hosting (indicado por `apphosting.yaml`)
    - _Razón:_ Plataforma serverless de Google para desplegar aplicaciones web con Next.js, fácil de configurar y escalar.

## 3. Estructura del Proyecto

La estructura de directorios principal dentro de `src/` es la siguiente:

- **`src/app/`**: Contiene las rutas y páginas de la aplicación utilizando el App Router de Next.js.
    - `(layout).tsx`: Layout principal de la aplicación.
    - `page.tsx`: Página de inicio (menú de productos).
    - `checkout/page.tsx`: Página de checkout.
    - `globals.css`: Estilos globales y variables de tema de ShadCN/Tailwind.
- **`src/components/`**: Componentes reutilizables de React.
    - `ui/`: Componentes de ShadCN UI (auto-generados o personalizados).
    - `cart/`: Componentes relacionados con el carrito de compras (ej. `CartSidebar.tsx`, `CartItemCard.tsx`).
    - `checkout/`: Componentes para el proceso de checkout (ej. `CheckoutForm.tsx`).
    - `layout/`: Componentes estructurales (ej. `Header.tsx`, `Footer.tsx` - aunque el footer está en `layout.tsx`).
    - `products/`: Componentes para mostrar productos (ej. `ProductCard.tsx`).
    - `icons/`: Componentes de iconos personalizados (ej. `PizzaPlaceLogo.tsx`).
- **`src/context/`**: Proveedores de React Context (ej. `CartContext.tsx`).
- **`src/data/`**: Datos estáticos de la aplicación (ej. `products.ts`).
- **`src/hooks/`**: Hooks personalizados de React (ej. `useToast.ts`, `useMobile.ts`).
- **`src/lib/`**: Funciones de utilidad y definiciones de tipos.
    - `utils.ts`: Funciones de utilidad genéricas (ej. `cn` para classnames).
    - `types.ts`: Definiciones de interfaces y tipos de TypeScript.
- **`src/ai/`**: Lógica relacionada con Inteligencia Artificial utilizando Genkit.
    - `genkit.ts`: Configuración e inicialización de Genkit.
    - `dev.ts`: Archivo para desarrollo y prueba de flujos Genkit.
    - `flows/`: (Directorio futuro para los flujos de Genkit).
- **`docs/`**: Documentación del proyecto (este archivo, TODO, DONE, BUGS).
- **`public/`**: Archivos estáticos servidos públicamente.

## 4. Flujo de Datos y Lógica de Negocio

### 4.1. Visualización de Productos
1. La `HomePage` (`src/app/page.tsx`) importa `products` desde `src/data/products.ts`.
2. Filtra los productos por categoría.
3. Mapea los productos a componentes `ProductCard`.
4. `ProductCard` muestra la información del producto y un botón "Add to Cart".

### 4.2. Gestión del Carrito (`CartContext`)
1. `CartProvider` inicializa el estado del carrito, cargándolo desde Local Storage si existe.
2. **`addToCart`**:
   - Si el producto ya está en el carrito, incrementa su cantidad.
   - Si no, añade el producto al carrito con cantidad 1.
   - Actualiza Local Storage.
   - Abre el `CartSidebar`.
3. **`removeFromCart`**: Elimina un producto del carrito. Actualiza Local Storage.
4. **`updateItemQuantity`**: Modifica la cantidad de un producto. Si la cantidad es 0, lo elimina. Actualiza Local Storage.
5. **`clearCart`**: Vacía el carrito. Actualiza Local Storage.
6. **`getCartTotal`**, **`getTotalItems`**: Funciones para calcular el total y la cantidad de ítems.
7. `CartSidebar` consume `CartContext` para mostrar los ítems y permitir interacciones.

### 4.3. Proceso de Checkout
1. El usuario navega a `/checkout`.
2. `CheckoutPage` muestra `CheckoutForm` y un resumen del pedido obtenido de `CartContext`.
3. `CheckoutForm` utiliza `react-hook-form` y `zod` para la validación de los datos de contacto, dirección y pago (simulado).
4. Al enviar el formulario:
   - Se simula una llamada a API.
   - Se muestra una notificación (toast) de éxito.
   - Se llama a `clearCart` de `CartContext`.
   - El usuario es redirigido a la página de inicio.

## 5. Estilo y Tematización
- **`src/app/globals.css`**: Define variables CSS HSL para los colores del tema (claro y oscuro) de ShadCN. Estas variables son utilizadas por los componentes de ShadCN y pueden ser usadas directamente en clases de Tailwind.
- **`tailwind.config.ts`**: Configura Tailwind CSS, incluyendo las fuentes personalizadas (`Belleza` y `Alegreya`) y extiende los colores para usar las variables CSS definidas en `globals.css`.
- Los componentes de ShadCN UI se instalan y personalizan localmente en `src/components/ui/`.

## 6. Consideraciones y Futuras Mejoras
- **Backend Real:** Actualmente, no hay un backend real para procesar pedidos o gestionar usuarios. Esto sería un paso crucial para una aplicación de producción.
- **Autenticación:** No implementada. Sería necesaria para funcionalidades como historial de pedidos y perfiles de usuario.
- **Base de Datos:** Los productos son estáticos. Se necesitaría una base de datos para una gestión dinámica.
- **Integración de Pagos Real:** El proceso de pago es simulado.
- **Escalabilidad del Estado:** Para aplicaciones más grandes, se podría considerar una librería de gestión de estado más robusta como Redux Toolkit, Zustand o Jotai, aunque React Context es suficiente por ahora.

Este documento proporciona una visión general de la arquitectura actual. Se actualizará a medida que el proyecto evolucione.