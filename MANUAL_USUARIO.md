# Manual de Usuario y Guía de Operaciones - Gas El Volcán Chillán
**Evaluación Parcial N° 3 - Fullstack II (DSY1104) | Duoc UC**  
**Servidor de Producción Activo:** [http://52.55.228.10/](http://52.55.228.10/)

---

## 1. Introducción y Acceso a la Plataforma

Este manual proporciona las instrucciones detalladas para operar la plataforma de distribución de gas, tanto para clientes que realizan pedidos de cilindros a domicilio en Chillán, como para el personal interno (Operadora y Administrador) que gestiona el inventario, los usuarios y la logística de despacho.

La aplicación está disponible en la web mediante la IP pública del servidor:
👉 **[http://52.55.228.10/](http://52.55.228.10/)**

---

## 2. Roles del Sistema y Cuentas de Acceso Rápido

Para facilitar la demostración ante el profesor, la pantalla de **Ingreso / Registro** cuenta con botones de acceso directo que cargan automáticamente las credenciales correspondientes:

| Rol | Correo / Username | Contraseña | Vistas y Permisos Habilitados |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` (o `admin@gaselvolcan.cl`) | `admin123` | **Control total:** Dashboard con métricas, creación y edición completa de productos con imagen, gestión y eliminación definitiva de usuarios, y supervisión de pedidos. |
| **Operadora** | `operadora` (o `operadora@gaselvolcan.cl`) | `opera123` | **Logística:** Asignación de repartidores a pedidos, cambio de estados (`EN_CAMINO`, `ENTREGADO`), y edición de cantidades o direcciones. |
| **Repartidor** | `repartidor` (o `repartidor@gaselvolcan.cl`) | `repa123` | **Ruta:** Visualización de pedidos asignados para entrega y confirmación de recepción en el domicilio del cliente. |
| **Cliente** | `cliente@gmail.com` | `cliente123` | **Tienda:** Catálogo interactivo de cilindros, carrito de compras, pago seguro con Banco Estado, y seguimiento en vivo de pedidos propios. |

---

## 3. Guía Paso a Paso para el Cliente

### 3.1 Explorar Catálogo y Agregar Cilindros
1. Ingresa a la pestaña **"Cilindros de Gas"** en la barra superior.
2. Podrás visualizar los distintos formatos disponibles:
   - **Cilindro GLP 5 kg:** Ideal para cocinillas y estufas pequeñas.
   - **Cilindro GLP 11 kg:** Formato estándar familiar en Chillán.
   - **Cilindro GLP 15 kg:** Mayor capacidad para consumo medio/alto.
   - **Cilindro GLP 45 kg:** Cilindro industrial para empresas y locales gastronómicos.
   - **Reguladores y Kits de Conexión.**
3. Presiona el botón **"Agregar al Pedido"** en los productos que necesites.

### 3.2 Realizar Pedido y Pagar con Banco Estado
1. Haz clic en el botón superior **"Mis Pedidos"** (ícono de carrito).
2. Si no has iniciado sesión, el sistema te solicitará ingresar tus datos o crearte una cuenta con tu RUT y teléfono de contacto.
3. Ingresa tu dirección exacta en Chillán (Calle, Número, Población o Villa) y selecciona el sector de entrega (Centro, Oriente, Poniente, Las Mariposas, etc.).
4. En el método de pago, selecciona **"Banco Estado (Transferencia / BE Pass)"**.
5. Al hacer clic en **"Confirmar y Pagar"**, se abrirá la pasarela oficial de pago seguro:
   - **Paso 1:** Revisa el monto en CLP y el RUT del comercio Gas El Volcán. Ingresa tu RUT titular y tu Clave de Internet Banco Estado (4 dígitos).
   - **Paso 2:** Se despliega el desafío de seguridad **BE Pass**. Ingresa la clave de 6 dígitos (puedes usar la clave de prueba sugerida `123456`).
   - Presiona **"Autorizar Pago"**.
6. El sistema confirmará la transacción bancaria de inmediato y el pedido quedará registrado con pago saldado y número de orden.

### 3.3 Revisar el Estado del Despacho
En la misma vista del carrito, haz clic en **"Mis Pedidos Realizados"**. Aquí verás una tabla en tiempo real con el estado de tu pedido (`PENDIENTE`, `EN_CAMINO` o `ENTREGADO`) y la confirmación de tu pago.

---

## 4. Guía para la Operadora y Administrador (Panel de Gestión)

Al iniciar sesión con una cuenta de **Administrador** u **Operadora**, aparecerá en la barra superior el enlace **"Panel Gestión"** con un ícono de engranaje/escudo.

### 4.1 Gestión de Pedidos y Despachos (Pestaña "Pedidos Recibidos")
- **Listado en Vivo:** Muestra todos los pedidos realizados en Chillán ordenados por fecha y hora.
- **Identificación de Pagos:** Si el cliente pagó mediante Banco Estado, se mostrará una etiqueta verde **`Pagado (Banco Estado)`**. Si eligió efectivo, saldrá **`Pendiente de Cobro`**.
- **Despachar Pedido:** Haz clic en el botón **"Despachar"** para cambiar el estado a `EN_CAMINO`.
- **Entregar y Cobrar:** Al hacer clic en **"Entregar"**, el pedido pasa a `ENTREGADO`. En ese instante, el sistema descuenta de forma automática las unidades vendidas del stock físico en el microservicio de productos.
- **Editar Pedido:** Haz clic en **"Editar"** para abrir el modal que permite modificar la dirección, el cliente, la cantidad o el repartidor asignado.
- **Eliminar Pedido:** Haz clic en el botón rojo de papelera. Se abrirá un modal de confirmación con diseño oscuro y legible. Al confirmar, el pedido se elimina inmediatamente de MySQL y desaparece de la vista.

### 4.2 Gestión de Catálogo y Productos (Pestaña "Productos & Stock" - Solo Admin)
- **Crear Producto:**
  1. En el panel superior, completa el nombre del producto, precio, stock inicial y una descripción clara.
  2. Puedes ingresar una **URL de Imagen** (ej: `/img/cilindro_11kg.png` o cualquier enlace web) para asignarle una fotografía al balón de gas.
  3. Presiona **"Guardar Producto"**.
- **Editar Producto Completo:**
  1. En la tabla de productos, haz clic en el botón azul **"Editar"**.
  2. Se abrirá el modal interactivo que permite modificar:
     - Nombre del producto.
     - Precio en pesos chilenos ($).
     - Stock en bodega.
     - URL de la imagen.
     - Estado del producto (Activo en catálogo o Inactivo).
  3. Presiona **"Guardar Cambios"**.
- **Eliminar Producto Definitivamente:**
  1. Presiona el botón rojo **"Eliminar"** en el producto correspondiente.
  2. Confirma en el modal. El producto se borra físicamente de la tabla `productos` de MySQL.

### 4.3 Gestión de Usuarios y Accesos (Pestaña "Gestión de Usuarios" - Solo Admin)
- **Crear Nuevo Funcionario:** Permite registrar nuevos administradores, operadoras o repartidores asignándoles su rol correspondiente.
- **Modificar Usuario:** Permite cambiar el nombre, el rol asignado (`ROLE_ADMIN`, `ROLE_OPERADORA`, `ROLE_REPARTIDOR`, `ROLE_CLIENTE`), el estado de la cuenta (Activo/Inactivo) y actualizar su contraseña si es necesario.
- **Eliminar Usuario:** Permite borrar definitivamente un usuario de la base de datos `gas_usuarios_db`.

---

## 5. Preguntas Frecuentes y Demostración ante el Docente

### ¿Cómo demostrar que la seguridad por roles funciona?
1. Inicia sesión con la cuenta de **Cliente** (`cliente@gmail.com`).
2. Intenta entrar al Panel de Gestión.
3. El sistema denegará el acceso mostrando la advertencia de seguridad:  
   *`⛔ Acceso Restringido: Esta vista requiere permisos de Administrador u Operadora. Tu rol actual es: ROLE_CLIENTE`*.

### ¿Cómo demostrar la persistencia en MySQL?
1. Abre PowerShell y conéctate por SSH:
   ```powershell
   ssh -i "C:\Users\rodri\Downloads\gas-produccion.pem" ubuntu@52.55.228.10
   ```
2. Ejecuta `sudo mysql -u root` y realiza un `SELECT * FROM gas_pedidos_db.pedidos;`.
3. Verás que el pedido creado en la web figura inmediatamente registrado en la tabla.
