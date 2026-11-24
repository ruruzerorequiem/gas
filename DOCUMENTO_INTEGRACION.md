# Documento de Integración Técnica - Evaluación Parcial N° 3
**Asignatura:** Desarrollo Fullstack II (DSY1104)  
**Institución:** Duoc UC  
**Proyecto:** Distribuidora de Gas El Volcán (Chillán)  
**Arquitectura:** Microservicios Spring Boot + Frontend React (Vite) + MySQL 8 + Nginx + AWS EC2  
**URL de Producción Activa:** [http://52.55.228.10/](http://52.55.228.10/)

---

## 1. Descripción General del Proyecto y Arquitectura (IE3.1.1)

El proyecto consiste en una plataforma de comercio electrónico y gestión logística para la empresa distribuidora de gas licuado **"Gas El Volcán"**, ubicada en Chillán. La solución reemplaza un sistema monolítico por una arquitectura desacoplada basada en microservicios independientes:

```
[ Cliente Web / Navegador ]
            │ HTTP (Puerto 80)
            ▼
[ Nginx Reverse Proxy (AWS EC2: 52.55.228.10) ]
   ├── /                ──> Servidor Web Frontend (React 19 / Vite SPA)
   ├── /api/auth/       ──> Microservicio Usuarios  (Spring Boot : 8081)
   ├── /api/usuarios/   ──> Microservicio Usuarios  (Spring Boot : 8081)
   ├── /api/productos/  ──> Microservicio Productos (Spring Boot : 8082)
   └── /api/pedidos/    ──> Microservicio Pedidos   (Spring Boot : 8083)
                                │
                                ├── Base de Datos 1: gas_usuarios_db  (MySQL 8)
                                ├── Base de Datos 2: gas_productos_db (MySQL 8)
                                └── Base de Datos 3: gas_pedidos_db   (MySQL 8)
```

### Componentes de la Arquitectura:
1. **Frontend (React 19 + Vite + Bootstrap 5):**
   - Interfaz moderna de alto contraste y diseño responsivo adaptado para clientes y personal interno.
   - Pasarela de pago simulada con estándar institucional **Banco Estado (Webpay / BE Pass)**.
   - Modales interactivos personalizados para creación, edición completa y eliminación física de productos, usuarios y pedidos.
2. **Backend (3 Microservicios REST en Java 21 / Spring Boot 3 & 4):**
   - **Microservicio Usuarios (Puerto 8081):** Autenticación y autorización basada en **JWT (JSON Web Token)**, contraseñas hasheadas con algoritmo seguro **BCrypt**, y control de roles (`ROLE_ADMIN`, `ROLE_OPERADORA`, `ROLE_REPARTIDOR`, `ROLE_CLIENTE`).
   - **Microservicio Productos (Puerto 8082):** Catálogo de cilindros de GLP (5kg, 11kg, 15kg, 45kg) y accesorios. Soporta operaciones CRUD completas, soporte de imagen URL, y endpoint de descuento atómico de stock.
   - **Microservicio Pedidos (Puerto 8083):** Registro y trazabilidad de despachos en Chillán, estados en vivo (`PENDIENTE`, `ASIGNADO`, `EN_CAMINO`, `ENTREGADO`, `CANCELADO`), persistencia del estado de pago Banco Estado (`pagoRegistrado`), y comunicación interna con el microservicio de productos.
3. **Bases de Datos Independientes (Database-per-Service):**
   - Cada microservicio administra su propio esquema de base de datos en MySQL sin acoplamiento a nivel de tablas.

---

## 2. Acceso a Servidor de Producción y Verificación en Vivo

### 2.1 Conexión SSH a la Instancia EC2 (Windows PowerShell)
Para acceder a la máquina virtual desde cualquier computador con Windows:
```powershell
ssh -i "C:\Users\rodri\Downloads\gas-produccion.pem" ubuntu@52.55.228.10
```

### 2.2 Verificación de Microservicios y Puertos Activos
Una vez dentro del servidor Ubuntu:
```bash
# Ver puertos de red en escucha (Nginx: 80, MySQL: 3306, Microservicios: 8081, 8082, 8083)
ss -tulpn | grep -E '8081|8082|8083|3306|80'

# Revisar los procesos Java activos
ps aux | grep java | grep -v grep

# Si se requiere reiniciar o relanzar los 3 microservicios:
~/iniciar.sh
```

---

## 3. Inspección de la Base de Datos Real (MySQL 8 en EC2)

Para demostrarle al profesor que los datos se persisten en bases de datos relacionales reales y no en memoria:

```bash
# 1. Ingresar a MySQL en la terminal de EC2:
sudo mysql -u root

# 2. Ver las bases de datos de la solución:
SHOW DATABASES;
```

### 3.1 Consultas de Auditoría por Microservicio:

**A. Microservicio Usuarios (`gas_usuarios_db`):**
```sql
USE gas_usuarios_db;
DESCRIBE usuarios;
SELECT id, username, nombre_completo, rol, activo, password FROM usuarios;
```
> *Observación para el profesor:* Se comprueba que las contraseñas están protegidas con hash **BCrypt** (`$2a$10$...`) y que ningún dato sensible se almacena en texto plano.

**B. Microservicio Productos (`gas_productos_db`):**
```sql
USE gas_productos_db;
DESCRIBE productos;
SELECT id, nombre, precio, stock_actual, imagen_url, activo FROM productos;
```

**C. Microservicio Pedidos (`gas_pedidos_db`):**
```sql
USE gas_pedidos_db;
DESCRIBE pedidos;
SELECT id, cliente_nombre, producto_nombre, total_pagar, estado, pago_registrado, fecha_creacion FROM pedidos ORDER BY id DESC;
```
> *Observación para el profesor:* Cada pedido generado desde la web con Banco Estado queda registrado con `pago_registrado = 1`.

---

## 4. Funcionamiento y Explicación del Pago "Banco Estado"

El módulo de pago de Banco Estado fue diseñado para responder preguntas de auditoría técnica del profesor:

1. **Simulación de API Bancaria:**
   - La pasarela imita el flujo oficial de Banco Estado WebPay Transbank.
   - En el Paso 1 se valida el RUT del titular contra la cuenta bancaria de débito (CuentaRUT).
   - En el Paso 2 se simula el desafío de segundo factor de autenticación **BE Pass** (clave de 6 dígitos que emite la aplicación móvil de Banco Estado).
2. **Persistencia en Backend:**
   - Al confirmar el pago en el modal, el frontend realiza un `POST` al endpoint `/api/pedidos` del microservicio 8083 con la propiedad `pagoRegistrado: true`.
   - En `PedidoController.java`:
     ```java
     if (pedido.getPagoRegistrado() == null) {
         pedido.setPagoRegistrado(false);
     }
     ```
   - Al recibir `true`, el pedido se almacena directamente con estado `PENDIENTE` para despacho pero con su pago confirmado y saldado.
3. **Visualización en el Dashboard:**
   - En el panel de la operadora y administrador, los pedidos pagados con Banco Estado muestran una insignia verde `Pagado (Banco Estado)` en lugar de `Pago Pendiente`, garantizando que el chofer no vuelva a cobrar en efectivo al entregar el cilindro.

---

## 5. Endpoints REST y Documentación Interactiva Swagger (OpenAPI)

Cada microservicio genera su documentación OpenAPI 3 de manera automática mediante `springdoc-openapi-starter-webmvc-ui`:

* **Swagger Microservicio Usuarios:** [http://52.55.228.10:8081/swagger-ui.html](http://52.55.228.10:8081/swagger-ui.html)
* **Swagger Microservicio Productos:** [http://52.55.228.10:8082/swagger-ui.html](http://52.55.228.10:8082/swagger-ui.html)
* **Swagger Microservicio Pedidos:** [http://52.55.228.10:8083/swagger-ui.html](http://52.55.228.10:8083/swagger-ui.html)

### Matriz de Endpoints Implementados:

| Microservicio | Método | Ruta | Rol Requerido | Acción |
| :--- | :--- | :--- | :--- | :--- |
| **Usuarios (8081)** | `POST` | `/api/auth/login` | Público | Autentica y genera Token JWT con claims de rol |
| **Usuarios (8081)** | `POST` | `/api/auth/registro` | Público | Registra nuevos clientes residenciales |
| **Usuarios (8081)** | `GET` | `/api/usuarios` | `ROLE_ADMIN` | Obtiene la lista completa de usuarios |
| **Usuarios (8081)** | `POST` | `/api/usuarios` | `ROLE_ADMIN` | Crea usuarios asignando rol específico |
| **Usuarios (8081)** | `PUT` | `/api/usuarios/{id}` | `ROLE_ADMIN` | Modifica nombre, rol, estado y contraseña |
| **Usuarios (8081)** | `DELETE` | `/api/usuarios/{id}?permanente=true` | `ROLE_ADMIN` | Eliminación definitiva del registro en MySQL |
| **Productos (8082)** | `GET` | `/api/productos` | Público | Lista los cilindros y accesorios disponibles |
| **Productos (8082)** | `POST` | `/api/productos` | `ROLE_ADMIN` | Crea nuevo producto con precio, stock e imagen |
| **Productos (8082)** | `PUT` | `/api/productos/{id}` | `ROLE_ADMIN` | Modifica todos los campos del producto |
| **Productos (8082)** | `DELETE` | `/api/productos/{id}?permanente=true` | `ROLE_ADMIN` | Eliminación física definitiva en MySQL |
| **Productos (8082)** | `PUT` | `/api/productos/{id}/descontar` | Operadora / Repa | Descuenta unidades físicas al despachar |
| **Pedidos (8083)** | `POST` | `/api/pedidos` | `ROLE_CLIENTE`, Admin | Genera pedido con soporte de Banco Estado |
| **Pedidos (8083)** | `GET` | `/api/pedidos` | Admin, Operadora | Lista todos los pedidos de Chillán |
| **Pedidos (8083)** | `GET` | `/api/pedidos/mis-pedidos` | `ROLE_CLIENTE` | Historial propio del usuario autenticado |
| **Pedidos (8083)** | `PUT` | `/api/pedidos/{id}` | Admin, Operadora | Actualiza cliente, dirección, cantidad y estado |
| **Pedidos (8083)** | `PUT` | `/api/pedidos/{id}/estado` | Operadora, Repa | Cambia estado a `EN_CAMINO` o `ENTREGADO` |
| **Pedidos (8083)** | `DELETE` | `/api/pedidos/{id}?permanente=true` | Admin, Operadora | Eliminación definitiva del pedido de la BD |

---

## 6. Seguridad JWT y Control de Acceso Basado en Roles (RBAC)

1. **Generación del Token:**
   Al autenticarse exitosamente en `/api/auth/login`, `JwtUtil.java` construye un token firmado con **HMAC-SHA256**:
   ```json
   {
     "sub": "admin@gaselvolcan.cl",
     "role": "ROLE_ADMIN",
     "iat": 1732454400,
     "exp": 1732490400
   }
   ```
2. **Validación en Filtro (`JwtFilter.java`):**
   Cada microservicio valida la firma del token en cada solicitud HTTP protegida a través del header `Authorization: Bearer <TOKEN>`.
3. **CORS Unificado:**
   En cada configuración de seguridad (`SecurityConfig.java`), los métodos HTTP (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) están autorizados con `allowedOriginPatterns("*")` permitiendo integración directa tanto en la IP del servidor EC2 como en entornos de prueba locales.
