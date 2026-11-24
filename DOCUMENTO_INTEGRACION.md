# Documento de Integración - Evaluación Parcial N° 3
**Asignatura:** Desarrollo Fullstack II (DSY1104)  
**Institución:** Duoc UC  
**Proyecto:** Distribuidora de Gas El Volcán (Chillán)  
**Arquitectura:** Microservicios Spring Boot + Frontend React (Vite)  

---

## 1. Descripción General del Proyecto y Arquitectura

El presente proyecto implementa una solución fullstack para la empresa distribuidora de gas licuado **"Gas El Volcán"**, ubicada en Chillán. La arquitectura se compone de:
1. **Frontend:** Aplicación web interactiva desarrollada en **React 19 con Vite** y **Bootstrap 5**, que ofrece catálogo en tiempo real, carrito de compras, gestión de pedidos y un panel administrativo con control de acceso basado en roles.
2. **Backend (Microservicios REST):** Tres microservicios independientes construidos con **Java 21**, **Spring Boot 3 / 4**, **Spring Data JPA** y **Spring Security**:
   - **Microservicio Usuarios (Puerto 8081):** Autenticación mediante **JWT**, gestión de usuarios y autorización de roles (`ROLE_ADMIN`, `ROLE_OPERADORA`, `ROLE_REPARTIDOR`, `ROLE_CLIENTE`).
   - **Microservicio Productos (Puerto 8082):** Catálogo de cilindros de gas (5kg, 11kg, 15kg, 45kg) y accesorios, con operaciones **CRUD** completas y control de inventario/stock.
   - **Microservicio Pedidos (Puerto 8083):** Registro y trazabilidad de solicitudes de despacho a domicilio en Chillán, estados en vivo (`PENDIENTE`, `ASIGNADO`, `EN_CAMINO`, `ENTREGADO`, `CANCELADO`) y descuento automático de stock.

---

## 2. Modelo de Datos y Conexión a Base de Datos (IE3.1.1 / IE3.1.2)

### 2.1 Conexión a Base de Datos
Cada microservicio cuenta con su propia base de datos relacional independiente mediante **Spring Data JPA / Hibernate**, configurada en `application.properties`:
* `gas_usuarios_db`: Almacena credenciales seguras cifradas con **BCrypt** y asignación de roles.
* `gas_productos_db`: Almacena el inventario, precios y detalles de cilindros.
* `gas_pedidos_db`: Almacena los pedidos, direcciones de entrega en Chillán, montos y estados de despacho.

Las tablas se generan automáticamente mediante `spring.jpa.hibernate.ddl-auto=update`.

### 2.2 Modelos Principales (Entidades JPA)
* **`Usuario`:** `id`, `username` (email), `password` (hash BCrypt), `nombreCompleto`, `rol`, `activo`.
* **`Producto`:** `id`, `nombre`, `descripcion`, `pesoKg`, `precio`, `stockActual`, `imagenUrl`, `activo`.
* **`Pedido`:** `id`, `clienteUsername`, `clienteNombre`, `direccionEntrega`, `productoId`, `productoNombre`, `precioUnitario`, `cantidad`, `totalPagar`, `estado`, `repartidorUsername`, `pagoRegistrado`, `fechaCreacion`.

---

## 3. Servicios API REST y Documentación Swagger (IE3.2.1 / IE3.2.3)

Todos los servicios exponen una interfaz REST documentada de manera interactiva con **OpenAPI / Swagger UI** mediante la dependencia `springdoc-openapi-starter-webmvc-ui`.

### 3.1 Endpoints Implementados

| Microservicio | Método | Ruta | Descripción | Rol Requerido |
| :--- | :--- | :--- | :--- | :--- |
| **Usuarios (8081)** | `POST` | `/api/auth/login` | Inicio de sesión, retorna Token JWT | Público |
| **Usuarios (8081)** | `POST` | `/api/auth/registro` | Registro de nuevos clientes | Público |
| **Usuarios (8081)** | `GET` | `/api/usuarios` | Lista todos los usuarios del sistema | `ROLE_ADMIN` |
| **Usuarios (8081)** | `POST` | `/api/usuarios` | Crear usuario con rol específico | `ROLE_ADMIN` |
| **Usuarios (8081)** | `PUT` | `/api/usuarios/{id}` | Actualizar datos de usuario | `ROLE_ADMIN` |
| **Usuarios (8081)** | `DELETE` | `/api/usuarios/{id}` | Desactivar usuario | `ROLE_ADMIN` |
| **Productos (8082)** | `GET` | `/api/productos` | Catálogo público de cilindros activos | Público |
| **Productos (8082)** | `GET` | `/api/productos/{id}` | Detalle de cilindro por ID | Público |
| **Productos (8082)** | `POST` | `/api/productos` | Crear nuevo cilindro/accesorio | `ROLE_ADMIN` |
| **Productos (8082)** | `PUT` | `/api/productos/{id}` | Modificar precio y stock | `ROLE_ADMIN` |
| **Productos (8082)** | `PUT` | `/api/productos/{id}/descontar` | Descontar stock al entregar | `ROLE_ADMIN`, `ROLE_OPERADORA`, `ROLE_REPARTIDOR` |
| **Productos (8082)** | `DELETE` | `/api/productos/{id}` | Desactivar producto del catálogo | `ROLE_ADMIN` |
| **Pedidos (8083)** | `POST` | `/api/pedidos` | Crear pedido de gas | `ROLE_CLIENTE`, `ROLE_OPERADORA`, `ROLE_ADMIN` |
| **Pedidos (8083)** | `GET` | `/api/pedidos` | Ver todos los pedidos del día | `ROLE_ADMIN`, `ROLE_OPERADORA` |
| **Pedidos (8083)** | `GET` | `/api/pedidos/mis-pedidos` | Ver historial propio de compras | `ROLE_CLIENTE`, `ROLE_ADMIN`, `ROLE_OPERADORA` |
| **Pedidos (8083)** | `PUT` | `/api/pedidos/{id}/estado` | Cambiar estado (EN_CAMINO / ENTREGADO) | `ROLE_REPARTIDOR`, `ROLE_OPERADORA`, `ROLE_ADMIN` |
| **Pedidos (8083)** | `DELETE` | `/api/pedidos/{id}` | Cancelar pedido | `ROLE_ADMIN`, `ROLE_OPERADORA` |

### 3.2 Acceso a Swagger UI
* Microservicio Usuarios: `http://localhost:8081/swagger-ui.html`
* Microservicio Productos: `http://localhost:8082/swagger-ui.html`
* Microservicio Pedidos: `http://localhost:8083/swagger-ui.html`

---

## 4. Integración entre Backend y Frontend (IE3.2.2 / IE3.2.4)

La comunicación se gestiona en el archivo `gas-react/src/api.js` mediante la API nativa `fetch` de JavaScript:
1. **Configuración de URLs Centralizada:** Se definen los puertos correspondientes (`8081`, `8082`, `8083`) con variables de entorno Vite (`VITE_API_*`) y valores por defecto para entorno local.
2. **Inyección de Cabecera Bearer:** Cada solicitud a endpoints protegidos incluye automáticamente la cabecera HTTP:
   ```javascript
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
   }
   ```
3. **Flujo de Datos:**
   * **Carga de Catálogo:** Al entrar a la tienda, el frontend solicita `GET /api/productos` al microservicio 8082 para renderizar tarjetas con stock y precios en tiempo real.
   * **Compra:** Al presionar "Confirmar Pedido", se envía un `POST /api/pedidos` al microservicio 8083 con el token del cliente.
   * **Trazabilidad:** El cliente puede consultar la pestaña "Mis Pedidos Realizados" (`GET /api/pedidos/mis-pedidos`) para ver el estado de su entrega.

---

## 5. Autenticación con Roles y JWT en Backend (IE3.3.1 / IE3.3.4)

### 5.1 Generación y Validación de Tokens
1. El usuario envía sus credenciales al endpoint `/api/auth/login`.
2. El servicio valida la contraseña usando `BCryptPasswordEncoder.matches()`.
3. Si es válida, `JwtUtil.java` genera un token firmado con algoritmo **HMAC-SHA256** (`HS256`) y clave secreta compartida, incluyendo en los *claims* el nombre de usuario y su autoridad (`ROLE_...`).
4. En cada petición posterior, el componente `JwtFilter.java` intercepta la solicitud, extrae el token del header `Authorization`, valida su firma y expiración, y establece la autenticación en el `SecurityContextHolder`.

### 5.2 Jerarquía de Roles
* **`ROLE_CLIENTE`:** Puede consultar productos, emitir pedidos y ver su propio historial de pedidos.
* **`ROLE_OPERADORA`:** Puede consultar y gestionar todos los pedidos de Chillán, despachar unidades y actualizar estados.
* **`ROLE_ADMIN`:** Acceso total al sistema, operaciones CRUD sobre catálogo de productos y gestión de usuarios.
* **`ROLE_REPARTIDOR`:** Acceso a pedidos asignados en ruta y confirmación de entregas.

---

## 6. Gestión de Sesiones y Persistencia en Frontend (IE3.3.2 / IE3.3.5)

El sistema de sesión está implementado en `gas-react/src/context/AppContext.jsx`:
1. **Persistencia:** Al iniciar sesión, el token JWT y los datos de perfil se guardan en el `localStorage` del navegador bajo las claves `'jwtToken'` y `'usuarioSesion'`.
2. **Resistencia a Recargas:** Al recargar la página (`F5`), un hook `useEffect` inicializa el estado global de React leyendo `localStorage`, manteniendo al usuario conectado sin obligarlo a ingresar sus credenciales nuevamente.
3. **Cierre de Sesión Seguro:** Al presionar "Cerrar Sesión", se eliminan las entradas de `localStorage` y se limpia el contexto, invalidando el acceso inmediato en la interfaz.

---

## 7. Restricciones de Acceso por Roles en Frontend (IE3.3.3 / IE3.3.6)

Para proteger las interfaces sensibles se implementaron restricciones activas en dos niveles:
1. **Nivel de Navegación (`Header.jsx`):** El enlace **"Panel Gestión"** solo se renderiza en la barra de navegación si el usuario en sesión posee el rol `ROLE_ADMIN` o `ROLE_OPERADORA`.
2. **Nivel de Vista (`AdminPanel.jsx`):**
   * Si un usuario no autenticado o con rol `ROLE_CLIENTE` intenta acceder a la ruta de administración, el componente intercepta el renderizado y muestra una pantalla de **"Acceso Restringido (403)"** explicando que la sección requiere permisos de Operaciones o Administración.
   * Si el usuario es `ROLE_OPERADORA`, se le permite gestionar y despachar pedidos, pero las acciones de creación y eliminación de cilindros del catálogo quedan deshabilitadas con un aviso informativo.
   * Solo el `ROLE_ADMIN` tiene habilitado el formulario para agregar cilindros y los botones de edición y eliminación (CRUD).
