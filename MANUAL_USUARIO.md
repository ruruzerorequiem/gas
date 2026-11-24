# Manual de Usuario - Distribuidora de Gas El Volcán
**Evaluación Parcial N° 3 - Fullstack II (DSY1104)**  
**Proyecto:** Tienda Online con Microservicios Spring Boot y Frontend React  

---

## 1. Requisitos del Sistema
Para ejecutar la solución completa en tu equipo o en el taller de alto cómputo, necesitas tener instalado:
* **Java Development Kit (JDK):** Versión 17 o superior.
* **Node.js:** Versión 18 o superior con npm.
* **Base de Datos:** MySQL (a través de Laragon, XAMPP o servicio local en el puerto `3306`).
* **Navegador Web:** Google Chrome, Edge o Firefox.

---

## 2. Cuentas de Prueba Precargadas

Los microservicios cuentan con un componente de inicialización automática (`DataLoader.java`) que carga los usuarios de prueba con contraseñas cifradas en **BCrypt** la primera vez que se ejecutan:

| Rol del Usuario | Correo Electrónico (Username) | Contraseña | Permisos y Vistas Habilitadas |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@gaselvolcan.cl` | `admin123` | Acceso total, CRUD completo de productos y gestión de todos los pedidos. |
| **Operadora** | `operadora@gaselvolcan.cl` | `opera123` | Visualización de catálogo y gestión/despacho de todos los pedidos de Chillán. |
| **Repartidor** | `repartidor@gaselvolcan.cl` | `repa123` | Actualización de pedidos en ruta y confirmación de entregas con descuento de stock. |
| **Cliente** | `cliente@gmail.com` | `cliente123` | Compra de cilindros, carrito de compras y consulta de sus pedidos personales. |

> **Tip:** En la pantalla de **Ingreso / Registro** de la web, encontrarás botones de acceso rápido que completan automáticamente los campos de correo y contraseña al hacer un solo clic.

---

## 3. Instrucciones de Ejecución Paso a Paso

### Paso 1: Iniciar el servidor MySQL (Laragon / XAMPP)
Asegúrate de que el servicio MySQL esté corriendo en el puerto por defecto `3306` con usuario `root` y sin contraseña. Las tres bases de datos se crearán automáticamente:
* `gas_usuarios_db`
* `gas_productos_db`
* `gas_pedidos_db`

### Paso 2: Iniciar los Microservicios Backend
Abre 3 terminales separadas para levantar cada microservicio en su puerto correspondiente:

**Terminal 1 - Microservicio Usuarios (Puerto 8081):**
```bash
cd backend_microservicios/microservicio-usuarios
./mvnw spring-boot:run
```
*(En Windows también puedes usar `mvnw.cmd spring-boot:run`)*.

**Terminal 2 - Microservicio Productos (Puerto 8082):**
```bash
cd backend_microservicios/microservicio-productos
./mvnw spring-boot:run
```

**Terminal 3 - Microservicio Pedidos (Puerto 8083):**
```bash
cd backend_microservicios/microservicio-pedidos
./mvnw spring-boot:run
```

### Paso 3: Iniciar el Frontend (React + Vite)
En una cuarta terminal, ejecuta:
```bash
cd gas-react
npm install
npm run dev
```
La aplicación web se abrirá en tu navegador en: **`http://localhost:5173`**.

---

## 4. Guía de Uso de la Aplicación Web

### 4.1 Navegación y Catálogo de Cilindros
* En la pestaña **Inicio** encontrarás la presentación de Gas El Volcán y accesos directos.
* En la pestaña **Cilindros de Gas**, el sistema consulta el microservicio del puerto `8082` para mostrar los formatos disponibles (5kg, 11kg, 15kg, 45kg) con su precio, stock en unidades y botón para **"Agregar al Pedido"**.

### 4.2 Carrito y Solicitud de Pedido de Gas
1. Agrega uno o más cilindros desde el catálogo.
2. Ingresa a la sección **Mis Pedidos** (ícono del carrito).
3. Si no has iniciado sesión, el sistema te solicitará amablemente que ingreses tus credenciales para poder confirmar el despacho.
4. Completa la dirección en Chillán, selecciona tu sector de reparto (Zona Centro, Oriente, Rural, etc.) y presiona **"Confirmar Pedido"**.
5. Recibirás un mensaje de éxito con el número de orden generado en el microservicio de pedidos (`#1001`, `#1002`, etc.).

### 4.3 Consulta de Historial de Compras (Cliente)
Dentro de la misma sección **Mis Pedidos**, haz clic en el botón superior **"Mis Pedidos Realizados"**. Aquí podrás ver la tabla con tus pedidos anteriores y el estado de entrega en tiempo real (`PENDIENTE`, `EN_CAMINO`, `ENTREGADO`).

### 4.4 Panel de Operaciones y Control (Admin y Operadora)
1. Inicia sesión con la cuenta de Administrador (`admin@gaselvolcan.cl`) u Operadora (`operadora@gaselvolcan.cl`).
2. En la barra de navegación superior aparecerá el enlace **"Panel Gestión"** con un ícono de escudo.
3. **Pestaña Pedidos Recibidos:** Permite ver todos los pedidos del día en Chillán y cambiar su estado con un solo clic:
   * Presiona **"Despachar"** para pasarlo a `EN_CAMINO`.
   * Presiona **"Entregar"** para pasarlo a `ENTREGADO`. Al marcarlo como entregado, el microservicio de pedidos llama automáticamente al microservicio de productos para descontar el stock físico del cilindro y registrar el pago.
4. **Pestaña Catálogo y Stock (Solo Admin):**
   * **Formulario Crear Producto:** Permite agregar un nuevo cilindro o accesorio completando nombre, precio y stock.
   * **Acciones CRUD:** Permite editar el stock en tiempo real o desactivar productos obsoletos del catálogo.

### 4.5 Demostración de Restricción de Acceso (Seguridad por Roles)
* Si intentas ingresar al Panel de Gestión estando desconectado o con una cuenta de **Cliente**, el sistema bloqueará la pantalla y mostrará el aviso:  
  **`⛔ Acceso Restringido: Esta vista requiere permisos de Administrador u Operadora. Tu rol actual es: ROLE_CLIENTE`**.

---

## 5. Pruebas Interactivas en Swagger UI (API Docs)

Para evidenciar ante el docente que la API REST cumple con el estándar OpenAPI:
* **Microservicio Usuarios (8081):** Ingresa a `http://localhost:8081/swagger-ui.html` para probar login y registro.
* **Microservicio Productos (8082):** Ingresa a `http://localhost:8082/swagger-ui.html` para probar las operaciones CRUD de cilindros.
* **Microservicio Pedidos (8083):** Ingresa a `http://localhost:8083/swagger-ui.html` para probar la creación y cambio de estados de pedidos.
