
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
    - [x] **Gestión de Productos (CRUD completo).**
    - [x] Visualización y gestión de pedidos recibidos (cambio de estado, sin "Shipped", con traducciones).
    - [x] Visualización y gestión de roles de usuarios.
    - [ ] Gestión de categorías de productos.
- [x] **Integración de Pasarela de Pago Real (Stripe):**
    - [x] Configurar cuenta de Stripe y obtener claves API (modo prueba).
    - [x] Añadir paquetes `stripe` y `@stripe/stripe-js`.
    - [x] Crear API route `/api/stripe/create-checkout-session` (configurada en EUR).
    - [x] Modificar `CheckoutForm.tsx` para redirigir a Stripe.
    - [x] Crear páginas de éxito (`/checkout/success`) y cancelación (`/checkout/cancel`).
    - [x] **Implementar Webhook de Stripe (`/api/stripe/webhook`):**
        - [x] Manejar evento `checkout.session.completed` para crear el pedido en Firestore.
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
- [ ] **Configuración de CI/CD:**
    *   [ ] Pipeline para compilación, pruebas y despliegue automáticos.
- [ ] **Manejo de Errores Avanzado:**
    *   [x] Página 404 personalizada (Next.js la provee por defecto, se puede customizar).
    *   [x] Mejora de los mensajes de error para el usuario (a través de toasts y FormMessage).
    *   [x] Corrección de errores de análisis y renderizado en página de perfil.
- [ ] **Sección de "Ofertas Especiales" o "Promociones".**
- [ ] **Posibilidad de personalizar pizzas (ingredientes extra/quitados).**

## Documentación
- [x] Mantener actualizada la documentación de arquitectura.
- [ ] Documentar componentes complejos.
- [ ] Añadir guías para desarrolladores (cómo levantar el entorno, convenciones de código).

Este listado es dinámico y se actualizará a medida que el proyecto avance.
