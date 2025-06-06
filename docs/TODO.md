
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
- [ ] **Autenticación de Usuarios (Completa - Fase 2):**
    - [ ] Integrar con un servicio de autenticación real (Firebase Auth o NextAuth.js).
    - [ ] Manejo seguro de contraseñas (hashing).
    - [ ] Verificación de correo electrónico.
    - [ ] Opción de "Olvidé mi contraseña".
    - [ ] Protección de rutas (ej. perfil de usuario, historial de pedidos) - redireccionar si no está autenticado.
- [ ] **Historial de Pedidos:**
    - [ ] Página para que los usuarios vean sus pedidos anteriores (requiere backend).
    - [ ] Detalles de cada pedido.
- [ ] **Panel de Administración:**
    - [ ] CRUD para productos (Pizzas, Acompañamientos, Bebidas, Postres).
    - [ ] Gestión de categorías de productos.
    - [ ] Visualización y gestión de pedidos recibidos.
    - [ ] Gestión de usuarios.
- [ ] **Integración de Pasarela de Pago Real:**
    - [ ] Integración con Stripe o PayPal.
    - [ ] Manejo seguro de transacciones.
- [ ] **Seguimiento de Pedidos en Tiempo Real (simulado o básico):**
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
    - [ ] Revisión y optimización de la carga de imágenes.
    - [ ] Code splitting y lazy loading donde sea aplicable.
    - [ ] Monitorización del rendimiento (Lighthouse, Web Vitals).
- [ ] **Mejoras de Accesibilidad (A11y):**
    - [ ] Auditoría completa de accesibilidad.
    - [ ] Asegurar el cumplimiento de WCAG AA.
- [ ] **Configuración de CI/CD:**
    - [ ] Pipeline para compilación, pruebas y despliegue automáticos.
- [ ] **Manejo de Errores Avanzado:**
    - [ ] Página 404 personalizada.
    - [ ] Mejora de los mensajes de error para el usuario.
- [ ] **Sección de "Ofertas Especiales" o "Promociones".**
- [ ] **Posibilidad de personalizar pizzas (ingredientes extra/quitados).**
- [ ] **Notificaciones Push (opcional) para actualizaciones de pedidos.**

## Documentación
- [x] Mantener actualizada la documentación de arquitectura.
- [ ] Documentar componentes complejos.
- [ ] Añadir guías para desarrolladores (cómo levantar el entorno, convenciones de código).

Este listado es dinámico y se actualizará a medida que el proyecto avance.
