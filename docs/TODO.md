

# Lista de Tareas Pendientes (TODO)

Este documento rastrea las características y mejoras planificadas para PizzaPlace.

## Funcionalidades Principales
- [x] **Autenticación de Usuarios (Simulada - Fase 1):**
    - [x] Crear `AuthContext` para estado de usuario (simulado).
    - [x] Página de "Iniciar Sesión" (`/login`) con formulario básico.
    - [x] Página de "Registrarse" (`/signup`) con formulario básico.
    - [x] Página de "Perfil" (`/profile`) básica para usuario conectado.
    - [x] Actualizar `Header` para mostrar enlaces condicionales (Login/Signup vs Profile/Logout).
    - [x] Persistencia básica del estado de login en `localStorage`.
- [x] **Autenticación de Usuarios (Firebase Auth - Fase 2):**
    - [x] Integrar con Firebase Authentication (Email/Password).
    - [x] Configurar inicialización de Firebase (`src/lib/firebase.ts`).
    - [x] Actualizar `AuthContext` para usar Firebase Auth (`onAuthStateChanged`, `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `updateProfile`).
    - [x] Actualizar páginas de Login y Signup para usar los métodos de Firebase a través del contexto.
    - [x] Actualizar página de Perfil para mostrar datos del usuario de Firebase.
    - [x] Añadir manejo de errores y notificaciones (toasts) para operaciones de autenticación.
    - [x] Crear archivo `.env.local.example` para las credenciales de Firebase.
- [x] **Protección de Rutas:**
    - [x] Proteger rutas como `/profile` y `/checkout` para que solo usuarios autenticados puedan acceder. Redirigir a `/login` si no está autenticado.
    - [x] Rutas como `/login` y `/signup` deberían redirigir a `/profile` o `/` si el usuario ya está autenticado.
- [x] **Autenticación de Usuarios (Firebase Auth - Fase 3 - Proveedores Sociales):**
    - [x] Añadir opción de inicio de sesión con Google.
    - [ ] Añadir opción de inicio de sesión con Facebook (opcional).
- [x] **Manejo de Contraseñas Avanzado (Firebase Auth):**
    - [x] Implementar funcionalidad de "Olvidé mi contraseña" (restablecimiento de contraseña por correo).
    - [x] Opción de cambiar contraseña desde el perfil del usuario.
- [x] **Verificación de Correo Electrónico (Firebase Auth):**
    - [x] Enviar correo de verificación al registrarse.
    - [x] Mostrar estado de verificación en el perfil y restringir ciertas acciones si no está verificado. (Mostrando estado, sin restringir por ahora)
- [x] **Historial de Pedidos:**
    - [x] Guardar pedidos en Firestore al completar el checkout.
    - [x] Página para que los usuarios vean sus pedidos anteriores (requiere backend o Firestore).
    - [x] Detalles de cada pedido.
- [x] **Edición de Perfil de Usuario:**
    - [x] Permitir al usuario editar su nombre (`displayName`) desde el perfil.
    - [x] Permitir al usuario editar/establecer su dirección de envío predeterminada desde el perfil.
    - [x] Permitir al usuario editar/establecer su método de pago simulado predeterminado desde el perfil.
- [ ] **Panel de Administración:**
    - [x] Definir rol 'admin' en `UserProfile` (Firestore).
    - [x] Crear página básica `/admin` protegida por rol.
    - [x] Añadir enlace condicional al panel de admin en el Header.
    - [ ] CRUD para productos (Pizzas, Acompañamientos, Bebidas, Postres) - podría usar Firestore.
    - [ ] Gestión de categorías de productos.
    - [ ] Visualización y gestión de pedidos recibidos.
    - [ ] Gestión de usuarios (roles básicos).
- [ ] **Integración de Pasarela de Pago Real:**
    - [ ] Integración con Stripe o PayPal.
    - [ ] Manejo seguro de transacciones.
- [ ] **Seguimiento de Pedidos en Tiempo Real (simulado o básico con Firestore):**
    - [ ] Actualización del estado del pedido (ej. Preparando, En camino, Entregado).
- [ ] **Internacionalización (i18n):**
    - [ ] Soporte para múltiples idiomas (ej. Inglés y Español).

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
    *   [ ] Revisión y optimización de la carga de imágenes.
    *   [ ] Code splitting y lazy loading donde sea aplicable.
    *   [ ] Monitorización del rendimiento (Lighthouse, Web Vitals).
- [ ] **Mejoras de Accesibilidad (A11y):**
    *   [ ] Auditoría completa de accesibilidad.
    *   [ ] Asegurar el cumplimiento de WCAG AA.
- [ ] **Configuración de CI/CD:**
    *   [ ] Pipeline para compilación, pruebas y despliegue automáticos.
- [ ] **Manejo de Errores Avanzado:**
    *   [ ] Página 404 personalizada.
    *   [ ] Mejora de los mensajes de error para el usuario.
- [ ] **Sección de "Ofertas Especiales" o "Promociones".**
- [ ] **Posibilidad de personalizar pizzas (ingredientes extra/quitados).**
- [ ] **Notificaciones Push (opcional) para actualizaciones de pedidos.**

## Documentación
- [x] Mantener actualizada la documentación de arquitectura.
- [ ] Documentar componentes complejos.
- [ ] Añadir guías para desarrolladores (cómo levantar el entorno, convenciones de código).

Este listado es dinámico y se actualizará a medida que el proyecto avance.
