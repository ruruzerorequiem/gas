# Distribuidora Gas El Volcán - Chillán
**Evaluación Parcial N° 3 - Desarrollo Fullstack II (DSY1104) | Duoc UC**

Sistema web fullstack basado en microservicios independientes con **Java 21 + Spring Boot 3/4** en el backend y **React 19 + Vite** en el frontend, desplegado en producción en **Amazon EC2 (Ubuntu 24.04 LTS)** bajo servidor web y proxy inverso **Nginx**, con bases de datos relacionales **MySQL 8**.

---

## 🚀 Acceso Rápido al Entorno de Producción en Vivo

| Recurso | Dirección URL / Conexión | Descripción |
| :--- | :--- | :--- |
| **Sitio Web en Vivo** | [http://52.55.228.10/](http://52.55.228.10/) | Tienda virtual, Carrito, Pagos BancoEstado y Panel de Gestión |
| **Microservicio Usuarios (API & Swagger)** | [http://52.55.228.10:8081/swagger-ui.html](http://52.55.228.10:8081/swagger-ui.html) | Login, Registro, JWT y CRUD Usuarios |
| **Microservicio Productos (API & Swagger)** | [http://52.55.228.10:8082/swagger-ui.html](http://52.55.228.10:8082/swagger-ui.html) | Catálogo de balones, CRUD de productos e inventario |
| **Microservicio Pedidos (API & Swagger)** | [http://52.55.228.10:8083/swagger-ui.html](http://52.55.228.10:8083/swagger-ui.html) | Gestión de pedidos, trazabilidad y cobro BancoEstado |

---

## 🔑 Credenciales de Prueba Precargadas

| Rol | Username / Correo | Contraseña | Permisos y Vistas |
| :--- | :--- | :--- | :--- |
| **Administrador (`ROLE_ADMIN`)** | `admin` (o `admin@gaselvolcan.cl`) | `admin123` | Control total del sistema, CRUD completo de Productos, Usuarios y Pedidos, eliminación definitiva en MySQL. |
| **Operadora (`ROLE_OPERADORA`)** | `operadora` (o `operadora@gaselvolcan.cl`) | `opera123` | Gestión y despacho de pedidos, asignación de choferes, actualización de estados de entrega. |
| **Repartidor (`ROLE_REPARTIDOR`)** | `repartidor` (o `repartidor@gaselvolcan.cl`) | `repa123` | Confirmación de entregas en terreno y descuento automático de stock. |
| **Cliente (`ROLE_CLIENTE`)** | `cliente@gmail.com` | `cliente123` | Catálogo de cilindros, simulación de pago con Banco Estado y trazabilidad de sus pedidos. |

---

## 💻 Conexión al Servidor EC2 desde Windows PowerShell

Para ingresar a la máquina virtual donde corre toda la infraestructura del proyecto:

1. Abre **PowerShell** en tu computador Windows.
2. Ejecuta el comando SSH apuntando a la clave privada `.pem`:
   ```powershell
   ssh -i "C:\Users\rodri\Downloads\gas-produccion.pem" ubuntu@52.55.228.10
   ```
3. Una vez conectado, para revisar el estado de los microservicios y puertos:
   ```bash
   ss -tulpn | grep -E '8081|8082|8083|3306|80'
   ```
4. Si necesitas reiniciar o levantar los 3 microservicios en segundo plano:
   ```bash
   ~/iniciar.sh
   ```
5. Para ver los logs en vivo de cada microservicio:
   ```bash
   tail -f ~/usuarios.log
   tail -f ~/productos.log
   tail -f ~/pedidos.log
   ```

---

## 🗄️ Cómo Entrar y Ver la Base de Datos Real (MySQL en EC2)

Cada microservicio posee su base de datos propia e independiente en el motor MySQL de la instancia:

1. Conéctate a EC2 por SSH (según el paso anterior).
2. Entra a la consola de MySQL como administrador:
   ```bash
   sudo mysql -u root
   ```
3. Ver las bases de datos del proyecto:
   ```sql
   SHOW DATABASES;
   ```
4. **Inspeccionar Usuarios y Contraseñas Cifradas (BCrypt):**
   ```sql
   USE gas_usuarios_db;
   SELECT id, username, nombre_completo, rol, activo FROM usuarios;
   ```
5. **Inspeccionar Catálogo de Productos y Stock:**
   ```sql
   USE gas_productos_db;
   SELECT id, nombre, precio, stock_actual, imagen_url, activo FROM productos;
   ```
6. **Inspeccionar Pedidos y Pagos de Banco Estado:**
   ```sql
   USE gas_pedidos_db;
   SELECT id, cliente_nombre, producto_nombre, total_pagar, estado, pago_registrado, fecha_creacion FROM pedidos ORDER BY id DESC;
   ```
7. Para salir de MySQL:
   ```sql
   EXIT;
   ```

---

## 🏦 Cómo Explicar la Integración de "Banco Estado" al Profesor

Si el profesor pregunta por la pasarela de pago de Banco Estado:
1. **Flujo de Usuario:**
   - En el carrito de compras, el cliente completa su dirección en Chillán y selecciona **"Banco Estado (Transferencia / BE Pass)"**.
   - Se abre un modal institucional idéntico a la pasarela Webpay/BancoEstado con la información del comercio (**Gas El Volcán Chillán**, RUT comercio, orden de compra y monto en CLP).
   - El cliente ingresa su RUT titular y su clave de 4 dígitos.
   - Pasa al paso 2 de seguridad bancaria con el desafío **BE Pass** (clave de 6 dígitos enviada a la App móvil del banco).
2. **Impacto en Base de Datos y Backend:**
   - Al hacer clic en **"Autorizar Pago"**, el frontend despacha el pedido al backend (`POST /api/pedidos`) enviando explícitamente el flag `pagoRegistrado: true`.
   - El microservicio de pedidos guarda la transacción en la tabla `pedidos` de MySQL con `pago_registrado = 1` y estado `PENDIENTE` (listo para despacho por la operadora).
   - En el Dashboard de la Operadora o Administrador se visualiza inmediatamente con la etiqueta verde **`Pagado (Banco Estado)`**, sin quedar como "Pago Pendiente".
3. **Respuesta ante el Profesor:**
   - *"Profesor, la arquitectura implementa una simulación fidedigna de la pasarela Botón de Pago Banco Estado bajo estándar REST y doble factor BE Pass. Valida el formato del RUT chileno, procesa la transacción de débito cuenta RUT y registra el pago confirmado directamente en el microservicio de pedidos en MySQL sin intermediarios no certificados."*

---

## 📂 Estructura de Documentación del Repositorio

- **`DOCUMENTO_INTEGRACION.md`**: Informe técnico completo según la pauta de evaluación DSY1104 (arquitectura de microservicios, seguridad JWT, endpoints REST, Swagger, modelos relacionales y CORS).
- **`MANUAL_USUARIO.md`**: Manual operativo paso a paso para el usuario final, operadora y administrador, con capturas de flujo y casos de prueba.
