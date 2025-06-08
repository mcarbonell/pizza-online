
# Lista de Tareas Pendientes (TODO)

Este documento rastrea las características y mejoras planificadas para Pizzería Serranillo.

## Funcionalidades Principales
- [x] **Autenticación de Usuarios (Firebase Auth Completa)**
- [x] **Protección de Rutas**
- [x] **Manejo de Contraseñas Avanzado (Firebase Auth)**
- [x] **Verificación de Correo Electrónico (Firebase Auth)**
- [x] **Historial de Pedidos:**
    - [x] Guardar pedidos en Firestore al completar el checkout (vía webhook de Stripe).
    - [x] Página para que los usuarios vean sus pedidos anteriores.
    - [x] Detalles de cada pedido.
    - [x] **Actualización del estado del pedido en tiempo real (con toasts en perfil y estados traducidos).**
- [x] **Edición de Perfil de Usuario:**
    - [x] Permitir al usuario editar su nombre (`displayName`).
    - [x] Permitir al usuario editar/establecer su dirección de envío predeterminada.
- [x] **Panel de Administración:**
    - [x] Definir rol 'admin' en `UserProfile` (Firestore).
    - [x] Crear página básica `/admin` protegida por rol.
    - [x] Añadir enlace condicional al panel de admin en el Header.
    - [x] **Gestión de Productos (CRUD completo, incluyendo gestión de alérgenos).**
    - [x] Visualización y gestión de pedidos recibidos (cambio de estado, sin "Shipped", con traducciones).
    - [x] Visualización y gestión de roles de usuarios.
    - [ ] Gestión de categorías de productos.
    - [ ] Gestión de ingredientes extra disponibles (CRUD en panel de admin).
- [x] **Integración de Pasarela de Pago Real (Stripe):**
    - [x] Configurar cuenta de Stripe y obtener claves API (modo prueba).
    - [x] Añadir paquetes `stripe` y `@stripe/stripe-js`.
    - [x] Crear API route `/api/stripe/create-checkout-session` (configurada en EUR, maneja precios con extras).
    - [x] Modificar `CheckoutForm.tsx` para redirigir a Stripe.
    - [x] Crear páginas de éxito (`/checkout/success`) y cancelación (`/checkout/cancel`).
    - [x] **Implementar Webhook de Stripe (`/api/stripe/webhook`):**
        - [x] Manejar evento `checkout.session.completed` para crear el pedido en Firestore (incluyendo extras y alérgenos).
        - [ ] Manejar otros eventos relevantes (ej. `payment_intent.succeeded`, `payment_intent.payment_failed`).
        - [x] Asegurar y verificar firmas de webhook.
    - [x] Configurar Stripe CLI para pruebas locales de webhooks.
- [x] **PWA (Progressive Web App) Básica:**
    - [x] Configuración con `next-pwa`.
    - [x] `manifest.json` creado.
    - [x] El usuario debe crear y añadir los iconos (`public/icons/`).
- [ ] **Seguimiento de Pedidos en Tiempo Real (Avanzado):**
    - [x] **Implementación Simplificada:** Seguimiento GPS desde el panel de admin (móvil del repartidor) a Firestore y visualización en mapa para el cliente (PWA, con limitaciones de segundo plano, mapa funcionando).
    - [ ] Implementar notificaciones Push reales (ej. FCM) para cambios de estado de pedido y seguimiento.
- [x] **Internacionalización (i18n) - Textos en Español:**
    - [x] Traducir los textos de la interfaz de cliente (home, checkout, producto, carrito, etc.).
    - [x] Información del negocio (footer, horario) en español.
    - [x] Estados de pedido traducidos en la UI.
- [ ] **Optimización de Consultas a Firestore:**
    - [ ] Revisar y optimizar índices de Firestore para consultas comunes (ej. pedidos por usuario, productos por categoría).
- [ ] **Filtrado y Búsqueda de Productos:**
    - [ ] Permitir a los usuarios filtrar productos por categoría en la página principal.
    - [ ] Añadir una barra de búsqueda de productos.
- [x] **Personalización de Productos:**
    - [x] **Ingredientes Extra para Pizzas:** Permitir seleccionar ingredientes extra con coste adicional (1€ por extra) desde un modal.
    - [ ] **Mitad y Mitad (Pizzas):** Permitir seleccionar dos mitades diferentes para una pizza (coste adicional 1€). (Complejidad alta, futura mejora).
- [x] **Gestión y Visualización de Alérgenos:**
    - [x] Definición de tipos de datos y listado maestro de alérgenos.
    - [x] Productos en `src/data/products.ts` incluyen lista de alérgenos.
    - [x] Panel de admin permite seleccionar alérgenos al crear/editar productos.
    - [x] Sincronización de menú actualiza alérgenos de productos existentes en Firestore.
    - [x] Alérgenos visibles en `ProductCard` con tooltips descriptivos.


## Mejoras de IA con Genkit
- [ ] **Recomendaciones de Pizza Personalizadas:**
    - [ ] Sugerir pizzas basadas en el historial de pedidos o preferencias.
    - [ ] "Quiz de Pizza" para recomendar una pizza basada en gustos.
- [ ] **Asistente de Pedidos por Chat (Opcional):**
    - [ ] Permitir a los usuarios realizar pedidos mediante una interfaz de chat.
- [ ] **Optimización de Descripciones de Productos:**
    - [ ] Usar IA para generar o mejorar descripciones de productos.

## Mejoras Técnicas y de UX
- [ ] **Pruebas:**
    - [ ] Pruebas unitarias para componentes y lógica de negocio.
    - [ ] Pruebas de integración para flujos críticos (ej. proceso de compra).
    - [ ] Pruebas E2E (End-to-End) para simular la interacción del usuario.
- [ ] **Optimización de Rendimiento:**
    *   [x] Revisión y optimización de la carga de imágenes (uso de `next/image` y `remotePatterns`).
    *   [ ] Code splitting y lazy loading donde sea aplicable (ya se usa `next/dynamic` para mapa).
    *   [ ] Monitorización del rendimiento (Lighthouse, Web Vitals).
- [ ] **Mejoras de Accesibilidad (A11y):**
    *   [ ] Auditoría completa de accesibilidad.
    *   [ ] Asegurar el cumplimiento de WCAG AA.
    *   [x] **Corrección de errores de validación HTML en diálogos del panel de admin.**
- [ ] **Configuración de CI/CD:**
    *   [ ] Pipeline para compilación, pruebas y despliegue automáticos.
- [x] **Mejoras UI/UX en el Carrito de Compras:**
    *   [x] Corregido icono de cierre duplicado.
    *   [x] Mejorado espaciado y legibilidad de textos en ítems.
    *   [x] Reorganizado footer del carrito para mejor visualización del subtotal.
    *   [x] Eliminado toast innecesario al añadir producto.
- [ ] **Manejo de Errores Avanzado:**
    *   [x] Página 404 personalizada (Next.js la provee por defecto, se puede customizar).
    *   [x] Mejora de los mensajes de error para el usuario (a través de toasts y FormMessage).
    *   [x] Corrección de errores de análisis y renderizado en página de perfil.
- [ ] **Sección de "Ofertas Especiales" o "Promociones".**
- [ ] **Integrar Iconos SVG para Alérgenos en `ProductCard`.**

## Documentación
- [x] Mantener actualizada la documentación de arquitectura, README, DONE y TODO.
- [ ] Documentar componentes complejos.
- [ ] Añadir guías para desarrolladores (cómo levantar el entorno, convenciones de código).

Este listado es dinámico y se actualizará a medida que el proyecto avance.

