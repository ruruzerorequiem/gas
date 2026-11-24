# Documento de Integración Técnica de Arquitectura y Microservicios
**Asignatura:** Desarrollo Fullstack II (DSY1104)  
**Institución:** Duoc UC - Escuela de Informática y Telecomunicaciones  
**Proyecto:** Sistema de Distribución y Comercio Electrónico "Gas El Volcán" (Chillán)  
**Servidor de Producción AWS EC2:** `http://98.91.220.69/`  
**Base de Datos del Servidor:** MySQL 8 Community Server  
**Proxy Inverso y Web Server:** Nginx 1.24  
**Lenguajes y Frameworks:** Java 21 (OpenJDK 64-Bit), Spring Boot 3 & 4, React 19, Vite, Bootstrap 5  

---

## 📑 Índice de Contenidos
1. [Resumen Ejecutivo y Contexto del Proyecto](#1-resumen-ejecutivo-y-contexto-del-proyecto)
2. [Arquitectura General del Sistema y Topología de Red](#2-arquitectura-general-del-sistema-y-topología-de-red)
3. [Detalle de los Tres Microservicios Backend](#3-detalle-de-los-tres-microservicios-backend)
   - 3.1 Microservicio Usuarios (Puerto 8081)
   - 3.2 Microservicio Productos (Puerto 8082)
   - 3.3 Microservicio Pedidos (Puerto 8083)
4. [Bases de Datos Relacionales (Database-per-Service en MySQL)](#4-bases-de-datos-relacionales-database-per-service-en-mysql)
5. [Seguridad, Cifrado BCrypt y Flujo del Token JWT](#5-seguridad-cifrado-bcrypt-y-flujo-del-token-jwt)
6. [Catálogo Completo de Endpoints REST y Documentación OpenAPI / Swagger](#6-catálogo-completo-de-endpoints-rest-y-documentación-openapi--swagger)
7. [Integración Frontend (React 19) con el Backend](#7-integración-frontend-react-19-con-el-backend)
8. [Módulo de Pasarela de Pago Banco Estado (Webpay / BE Pass)](#8-módulo-de-pasarela-de-pago-banco-estado-webpay--be-pass)
9. [Guía de Acceso al Servidor EC2 desde PowerShell y Comandos de Administración](#9-guía-de-acceso-al-servidor-ec2-desde-powershell-y-comandos-de-administración)
10. [Guía Paso a Paso para Inspeccionar MySQL en la Consola Real](#10-guía-paso-a-paso-para-inspeccionar-mysql-en-la-consola-real)
11. [Preguntas Clave del Profesor y Cómo Defender la Evaluación](#11-preguntas-clave-del-profesor-y-cómo-defender-la-evaluación)

---

## 1. Resumen Ejecutivo y Contexto del Proyecto

"Gas El Volcán" es una distribuidora de gas licuado de petróleo (GLP) ubicada en Chillán, Región de Ñuble. Para responder a los requerimientos de la **Evaluación Parcial N° 3**, se llevó a cabo una migración completa desde una solución monolítica acoplada hacia un ecosistema moderno basado en **microservicios distribuidos**.

### Objetivos Clave Cumplidos:
- **Desacoplamiento Estricto:** Tres microservicios independientes que se compilan, ejecutan y escalan de manera autónoma, cada uno con su propio esquema de base de datos en MySQL.
- **Autenticación sin Estado (Stateless) con JWT:** Implementación de tokens firmados digitalmente para evitar sesiones en memoria en el servidor, garantizando seguridad robusta según roles.
- **Transaccionalidad Logística:** Flujo completo de compra, descuento automático de inventario físico al entregar pedidos y confirmación de pagos electrónicos.
- **Despliegue Cloud en Producción:** Infraestructura completa aprovisionada en Amazon Web Services (AWS EC2) bajo Ubuntu 24.04 LTS, servida mediante Nginx como proxy inverso.

---

## 2. Arquitectura General del Sistema y Topología de Red

La solución sigue el patrón arquitectónico de **Reverse Proxy / API Gateway Unificado**:

```
                              INTERNET / CLIENTES
                                      │
                         HTTP Request (Puerto 80)
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │            SERVIDOR AWS EC2 (Ubuntu 24)          │
             │                   98.91.220.69                   │
             │                                                  │
             │   ┌──────────────────────────────────────────┐   │
             │   │             NGINX (Puerto 80)            │   │
             │   │  - Servidor de archivos estáticos React  │   │
             │   │  - Proxy Inverso hacia Microservicios    │   │
             │   └──────┬─────────────┬─────────────┬───────┘   │
             │          │             │             │           │
             │    /api/auth &    /api/productos/   /api/pedidos/│
             │   /api/usuarios/       │             │           │
             │          │             │             │           │
             │          ▼             ▼             ▼           │
             │     ┌─────────┐   ┌─────────┐   ┌─────────┐      │
             │     │ USUARIOS│   │PRODUCTOS│   │ PEDIDOS │      │
             │     │  (8081) │   │  (8082) │   │  (8083) │      │
             │     └────┬────┘   └────┬────┘   └────┬────┘      │
             │          │             │             │           │
             │          │      Spring Cloud /       │           │
             │          │      RestTemplate         │           │
             │          │             ▲             │           │
             │          │             └─────────────┘           │
             │          │   (Descuento de stock en entrega)     │
             │          │                                       │
             │          ▼             ▼             ▼           │
             │   ┌─────────────┬─────────────┬─────────────┐    │
             │   │gas_usuarios │gas_productos│ gas_pedidos │    │
             │   │    _db      │    _db      │    _db      │    │
             │   │ (MySQL:3306)│ (MySQL:3306)│ (MySQL:3306)│    │
             │   └─────────────┴─────────────┴─────────────┘    │
             └──────────────────────────────────────────────────┘
```

### Por qué esta arquitectura es superior para la evaluación:
1. **Evita Bloqueos de CORS y Mixed Content:** Nginx atiende el puerto 80 tanto para la aplicación web de React como para las peticiones `/api/*`. De esta forma, el navegador interpreta que todo viaja al mismo origen (`origin: http://52.55.228.10`), eliminando cualquier conflicto de seguridad en el browser.
2. **Aislamiento de Fallos:** Si el microservicio de productos se reinicia, el microservicio de usuarios sigue autenticando sin interrupciones.
3. **Escalabilidad Horizontal:** Cada microservicio puede trasladarse a un contenedor Docker o servidor independiente sin modificar el código fuente del frontend.

---

## 3. Detalle de los Tres Microservicios Backend

### 3.1 Microservicio Usuarios (Puerto 8081)
- **Directorio Local:** `backend_microservicios/microservicio-usuarios`
- **Responsabilidad:** Registro de usuarios, login, generación y validación de tokens JWT, administración del ciclo de vida de las cuentas y control de accesos.
- **Entidad JPA Principal (`Usuario.java`):**
  - `id` (Long, Clave Primaria Autoincremental)
  - `username` (String, Correo o identificador único del usuario)
  - `password` (String, Hash seguro generado con BCrypt)
  - `nombreCompleto` (String, Nombre y dos apellidos del titular)
  - `rol` (String: `ROLE_ADMIN`, `ROLE_OPERADORA`, `ROLE_REPARTIDOR`, `ROLE_CLIENTE`)
  - `activo` (Boolean, Permite deshabilitar el acceso sin perder historial)
- **Inicialización de Datos (`DataLoader.java`):** Carga automática al arrancar las 4 cuentas del sistema si la tabla se encuentra vacía.

### 3.2 Microservicio Productos (Puerto 8082)
- **Directorio Local:** `backend_microservicios/microservicio-productos`
- **Responsabilidad:** Catálogo comercial de cilindros de gas licuado (GLP) y accesorios técnicos en Chillán, gestión de precios, disponibilidad de imágenes y control de stock físico.
- **Entidad JPA Principal (`Producto.java`):**
  - `id` (Long, Clave Primaria)
  - `nombre` (String, ej. "Cilindro GLP 11 kg")
  - `descripcion` (String, Características técnicas y recomendaciones de uso)
  - `pesoKg` (Double, Peso neto del gas licuado)
  - `precio` (Double, Valor unitario en pesos chilenos CLP)
  - `stockActual` (Integer, Unidades disponibles en bodega)
  - `imagenUrl` (String, Ruta relativa o URL pública de la fotografía)
  - `activo` (Boolean, Estado en el catálogo web)
- **Endpoint Transaccional Atómico (`/api/productos/{id}/descontar?cantidad=N`):**
  - Permite descontar de forma segura unidades de stock cuando un pedido es entregado a domicilio por el repartidor.
  - Valida que exista inventario suficiente antes de aplicar la resta en la base de datos.

### 3.3 Microservicio Pedidos (Puerto 8083)
- **Directorio Local:** `backend_microservicios/microservicio-pedidos`
- **Responsabilidad:** Creación de órdenes de despacho, asignación de choferes, trazabilidad del estado del envío, persistencia del pago confirmado de Banco Estado y comunicación REST con el microservicio de productos.
- **Entidad JPA Principal (`Pedido.java`):**
  - `id` (Long, Identificador único de orden de compra)
  - `clienteUsername` (String, Email del cliente)
  - `clienteNombre` (String, Nombre para la boleta de despacho)
  - `direccionEntrega` (String, Dirección física en Chillán y sector)
  - `productoId` (Long, Llave foránea lógica del cilindro comprado)
  - `productoNombre` (String, Nombre histórico del cilindro comprado)
  - `precioUnitario` (Double, Precio de venta congelado al momento del pedido)
  - `cantidad` (Integer, Unidades solicitadas)
  - `totalPagar` (Double, Total calculado: `precioUnitario * cantidad`)
  - `estado` (String: `PENDIENTE`, `ASIGNADO`, `EN_CAMINO`, `ENTREGADO`, `CANCELADO`)
  - `repartidorUsername` (String, Chofer asignado al flete)
  - `pagoRegistrado` (Boolean: `true` si pagó vía Banco Estado o contra entrega)
  - `fechaCreacion` (LocalDateTime, Marca temporal exacta de compra)
  - `fechaEntrega` (LocalDateTime, Marca temporal de recepción en domicilio)
- **Comunicación entre Microservicios (Inter-Service REST):**
  - Cuando un pedido cambia su estado a `ENTREGADO`, `PedidoController.java` utiliza `RestTemplate` para realizar una petición `PUT` interna con cabecera Bearer Token hacia:
    `http://localhost:8082/api/productos/{id}/descontar?cantidad=X`
  - De esta forma, el microservicio de pedidos delega la lógica de inventario sin manipular directamente la base de datos de productos.

---

## 4. Bases de Datos Relacionales (Database-per-Service en MySQL)

El sistema implementa el principio de diseño de microservicios **Database-per-Service**, garantizando que ningún microservicio comparta tablas con otro:

```sql
+----------------------+---------------------------------------------------+
| Base de Datos en EC2 | Contenido y Tablas Principales                   |
+----------------------+---------------------------------------------------+
| gas_usuarios_db      | Tabla `usuarios`: Credenciales, roles y estado    |
| gas_productos_db     | Tabla `productos`: Catálogo, precios y stock      |
| gas_pedidos_db       | Tabla `pedidos`: Órdenes, pagos y despachos       |
+----------------------+---------------------------------------------------+
```

### Configuración en `application.properties` (Mapeo JPA/Hibernate):
```properties
# Ejemplo extraído del microservicio de pedidos:
spring.datasource.url=jdbc:mysql://localhost:3306/gas_pedidos_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

---

## 5. Seguridad, Cifrado BCrypt y Flujo del Token JWT

### 5.1 Cifrado de Contraseñas con BCrypt
Las contraseñas nunca se guardan en texto plano en la base de datos. Se utiliza la implementación de Spring Security `BCryptPasswordEncoder` con un factor de trabajo (*work factor*) de costo 10:
- Ejemplo de contraseña ingresada: `admin123`
- Cadena almacenada en la columna `password` de MySQL:  
  `$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1pLgN8jK4wVqE5lU8k5k2u8v...`
- Cuando el usuario intenta loguearse, el sistema utiliza `passwordEncoder.matches(claveIngresada, hashAlmacenado)`, haciendo matemáticamente imposible descifrar la clave original a partir de la base de datos.

### 5.2 Estructura y Flujo del JWT (JSON Web Token)
1. **Petición de Login (`POST /api/auth/login`):**
   El cliente envía `{ "username": "admin@gaselvolcan.cl", "password": "admin123" }`.
2. **Generación del Token (`JwtUtil.java`):**
   Si la contraseña coincide, el servidor genera un token codificado en Base64URL compuesto por 3 partes separadas por puntos (`Header.Payload.Signature`):
   - **Header:** Algoritmo de firma (`HS256`) y tipo (`JWT`).
   - **Payload (Claims):**
     ```json
     {
       "sub": "admin@gaselvolcan.cl",
       "role": "ROLE_ADMIN",
       "iat": 1732454400,
       "exp": 1732490400
     }
     ```
   - **Signature:** Firma criptográfica HMAC con una clave secreta que solo conoce el backend.
3. **Consumo en el Frontend:**
   React almacena el token en `localStorage` con la clave `'gas_token'`.
4. **Validación en Filtro (`JwtFilter.java`):**
   En cada petición subsiguiente, el frontend envía:
   `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   El filtro intercepta la llamada antes de llegar al controlador, verifica la firma, valida que no esté expirado y carga los roles en el `SecurityContext` de Spring.

---

## 6. Catálogo Completo de Endpoints REST y Documentación OpenAPI / Swagger

Todos los servicios incorporan la especificación interactiva **OpenAPI 3 / Swagger UI**.

### Enlaces Directos de Swagger en Producción:
* **Swagger Usuarios:** [http://98.91.220.69:8081/swagger-ui.html](http://98.91.220.69:8081/swagger-ui.html)
* **Swagger Productos:** [http://98.91.220.69:8082/swagger-ui.html](http://98.91.220.69:8082/swagger-ui.html)
* **Swagger Pedidos:** [http://98.91.220.69:8083/swagger-ui.html](http://98.91.220.69:8083/swagger-ui.html)

### Matriz Completa de Endpoints:

#### A. Microservicio Usuarios (Puerto 8081 / Nginx `/api/auth` y `/api/usuarios`)
| Verbo HTTP | Endpoint | Autorización | Descripción | Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público | Autentica credenciales y genera el token | `{ token, username, rol, nombreCompleto }` |
| `POST` | `/api/auth/registro` | Público | Registro de cliente residencial (`ROLE_CLIENTE`) | Objeto `Usuario` creado |
| `GET` | `/api/usuarios` | `ROLE_ADMIN` | Obtiene el listado completo de funcionarios y clientes | Lista `[Usuario]` |
| `POST` | `/api/usuarios` | `ROLE_ADMIN` | Crea un usuario asignando cualquier rol | Objeto `Usuario` creado |
| `PUT` | `/api/usuarios/{id}` | `ROLE_ADMIN` | Edita nombre, rol, estado activo o clave | Objeto `Usuario` actualizado |
| `DELETE`| `/api/usuarios/{id}?permanente=true` | `ROLE_ADMIN` | Eliminación definitiva física del registro en MySQL | `{ "mensaje": "Usuario eliminado definitivamente" }` |

#### B. Microservicio Productos (Puerto 8082 / Nginx `/api/productos`)
| Verbo HTTP | Endpoint | Autorización | Descripción | Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/productos` | Público | Catálogo comercial de productos en stock | Lista `[Producto]` activos |
| `GET` | `/api/productos/{id}`| Público | Ficha técnica de un producto por ID | Objeto `Producto` |
| `POST` | `/api/productos` | `ROLE_ADMIN` | Alta de nuevo cilindro (nombre, precio, stock, img) | Objeto `Producto` creado |
| `PUT` | `/api/productos/{id}`| `ROLE_ADMIN` | Edición completa de datos, precio y stock | Objeto `Producto` actualizado |
| `PUT` | `/api/productos/{id}/descontar?cantidad=N` | `ROLE_ADMIN`, `ROLE_OPERADORA`, `ROLE_REPARTIDOR` | Resta inventario al entregar pedido | Mensaje de éxito o error por falta de stock |
| `DELETE`| `/api/productos/{id}?permanente=true`| `ROLE_ADMIN` | Eliminación definitiva física del cilindro en MySQL | `{ "mensaje": "Producto eliminado definitivamente" }` |

#### C. Microservicio Pedidos (Puerto 8083 / Nginx `/api/pedidos`)
| Verbo HTTP | Endpoint | Autorización | Descripción | Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/pedidos` | `ROLE_CLIENTE`, Admin | Genera pedido a domicilio con opción de pago | Objeto `Pedido` generado con ID |
| `GET` | `/api/pedidos` | `ROLE_ADMIN`, `ROLE_OPERADORA` | Consulta todos los pedidos recibidos en Chillán | Lista `[Pedido]` |
| `GET` | `/api/pedidos/mis-pedidos` | Autenticado | Historial de pedidos exclusivo del usuario en sesión | Lista `[Pedido]` del usuario |
| `PUT` | `/api/pedidos/{id}` | `ROLE_ADMIN`, `ROLE_OPERADORA` | Edita dirección, cantidad, repartidor o estado | Objeto `Pedido` actualizado |
| `PUT` | `/api/pedidos/{id}/estado` | Operadora / Repartidor | Cambia estado a `EN_CAMINO` o `ENTREGADO` | Objeto `Pedido` actualizado |
| `DELETE`| `/api/pedidos/{id}?permanente=true`| `ROLE_ADMIN`, `ROLE_OPERADORA` | Eliminación física definitiva de la orden en MySQL | `{ "mensaje": "Pedido eliminado definitivamente" }` |

---

## 7. Integración Frontend (React 19) con el Backend

El archivo clave que coordina la comunicación es `gas-react/src/api.js`:
- **Detección Automática de IP y Proxy:**
  ```javascript
  const IP_EC2 = '98.91.220.69';
  const esMismaIp = typeof window !== 'undefined' && window.location.hostname === IP_EC2;
  const BASE_URL = esMismaIp ? '' : `http://${IP_EC2}`;
  ```
- **Inyección Centralizada del Token JWT:**
  Cada petición protegida incluye automáticamente el Bearer Token obtenido desde `localStorage`:
  ```javascript
  const authHeaders = () => {
    const token = localStorage.getItem('gas_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };
  ```
- **Gestión de Modales Nativos en React:** En lugar de usar `alert()` o `confirm()` nativos de Javascript que bloquean el hilo principal y muestran la URL del navegador, se crearon modales oscuros basados en React State (`showModal`, `backdrop`) con paleta `#171d28` y alto contraste visual.

---

## 8. Módulo de Pasarela de Pago Banco Estado (Webpay / BE Pass)

### 8.1 ¿Cómo funciona la simulación?
1. **Flujo de Experiencia de Usuario:**
   - En el carrito de compras (`Carrito.jsx`), el usuario ingresa sus datos y selecciona el método de pago **"Banco Estado (Transferencia / BE Pass)"**.
   - Se abre un modal institucional diseñado bajo la identidad corporativa de Banco Estado (fondo azul bancario `#003764`, acentos naranja `#FF8200` y sellos de seguridad SSL).
   - **Paso 1:** Valida el RUT del titular (ej. `18.492.114-K`) y solicita la clave de internet de 4 dígitos.
   - **Paso 2:** Despliega el desafío de segundo factor **BE Pass** (clave de 6 dígitos que emite la aplicación móvil de Banco Estado, sugerida en pantalla: `123456`).
2. **Impacto en Base de Datos y Backend:**
   - Al pulsar **"Autorizar Pago"**, el frontend despacha el pedido al backend enviando el atributo `pagoRegistrado: true`.
   - El microservicio de pedidos (`PedidoController.java`) recibe el flag y persiste el registro en la base de datos `gas_pedidos_db` con `pago_registrado = 1` y estado `PENDIENTE` para despacho.
   - En el Dashboard de la Operadora, el pedido figura inmediatamente con el distintivo verde:  
     `Pagado (Banco Estado)` en lugar de `Pendiente de Cobro`.

---

## 9. Guía de Acceso al Servidor EC2 desde PowerShell y Comandos de Administración

Para que cualquiera de los integrantes del grupo pueda ingresar al servidor en vivo desde Windows:

1. Abrir **PowerShell** en tu computador.
2. Navegar a la carpeta donde está tu clave `.pem` (o especificar la ruta completa):
   ```powershell
   ssh -i "C:\Users\rodri\Downloads\gas-produccion.pem" ubuntu@98.91.220.69
   ```
3. **Comandos Útiles en la Instancia Ubuntu:**
   - **Ver puertos y servicios activos:**
     ```bash
     ss -tulpn | grep -E '8081|8082|8083|3306|80'
     ```
   - **Reiniciar o iniciar los 3 microservicios en segundo plano:**
     ```bash
     ~/iniciar.sh
     ```
   - **Ver logs en tiempo real:**
     ```bash
     tail -f ~/pedidos.log
     tail -f ~/productos.log
     tail -f ~/usuarios.log
     ```
   - **Verificar el estado del servidor Nginx:**
     ```bash
     sudo systemctl status nginx
     ```

---

## 10. Guía Paso a Paso para Inspeccionar MySQL en la Consola Real

Para demostrarle al profesor en plena evaluación que los datos están grabados en MySQL:

1. Conectarse a la máquina por SSH (paso 9).
2. Entrar a la consola administrativa de MySQL:
   ```bash
   sudo mysql -u root
   ```
3. Listar las bases de datos:
   ```sql
   SHOW DATABASES;
   ```
4. **Verificar Usuarios y Contraseñas Cifradas:**
   ```sql
   USE gas_usuarios_db;
   SHOW TABLES;
   SELECT id, username, rol, activo, password FROM usuarios;
   ```
5. **Verificar Productos y Stock Físico:**
   ```sql
   USE gas_productos_db;
   SELECT id, nombre, precio, stock_actual, activo FROM productos;
   ```
6. **Verificar Pedidos y Pagos Registrados con Banco Estado:**
   ```sql
   USE gas_pedidos_db;
   SELECT id, cliente_nombre, producto_nombre, total_pagar, estado, pago_registrado, fecha_creacion FROM pedidos ORDER BY id DESC LIMIT 5;
   ```
7. Para salir de MySQL:
   ```sql
   exit;
   ```

---

## 11. Preguntas Clave del Profesor y Cómo Defender la Evaluación

### P1: *"¿Por qué implementaron tres microservicios en lugar de un monolito?"*
- **Respuesta:** *"Profesor, se aplicó el principio de responsabilidad única y desacoplamiento de dominios. El microservicio de usuarios maneja la seguridad y JWT; el de productos gestiona el catálogo y el stock; y el de pedidos procesa la logística de compra y pagos. Cada uno tiene su propio ciclo de vida y su propia base de datos (Database-per-Service). Si la base de pedidos se sobrecarga, el catálogo de productos y el login de usuarios continúan operando con normalidad."*

### P2: *"¿Cómo se comunican los microservicios entre sí si están separados?"*
- **Respuesta:** *"Se comunican a través de llamadas HTTP REST utilizando `RestTemplate` con inyección de cabeceras de autorización Bearer Token. Por ejemplo, cuando una operadora o repartidor marca un pedido como `ENTREGADO` en el microservicio 8083, este invoca automáticamente al endpoint `/api/productos/{id}/descontar` del microservicio 8082 para rebajar el stock en inventario de forma síncrona y atómica."*

### P3: *"¿Dónde se almacenan las contraseñas y cómo están protegidas?"*
- **Respuesta:** *"Están almacenadas en la tabla `usuarios` de la base de datos `gas_usuarios_db` en MySQL. No existe ninguna contraseña en texto claro. Se utiliza el algoritmo `BCryptPasswordEncoder` de Spring Security con una sal (salt) generada aleatoriamente por cada usuario. Ni siquiera el administrador con acceso root a MySQL puede conocer la clave del cliente."*

### P4: *"¿Cómo opera la simulación del pago de Banco Estado?"*
- **Respuesta:** *"La interfaz simula de forma exacta el Botón de Pago Banco Estado WebPay con flujo en dos etapas: primero valida el RUT y la clave bancaria de 4 dígitos, y luego exige el segundo factor de autenticación digital BE Pass de 6 dígitos. Una vez validado en el frontend, se envía `pagoRegistrado: true` en el payload JSON hacia el microservicio de pedidos, quedando asentado en la columna `pago_registrado` de MySQL con valor 1. El pedido pasa directo a despacho como saldado."*
