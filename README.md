# Distribuidora de Gas El Volcán - Chillán
**Evaluación Parcial N° 3 - Desarrollo Fullstack II (DSY1104) | Duoc UC**

Sistema web fullstack basado en microservicios independientes con **Java 21 + Spring Boot 3/4** en el backend y **React 19 + Vite + Bootstrap 5** en el frontend, desplegado en producción en una máquina virtual de **Amazon Web Services (AWS EC2 - Ubuntu 24.04 LTS)** bajo servidor web y proxy inverso **Nginx**, con bases de datos relacionales independientes en **MySQL 8**.

---

## 🌐 Enlaces Oficiales del Entorno de Producción

| Recurso | Enlace / URL | Descripción |
| :--- | :--- | :--- |
| **Sitio Web en Vivo** | [http://98.91.220.69/](http://98.91.220.69/) | Tienda virtual, Carrito, Pagos BancoEstado y Panel de Gestión |
| **Microservicio Usuarios (Swagger)** | [http://98.91.220.69:8081/swagger-ui.html](http://98.91.220.69:8081/swagger-ui.html) | Login, Registro, JWT y CRUD Usuarios |
| **Microservicio Productos (Swagger)** | [http://98.91.220.69:8082/swagger-ui.html](http://98.91.220.69:8082/swagger-ui.html) | Catálogo de balones, CRUD de productos e inventario |
| **Microservicio Pedidos (Swagger)** | [http://98.91.220.69:8083/swagger-ui.html](http://98.91.220.69:8083/swagger-ui.html) | Gestión de pedidos, trazabilidad y cobro BancoEstado |

---

## 🔑 Cuentas y Credenciales de Prueba Precargadas

| Rol | Username / Correo | Contraseña | Permisos y Vistas en la Web |
| :--- | :--- | :--- | :--- |
| **Administrador (`ROLE_ADMIN`)** | `admin` (o `admin@gaselvolcan.cl`) | `admin123` | **Control total:** Dashboard con métricas, CRUD completo de Productos (con fotos), CRUD de Usuarios y Pedidos, y eliminación definitiva en MySQL. |
| **Operadora (`ROLE_OPERADORA`)** | `operadora` (o `operadora@gaselvolcan.cl`) | `opera123` | **Logística:** Despacho de pedidos, asignación de choferes y actualización de estados (`EN_CAMINO`, `ENTREGADO`). |
| **Repartidor (`ROLE_REPARTIDOR`)** | `repartidor` (o `repartidor@gaselvolcan.cl`) | `repa123` | **Despacho en terreno:** Confirmación de entregas con descuento automático de stock físico en bodega. |
| **Cliente (`ROLE_CLIENTE`)** | `cliente@gmail.com` | `cliente123` | **Comercio:** Compra de cilindros, simulación de pago Banco Estado (BE Pass) y trazabilidad de pedidos. |

> **Nota:** La pantalla de ingreso incluye botones de **Acceso Rápido** que llenan automáticamente estos campos al hacer un clic.

---

## 🖥️ Cómo Conectarse al Servidor EC2 desde Windows PowerShell

Para acceder a la máquina virtual donde corre toda la infraestructura del proyecto:

1. Abre **PowerShell** en tu computador Windows.
2. Ejecuta el comando SSH indicando la ruta de la clave privada `.pem`:
   ```powershell
   ssh -i "C:\Users\rodri\Downloads\gas-produccion.pem" ubuntu@98.91.220.69
   ```
3. **Verificar que los microservicios y puertos estén activos:**
   ```bash
   ss -tulpn | grep -E '8081|8082|8083|3306|80'
   ```
4. **Si necesitas reiniciar o levantar los 3 microservicios en segundo plano:**
   ```bash
   ~/iniciar.sh
   ```
5. **Para ver los logs en vivo de cada microservicio:**
   ```bash
   tail -f ~/pedidos.log
   tail -f ~/productos.log
   tail -f ~/usuarios.log
   ```

---

## 🗄️ Cómo Entrar y Ver la Base de Datos Real (MySQL 8 en EC2)

Cada microservicio posee su base de datos propia e independiente en el motor MySQL de la instancia:

1. Conéctate a EC2 por SSH (paso anterior).
2. Entra a la consola de MySQL como administrador:
   ```bash
   sudo mysql -u root
   ```
3. Ver las bases de datos creadas:
   ```sql
   SHOW DATABASES;
   ```
4. **Verificar Usuarios y Contraseñas Cifradas (BCrypt):**
   ```sql
   USE gas_usuarios_db;
   SELECT id, username, nombre_completo, rol, activo, password FROM usuarios;
   ```
5. **Verificar Catálogo de Productos y Stock Físico:**
   ```sql
   USE gas_productos_db;
   SELECT id, nombre, precio, stock_actual, imagen_url, activo FROM productos;
   ```
6. **Verificar Pedidos y Pagos Confirmados con Banco Estado:**
   ```sql
   USE gas_pedidos_db;
   SELECT id, cliente_nombre, producto_nombre, total_pagar, estado, pago_registrado, fecha_creacion FROM pedidos ORDER BY id DESC LIMIT 5;
   ```
7. Para salir de MySQL:
   ```sql
   EXIT;
   ```

---

## 🏦 Cómo Explicar el Módulo de "Banco Estado" al Profesor

Si el profesor pregunta si la pasarela de Banco Estado es real o cómo funciona:

1. **Flujo de Usuario (Frontend):**
   - En el carrito de compras, el cliente ingresa su dirección en Chillán y selecciona **"Banco Estado (Transferencia / BE Pass)"**.
   - Se abre un modal institucional diseñado bajo la identidad corporativa oficial de Banco Estado.
   - **Paso 1:** Solicita el RUT titular y la clave de internet de 4 dígitos.
   - **Paso 2:** Simula el desafío de segundo factor de seguridad **BE Pass** (clave de 6 dígitos que emite la App móvil del banco, con clave de prueba sugerida `123456`).
2. **Impacto en Base de Datos y Backend:**
   - Al hacer clic en **"Autorizar Pago"**, el frontend despacha el pedido al backend (`POST /api/pedidos`) enviando explícitamente `pagoRegistrado: true`.
   - El microservicio de pedidos almacena la orden en MySQL con `pago_registrado = 1` y estado `PENDIENTE` (listo para despacho).
   - En el Dashboard de la Operadora y Administrador, el pedido figura inmediatamente con la etiqueta verde **`Pagado (Banco Estado)`**, evitando que el repartidor cobre nuevamente en efectivo.
3. **Respuesta sugerida para la defensa:**
   - *"Profesor, la arquitectura simula de forma fidedigna la pasarela Botón de Pago Banco Estado bajo estándar REST y doble factor BE Pass. Valida el formato del RUT chileno, procesa la transacción de débito cuenta RUT y registra el pago confirmado directamente en el microservicio de pedidos en MySQL sin intermediarios no certificados."*

---

## 📚 Documentos de Consulta en el Repositorio

- **`DOCUMENTO_INTEGRACION.md`**: Informe técnico de arquitectura, diagrama de bloques, configuración de proxy Nginx, especificación de los 3 microservicios, seguridad JWT y matriz completa de endpoints REST.
- **`MANUAL_USUARIO.md`**: Guía paso a paso para el usuario final y operadores, explicación de pantallas, modales personalizados, roles y pruebas en vivo para la presentación.
