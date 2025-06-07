# Documentación de Arquitectura de Pizzería Serranillo

Este documento describe la arquitectura de la aplicación web Pizzería Serranillo.

## 1. Visión General

Pizzería Serranillo es una aplicación web moderna de comercio electrónico, enfocada en pedidos de pizza en línea. Está construida utilizando Next.js con el App Router, React para la interfaz de usuario, y Tailwind CSS junto con ShadCN UI para el diseño y los componentes. La gestión del estado del carrito se maneja a través de React Context y persiste en el Local Storage del navegador. La autenticación se realiza con Firebase Auth, los datos se almacenan en Firestore y los pagos se procesan con Stripe. Genkit está integrado para futuras funcionalidades de Inteligencia Artificial. La aplicación también está configurada como una Progressive Web App (PWA).

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
- **PWA:** `next-pwa`
    - _Razón:_ Facilita la creación de Progressive Web Apps con Next.js.

### 2.2. Backend y Servicios
- **Autenticación:** Firebase Authentication
    - _Razón:_ Solución robusta y fácil de integrar para múltiples proveedores de identidad (Email/Password, Google).
- **Base de Datos:** Firestore (Firebase)
    - _Razón:_ Base de datos NoSQL escalable, en tiempo real, bien integrada con Firebase Auth y otros servicios de Firebase. Utilizada para productos, perfiles de usuario y pedidos.
- **Almacenamiento de Archivos:** Firebase Storage
    - _Razón:_ Para almacenar imágenes de productos.
- **Pasarela de Pago:** Stripe
    - _Razón:_ Plataforma de pagos completa y popular, con buena documentación y SDKs.

### 2.3. Gestión de Estado
- **Estado Global (Carrito):** React Context API (`CartContext`)
    - _Razón:_ Solución integrada en React para compartir estado entre componentes sin prop drilling, adecuada para la complejidad actual del carrito.
- **Persistencia del Carrito:** Local Storage del Navegador
    - _Razón:_ Permite que el carrito del usuario persista entre sesiones en el mismo navegador, mejorando la UX.
- **Estado de Autenticación:** React Context API (`AuthContext`)
    - _Razón:_ Para gestionar el estado del usuario autenticado y su perfil de Firestore a través de la aplicación.

### 2.4. Formularios y Validación
- **Gestión de Formularios:** React Hook Form
    - _Razón:_ Manejo eficiente y performante de formularios, fácil integración y validación.
- **Validación de Esquemas:** Zod
    - _Razón:_ Validación de esquemas con inferencia de tipos en TypeScript, potente y fácil de usar.

### 2.5. Datos de Productos (Iniciales)
- **Fuente de Datos Inicial:** Archivo Estático (`src/data/products.ts`)
    - _Razón:_ Para la simplicidad de la importación inicial al panel de administración. Los productos en vivo se leen desde Firestore.

### 2.6. Funcionalidades de IA (Futura Integración)
- **Framework IA:** Genkit
    - _Razón:_ Especificado en los requisitos del proyecto para integrar funcionalidades de IA.
- **Modelo IA:** Google AI (Gemini, a través de `@genkit-ai/googleai`)
    - _Razón:_ Plataforma de IA potente y versátil.

### 2.7. Despliegue (Asumido)
- **Plataforma:** Firebase App Hosting (indicado por `apphosting.yaml`)
    - _Razón:_ Plataforma serverless de Google para desplegar aplicaciones web con Next.js, fácil de configurar y escalar.

## 3. Estructura del Proyecto

La estructura de directorios principal dentro de `src/` es la siguiente:

- **`src/app/`**: Contiene las rutas y páginas de la aplicación utilizando el App Router de Next.js.
    - `(layout).tsx`: Layout principal de la aplicación.
    - `page.tsx`: Página de inicio (menú de productos).
    - `checkout/page.tsx`: Página de checkout.
    - `checkout/success/page.tsx`, `checkout/cancel/page.tsx`: Páginas de resultado de Stripe.
    - `profile/page.tsx`: Página de perfil del usuario.
    - `admin/page.tsx`: Panel de administración.
    - `login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`: Páginas de autenticación.
    - `api/stripe/`: API routes para la integración con Stripe (crear sesión, webhook).
    - `globals.css`: Estilos globales y variables de tema de ShadCN/Tailwind.
- **`src/components/`**: Componentes reutilizables de React.
    - `ui/`: Componentes de ShadCN UI (auto-generados o personalizados).
    - `cart/`: Componentes relacionados con el carrito de compras (ej. `CartSidebar.tsx`, `CartItemCard.tsx`).
    - `checkout/`: Componentes para el proceso de checkout (ej. `CheckoutForm.tsx`).
    - `layout/`: Componentes estructurales (ej. `Header.tsx`, `Footer.tsx` - aunque el footer está en `layout.tsx`).
    - `products/`: Componentes para mostrar productos (ej. `ProductCard.tsx`).
    - `icons/`: Componentes de iconos personalizados (ej. `PizzaPlaceLogo.tsx` ahora `PizzeríaSerranilloLogo`).
- **`src/context/`**: Proveedores de React Context (ej. `CartContext.tsx`, `AuthContext.tsx`).
- **`src/data/`**: Datos estáticos de la aplicación (ej. `products.ts` para importación).
- **`src/hooks/`**: Hooks personalizados de React (ej. `useToast.ts`, `useMobile.ts`).
- **`src/lib/`**: Funciones de utilidad y definiciones de tipos.
    - `utils.ts`: Funciones de utilidad genéricas (ej. `cn` para classnames).
    - `types.ts`: Definiciones de interfaces y tipos de TypeScript.
    - `firebase.ts`: Configuración e inicialización de Firebase.
    - `stripe.ts`: Configuración de Stripe (frontend y backend).
- **`src/ai/`**: Lógica relacionada con Inteligencia Artificial utilizando Genkit.
    - `genkit.ts`: Configuración e inicialización de Genkit.
    - `dev.ts`: Archivo para desarrollo y prueba de flujos Genkit.
    - `flows/`: (Directorio futuro para los flujos de Genkit).
- **`docs/`**: Documentación del proyecto (este archivo, TODO, DONE, BUGS).
- **`public/`**: Archivos estáticos servidos públicamente.
    - `manifest.json`: Manifiesto para la PWA.
    - `icons/`: Iconos para la PWA.

## 4. Flujo de Datos y Lógica de Negocio Clave

### 4.1. Autenticación de Usuarios
1. `AuthContext` gestiona el estado del usuario usando Firebase Auth.
2. `Firebase.ts` inicializa Firebase.
3. Las páginas de Login/Signup usan métodos del `AuthContext` que llaman a funciones de Firebase Auth.
4. Perfiles de usuario (`UserProfile`) se crean/actualizan en Firestore (`users` collection) al registrarse o iniciar sesión.

### 4.2. Visualización de Productos
1. `HomePage` (`src/app/page.tsx`) obtiene productos de Firestore (colección `products`).
2. Filtra y muestra productos usando `ProductCard`.

### 4.3. Gestión del Carrito (`CartContext`)
1. Persiste en Local Storage.
2. Funciones para añadir, eliminar, actualizar cantidad, limpiar carrito.

### 4.4. Proceso de Checkout y Pago con Stripe
1. `CheckoutPage` muestra `CheckoutForm` y resumen del pedido.
2. `CheckoutForm` recoge datos de envío.
3. Al enviar, se llama a `/api/stripe/create-checkout-session` con los ítems del carrito, ID de usuario y dirección de envío.
4. Esta API route crea una sesión de Stripe Checkout y devuelve el ID de sesión.
5. El frontend redirige al usuario a la página de pago de Stripe.
6. **Webhook de Stripe (`/api/stripe/webhook`):**
   - Recibe eventos de Stripe (ej. `checkout.session.completed`).
   - Verifica la firma del webhook.
   - Si `checkout.session.completed`:
     - Obtiene los metadatos (ID de usuario, ítems del carrito simplificados, dirección de envío).
     - **Idempotencia:** Verifica si el pedido ya fue procesado para este `payment_intent`.
     - Recupera detalles completos de los productos desde Firestore.
     - Crea un nuevo documento de pedido en la colección `orders` de Firestore.
     - El carrito del usuario **no** se limpia aquí directamente; se limpia en el cliente al llegar a la página de éxito, o si el usuario vuelve a la app y `CartContext` se recarga. La limpieza del carrito del cliente se realiza en `src/app/checkout/success/page.tsx` al detectar el `session_id`.
7. `CheckoutSuccessPage` limpia el carrito local del usuario.
8. `CheckoutCancelPage` maneja cancelaciones.

### 4.5. Gestión de Productos (Admin Panel)
1. `AdminPage` (`/admin`) es una ruta protegida (rol 'admin' en Firestore).
2. Permite CRUD de productos en Firestore, incluyendo subida/eliminación de imágenes a Firebase Storage.
3. Permite importar menú inicial desde `src/data/products.ts`.
4. Permite ver pedidos y cambiar su estado.
5. Permite ver usuarios y cambiar su rol.

### 4.6. Notificaciones de Estado de Pedido (Simuladas en Perfil)
1. `AdminPage` actualiza el estado del pedido y el campo `updatedAt` en Firestore.
2. `ProfilePage` usa `onSnapshot` para escuchar cambios en los pedidos del usuario.
3. Si el estado de un pedido cambia (y no es la carga inicial), se muestra un `toast` al usuario.

## 5. Estilo y Tematización
- **`src/app/globals.css`**: Define variables CSS HSL para los colores del tema.
- **`tailwind.config.ts`**: Configura Tailwind CSS.
- Componentes de ShadCN UI en `src/components/ui/`.

## 6. Consideraciones y Futuras Mejoras
- Ver `docs/TODO.md` para la lista completa.
- Las notificaciones push reales (FCM) son una mejora futura.
- Pruebas unitarias y de integración.

Este documento proporciona una visión general de la arquitectura actual. Se actualizará a medida que el proyecto evolucione.
