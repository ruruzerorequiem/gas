# Manual de Usuario y Guía Operativa - Gas El Volcán Chillán
**Evaluación Parcial N° 3 - Desarrollo Fullstack II (DSY1104) | Duoc UC**  
**Servidor de Producción en Vivo:** [http://98.91.220.69/](http://98.91.220.69/)

---

## 📌 Guía Rápida para el Alumno / Expositor

Este documento explica de forma clara y sin tecnicismos excesivos **cómo usar cada pantalla del sistema web**, cómo mostrarle las funcionalidades al profesor, qué botones presionar y qué credenciales utilizar.

---

## 1. Cuentas de Acceso y Botones Rápidos

En la pantalla de **Ingreso / Registro** encontrarás botones automáticos para no tener que escribir las credenciales a mano durante la presentación:

```
┌────────────────────────────────────────────────────────┐
│               BOTONES DE ACCESO RÁPIDO                 │
├────────────────────────────────────────────────────────┤
│ [ Admin: admin@gaselvolcan.cl ]  -> Clave: admin123    │
│ [ Operadora: operadora@gaselvolcan.cl ] -> Clave: opera123 │
│ [ Repartidor: repartidor@gaselvolcan.cl ] -> Clave: repa123│
│ [ Cliente: cliente@gmail.com ] -> Clave: cliente123    │
└────────────────────────────────────────────────────────┘
```

### Tabla de Roles y Permisos en el Sistema:

| Rol | Usuario / Correo | Contraseña | ¿Qué puede hacer en la web? |
| :--- | :--- | :--- | :--- |
| **Administrador (`ROLE_ADMIN`)** | `admin` / `admin@gaselvolcan.cl` | `admin123` | **Control total:** Acceso al Panel de Gestión, métricas en vivo, crear/editar/eliminar productos (con fotos), crear/editar/eliminar usuarios y pedidos de forma permanente en MySQL. |
| **Operadora (`ROLE_OPERADORA`)** | `operadora` / `operadora@gaselvolcan.cl` | `opera123` | **Logística:** Acceso al Panel de Gestión para monitorear pedidos en Chillán, asignar choferes, cambiar estados (`EN_CAMINO`, `ENTREGADO`) y modificar datos de entrega. |
| **Repartidor (`ROLE_REPARTIDOR`)** | `repartidor` / `repartidor@gaselvolcan.cl` | `repa123` | **Despacho:** Ver pedidos asignados para ruta y confirmar entrega en domicilio (descuenta el stock físico). |
| **Cliente (`ROLE_CLIENTE`)** | `cliente@gmail.com` | `cliente123` | **Comercio:** Ver catálogo de cilindros, agregar al carrito, simular pago con Banco Estado (BE Pass) y consultar historial de pedidos. |

---

## 2. Flujo Completo del Cliente (Paso a Paso)

### Paso 1: Explorar Catálogo y Agregar Cilindros
1. Ingresa a la web: [http://98.91.220.69/](http://98.91.220.69/).
2. Haz clic en la pestaña **"Cilindros de Gas"** en la barra superior.
3. Observarás las tarjetas de productos con su respectiva fotografía, precio en CLP y stock disponible.
4. Presiona el botón **"Agregar al Pedido"** en uno o varios cilindros (ej: Cilindro 11 kg y Cilindro 15 kg).
5. Observa cómo el contador del carrito en la esquina superior derecha (`Mis Pedidos`) se actualiza al instante.

### Paso 2: Ir al Carrito de Compras
1. Haz clic en el botón superior **"Mis Pedidos"**.
2. Verás el resumen de los productos seleccionados, la cantidad y el total a pagar.
3. Si no estás conectado, el sistema te mostrará un mensaje amigable solicitando iniciar sesión o registrarte. Puedes hacer clic en el botón de acceso rápido **Cliente** para entrar en un segundo.

### Paso 3: Completar Datos de Entrega en Chillán
1. Ingresa la dirección de despacho (ej: *Av. O'Higgins 450, Chillán*).
2. Selecciona la zona o sector de entrega (ej: *Zona Centro*, *Sector Los Volcanes*, *Las Mariposas*, etc.).
3. En el método de pago, selecciona **"Banco Estado (Transferencia / BE Pass)"**.

### Paso 4: Simular el Pago con Banco Estado
1. Presiona el botón naranja **"Confirmar y Pagar"**.
2. Se desplegará el modal oficial con diseño de **Banco Estado**:
   - **Paso 1 (Credenciales):** Muestra el nombre del comercio (*Distribuidora Gas El Volcán Chillán*), el RUT del comercio y el monto total en CLP. Ingresa tu RUT (ej: `18.492.114-K`) y tu clave de 4 dígitos (puedes poner `1234`). Presiona **"Continuar a Autorización"**.
   - **Paso 2 (Segundo Factor BE Pass):** Aparece el desafío de seguridad BE Pass solicitando la clave de 6 dígitos que llega a la aplicación móvil del banco. Escribe la clave de prueba sugerida: `123456`.
   - Presiona **"Autorizar Pago"**.
3. El modal se cierra, la compra queda confirmada y el sistema genera automáticamente el número de orden de pedido.

### Paso 5: Consultar Historial ("Mis Pedidos Realizados")
1. En la misma pantalla del carrito, haz clic en el botón superior **"Mis Pedidos Realizados"**.
2. Verás tu pedido recién realizado con:
   - Número de Orden.
   - Producto y Cantidad.
   - Total Pagado.
   - Estado de Entrega: `PENDIENTE`.
   - Estado del Pago: `Pagado (Banco Estado)` con una insignia verde de confirmación.

---

## 3. Flujo para la Operadora y Administrador (Panel de Gestión)

Al ingresar con la cuenta de **Administrador** o de **Operadora**, aparecerá en la barra superior el acceso al **"Panel Gestión"** con un ícono de escudo.

### 3.1 Pestaña 1: "Pedidos Recibidos" (Logística en Vivo)
En esta vista se visualizan todos los pedidos que han hecho los clientes en Chillán:
- **Verificar Pago Confirmado:** Nota cómo los pedidos que pagaron con Banco Estado muestran la insignia verde `Pagado (Banco Estado)`. Los que eligieron efectivo muestran `Pendiente de Cobro`.
- **Despachar Pedido:** Haz clic en el botón azul **"Despachar"**. El estado del pedido cambiará en tiempo real a `EN_CAMINO`.
- **Entregar y Descontar Stock:** Haz clic en el botón verde **"Entregar"**. 
  - El estado cambiará a `ENTREGADO`.
  - **Dato clave para el profesor:** Al presionar "Entregar", el microservicio de pedidos llama internamente al microservicio de productos y descuenta automáticamente las unidades físicas del cilindro de la base de datos.
- **Editar Pedido:** Haz clic en el botón de edición (ícono de lápiz). Se abrirá un modal oscuro donde puedes modificar el nombre del cliente, dirección, cantidad de cilindros, repartidor asignado o el estado.
- **Eliminar Pedido:** Haz clic en el botón de papelera roja. Aparecerá un modal personalizado preguntando si deseas cancelar o eliminar definitivamente de MySQL. Al confirmar, desaparece al instante de la tabla.

### 3.2 Pestaña 2: "Productos & Stock" (Gestión del Catálogo - Solo Admin)
En esta pestaña, el Administrador puede gestionar todo el inventario:
- **Crear Nuevo Producto:**
  1. En el formulario superior, ingresa el nombre (ej: *Cilindro GLP 2 kg Camping*).
  2. Ingresa el precio (ej: `4500`), el stock inicial (ej: `30`) y la URL de imagen (puedes poner `/img/cilindros.png` o cualquier enlace de imagen web).
  3. Presiona **"Guardar Producto"**. Se añadirá de inmediato al catálogo.
- **Editar Producto Completo:**
  1. En la tabla de productos, haz clic en el botón azul **"Editar"**.
  2. En el modal interactivo podrás cambiar el nombre, precio, stock, URL de la imagen y estado (Activo/Inactivo).
  3. Presiona **"Guardar Cambios"**.
- **Eliminar Producto:**
  1. Presiona el botón rojo **"Eliminar"**.
  2. Confirma la acción en el modal. El registro se eliminará físicamente de la tabla `productos` en MySQL.

### 3.3 Pestaña 3: "Gestión de Usuarios" (Solo Admin)
- **Crear Funcionario:** Permite dar de alta a una nueva Operadora o Repartidor completando su nombre, correo y contraseña.
- **Editar Usuario:** Permite modificar el nombre, rol asignado (`ROLE_ADMIN`, `ROLE_OPERADORA`, `ROLE_REPARTIDOR`, `ROLE_CLIENTE`), estado (Activo o Suspendido) y cambiar su contraseña si el usuario la olvidó.
- **Eliminar Usuario:** Permite borrar definitivamente una cuenta de la base de datos.

---

## 4. Demostraciones Clave para Presentar al Profesor

### Demostración 1: Demostrar la Seguridad por Roles (RBAC)
1. Cierra sesión y entra como **Cliente** (`cliente@gmail.com`).
2. Intenta ingresar a la URL del panel: `http://98.91.220.69/admin`.
3. Muestra la pantalla bloqueada con el aviso de seguridad:
   *`⛔ Acceso Restringido: Esta vista requiere permisos de Administrador u Operadora. Tu rol actual es: ROLE_CLIENTE`*.

### Demostración 2: Demostrar que los Datos están en MySQL Real
1. Abre PowerShell y conéctate por SSH:
   ```powershell
   ssh -i "C:\Users\rodri\Downloads\gas-produccion.pem" ubuntu@98.91.220.69
   ```
2. Entra a MySQL:
   ```bash
   sudo mysql -u root
   ```
3. Ejecuta la consulta de pedidos:
   ```sql
   USE gas_pedidos_db;
   SELECT id, cliente_nombre, producto_nombre, total_pagar, estado, pago_registrado FROM pedidos ORDER BY id DESC LIMIT 3;
   ```
4. El profesor verá el pedido que acabas de hacer reflejado en la base de datos con `pago_registrado = 1`.

### Demostración 3: Demostrar la Interacción de Swagger UI
1. Abre en otra pestaña del navegador: [http://98.91.220.69:8082/swagger-ui.html](http://98.91.220.69:8082/swagger-ui.html).
2. Despliega el endpoint `GET /api/productos` y haz clic en **"Try it out"** -> **"Execute"**.
3. Muéstrale al profesor cómo el backend responde con el JSON de los cilindros en tiempo real.
