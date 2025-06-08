
# Documentación de Arquitectura de Pizzería Serranillo

Este documento describe la arquitectura de la aplicación web Pizzería Serranillo.

## 1. Visión General

Pizzería Serranillo es una aplicación web moderna de comercio electrónico, enfocada en pedidos de pizza en línea. Está construida utilizando Next.js con el App Router, React para la interfaz de usuario, y Tailwind CSS junto con ShadCN UI para el diseño y los componentes. Permite la personalización de pizzas con ingredientes extra. La gestión del estado del carrito se maneja a través de React Context y persiste en el Local Storage del navegador. La autenticación se realiza con Firebase Auth, los datos se almacenan en Firestore y los pagos se procesan con Stripe en EUR. Genkit está integrado para futuras funcionalidades de Inteligencia Artificial. La aplicación también está configurada como una Progressive Web App (PWA) y cuenta con una funcionalidad simplificada de seguimiento de pedidos en tiempo real. La información del negocio (dirección, contacto, horario, IVA) está integrada en la interfaz.

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
- **Mapas:** Leaflet con React-Leaflet (`react-leaflet@5.0.0-rc.1`)
    - _Razón:_ Biblioteca de mapas interactivos de código abierto, ligera y flexible. Usada para el seguimiento de pedidos, con versión compatible con React 18.
- **PWA:** `next-pwa`
    - _Razón:_ Facilita la creación de Progressive Web Apps con Next.js.

### 2.2. Backend y Servicios
- **Autenticación:** Firebase Authentication
    - _Razón:_ Solución robusta y fácil de integrar para múltiples proveedores de identidad (Email/Password, Google).
- **Base de Datos:** Firestore (Firebase)
    - _Razón:_ Base de datos NoSQL escalable, en tiempo real, bien integrada con Firebase Auth y otros servicios de Firebase. Utilizada para productos, perfiles de usuario, pedidos (incluyendo detalles de ingredientes extra) y ubicaciones de reparto.
- **Almacenamiento de Archivos:** Firebase Storage
    - _Razón:_ Para almacenar imágenes de productos.
- **Pasarela de Pago:** Stripe
    - _Razón:_ Plataforma de pagos completa y popular, con buena documentación y SDKs. Los pagos se procesan en EUR y manejan precios dinámicos por ingredientes extra.

### 2.3. Gestión de Estado
- **Estado Global (Carrito):** React Context API (`CartContext`)
    - _Razón:_ Solución integrada en React para compartir estado entre componentes sin prop drilling, adecuada para la complejidad actual del carrito, incluyendo la gestión de ingredientes extra para cada pizza. Cada `CartItem` ahora tiene un `cartItemId` único que considera el producto base y sus extras.
- **Persistencia del Carrito:** Local Storage del Navegador
    - _Razón:_ Permite que el carrito del usuario persista entre sesiones en el mismo navegador, mejorando la UX.
- **Estado de Autenticación:** React Context API (`AuthContext`)
    - _Razón:_ Para gestionar el estado del usuario autenticado y su perfil de Firestore a través de la aplicación.
- **Estado de Ubicación (Repartidor):** Gestionado en el panel de admin (`AdminPage`) usando `navigator.geolocation` y almacenado en Firestore.
- **Estado de Pedidos (`OrderStatus` en `src/lib/types.ts`):** Definidos como `Pending`, `Processing`, `Out for Delivery`, `Delivered`, `Cancelled`, `PaymentFailed`. Se utiliza una función `translateOrderStatus` para mostrar traducciones en español en la UI. El estado "Shipped" ha sido eliminado.

### 2.4. Formularios y Validación
- **Gestión de Formularios:** React Hook Form
    - _Razón:_ Manejo eficiente y performante de formularios, fácil integración y validación.
- **Validación de Esquemas:** Zod
    - _Razón:_ Validación de esquemas con inferencia de tipos en TypeScript, potente y fácil de usar.

### 2.5. Datos de Productos (Iniciales)
- **Fuente de Datos Inicial:** Archivo Estático (`src/data/products.ts`)
    - _Razón:_ Para la simplicidad de la importación inicial al panel de administración. Los productos en vivo se leen desde Firestore.
- **Ingredientes Extra:** Archivo Estático (`src/data/availableExtras.ts`)
    - _Razón:_ Para definir la lista de ingredientes extra disponibles para la personalización de pizzas.

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
    - `(layout).tsx`: Layout principal de la aplicación (incluye cabecera y pie de página detallado con información del negocio).
    - `page.tsx`: Página de inicio (menú de productos y horario de apertura).
    - `checkout/page.tsx`: Página de checkout.
    - `checkout/success/page.tsx`, `checkout/cancel/page.tsx`: Páginas de resultado de Stripe.
    - `profile/page.tsx`: Página de perfil del usuario (incluye visualización de mapa para seguimiento).
    - `admin/page.tsx`: Panel de administración (incluye lógica para iniciar/detener seguimiento GPS).
    - `login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`: Páginas de autenticación.
    - `api/stripe/`: API routes para la integración con Stripe (crear sesión en EUR, webhook).
    - `globals.css`: Estilos globales y variables de tema de ShadCN/Tailwind.
- **`src/components/`**: Componentes reutilzables de React.
    - `ui/`: Componentes de ShadCN UI (auto-generados o personalizados).
    - `cart/`: Componentes relacionados con el carrito de compras.
    - `checkout/`: Componentes para el proceso de checkout.
    - `layout/`: Componentes estructurales (Header, etc.).
    - `products/`: Componentes para mostrar productos (incluye `CustomizePizzaDialog.tsx`).
    - `icons/`: Componentes de iconos personalizados (ej. `PizzaPlaceLogo.tsx`).
    - `maps/`: Componentes relacionados con mapas (ej. `OrderTrackingMap.tsx`).
- **`src/context/`**: Proveedores de React Context.
- **`src/data/`**: Datos estáticos de la aplicación (incluye `availableExtras.ts`).
- **`src/hooks/`**: Hooks personalizados de React.
- **`src/lib/`**: Funciones de utilidad y definiciones de tipos.
    - `firebase.ts`: Configuración e inicialización de Firebase.
    - `stripe.ts`: Configuración de Stripe.
    - `types.ts`: Definiciones de interfaces y tipos (incluye `OrderStatus` actualizado, `translateOrderStatus`, `ExtraItem`, y `CartItem` con `selectedExtras` y `cartItemId`; `OrderItem` con `selectedExtras` y `unitPriceWithExtras`).
    - `utils.ts`: Funciones de utilidad genéricas.
- **`src/ai/`**: Lógica relacionada con Inteligencia Artificial utilizando Genkit.
- **`docs/`**: Documentación del proyecto.
- **`public/`**: Archivos estáticos servidos públicamente.
    - `manifest.json`: Manifiesto para la PWA.
    - `icons/`: Iconos para la PWA.
    - `leaflet/`: Iconos necesarios para Leaflet (marker-icon.png, etc.).

## 4. Flujo de Datos y Lógica de Negocio Clave

(Secciones anteriores: Autenticación, Visualización de Productos)

### 4.3. Gestión del Carrito
1.  **Añadir al Carrito:**
    *   Para productos no personalizables (no-Pizzas), se añaden directamente al carrito con cantidad 1.
    *   Para Pizzas, al hacer clic en "Personalizar", se abre un modal (`CustomizePizzaDialog`).
    *   En el modal, el usuario puede seleccionar ingredientes extra (`ExtraItem`). El precio total de la pizza se actualiza dinámicamente.
    *   Al confirmar, se añade un `CartItem` al carrito. Este `CartItem` incluye el producto base, la cantidad, una lista de `selectedExtras` y un `cartItemId` único (generado a partir del ID del producto y los extras seleccionados) para distinguir pizzas iguales con diferentes extras.
2.  **`CartContext`:** Gestiona el array de `cartItems`.
    *   Persiste los `cartItems` en Local Storage.
    *   Funciones para actualizar cantidad (basado en `cartItemId`), eliminar (`cartItemId`), y limpiar el carrito.
    *   Calcula el subtotal sumando `(product.price + sum_of_extras_prices) * quantity` para cada `CartItem`.
3.  **Visualización:**
    *   El `CartSidebar` muestra cada `CartItem`, incluyendo sus `selectedExtras` y el precio total del ítem (considerando extras y cantidad).
    *   La página de `Checkout` también muestra los detalles de los `selectedExtras` en el resumen del pedido.

### 4.4. Proceso de Checkout
1.  **Formulario de Checkout:** El usuario introduce sus datos de envío.
2.  **Creación de Sesión en Stripe (`/api/stripe/create-checkout-session`):**
    *   Se envían los `cartItems` (incluyendo `selectedExtras`) y la información del usuario/envío al backend.
    *   Para cada `CartItem`, se calcula el `unit_amount` para Stripe sumando el precio base del producto y el precio de todos sus `selectedExtras`.
    *   El nombre del producto enviado a Stripe se modifica para incluir un resumen de los extras (ej., "Pizza Margarita (Extras: Extra Mozzarella, Aceitunas)").
    *   Los `selectedExtras` completos para cada `CartItem` se almacenan en los `metadata` de la sesión de Stripe (como `cartItems`).
    *   La moneda se establece en `eur`.
3.  **Redirección a Stripe:** El usuario completa el pago en la pasarela de Stripe.
4.  **Webhook de Stripe (`/api/stripe/webhook`):**
    *   Al recibir el evento `checkout.session.completed`:
        *   Se recuperan los `simplifiedCartItems` (que ahora incluyen `selectedExtras`) de los `metadata`.
        *   Para cada ítem, se busca el producto base en Firestore.
        *   Se reconstruye cada `OrderItem` para el pedido en Firestore, almacenando el `productId`, los `selectedExtras`, la cantidad, y el `unitPriceWithExtras` (calculado como base + extras).
        *   El `totalAmount` del pedido se calcula sumando `unitPriceWithExtras * quantity` para todos los ítems.
        *   Se guarda el nuevo pedido en la colección `orders` de Firestore con estado "Pending".
5.  **Páginas de Éxito/Cancelación:** Se redirige al usuario según el resultado del pago. El carrito se limpia en caso de éxito (generalmente por la acción del webhook, pero con un fallback en el cliente).

(Secciones anteriores: Gestión de Productos (Admin), Notificaciones de Estado de Pedido, Seguimiento de Pedidos, Estilo y Tematización, Consideraciones y Futuras Mejoras)

Este documento proporciona una visión general de la arquitectura actual. Se actualizará a medida que el proyecto evolucione.
