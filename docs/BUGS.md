# Registro de Bugs y Soluciones

Este documento sirve para rastrear los bugs encontrados en el proyecto PizzaPlace, junto con sus soluciones o estado actual.

## Formato para Registrar un Bug

**ID del Bug:** (Un identificador único, ej. BUG-001)
**Fecha Reportado:** YYYY-MM-DD
**Reportado por:** (Nombre o iniciales)
**Prioridad:** (Alta / Media / Baja)
**Estado:** (Abierto / En Progreso / Resuelto / Cerrado / No se reproducirá)

**Descripción:**
(Una descripción clara y concisa del bug. Incluir pasos para reproducirlo si es posible.)

**Comportamiento Esperado:**
(Qué debería haber sucedido.)

**Comportamiento Actual:**
(Qué sucedió en realidad.)

**Capturas de Pantalla / Logs:**
(Si aplica, añadir enlaces o descripciones.)

**Solución Propuesta / Implementada:**
(Descripción de la solución o workaround.)

**Fecha Resuelto:** YYYY-MM-DD (Si aplica)
**Resuelto por:** (Nombre o iniciales)

---

## Bugs Registrados

### BUG-001
**ID del Bug:** BUG-001
**Fecha Reportado:** 2024-07-29
**Reportado por:** App Prototyper
**Prioridad:** Baja
**Estado:** Abierto

**Descripción:**
En la página de Checkout (`/checkout`), si el carrito está vacío, se muestra un mensaje "Your Cart is Empty" y un botón "Go Back to Menu". Sin embargo, el título principal "Checkout" y el resumen del pedido (que mostraría 0 artículos) aún podrían estar visibles o causar un layout menos ideal antes de que el mensaje de carrito vacío se renderice completamente. El `totalItems === 0` se verifica y el retorno temprano sucede, pero el resto del layout de la página podría intentar renderizarse brevemente.

**Comportamiento Esperado:**
La página de checkout debería mostrar limpiamente solo el mensaje de "Carrito Vacío" y el botón de retorno si el carrito no tiene artículos, sin mostrar otros elementos de la UI de checkout.

**Comportamiento Actual:**
El mensaje se muestra, pero existe la posibilidad de un breve parpadeo o renderizado parcial de otros elementos de la página de checkout.

**Solución Propuesta / Implementada:**
Revisar la lógica de renderizado condicional en `src/app/checkout/page.tsx`. Asegurarse de que el retorno temprano para un carrito vacío impida el renderizado de cualquier otra parte del layout de checkout. Considerar mover la lógica de `totalItems === 0` más arriba en el componente o usar un estado para controlar la visibilidad de las secciones.

**Fecha Resuelto:**
**Resuelto por:**

---
<!-- Añadir nuevos bugs aquí -->
