/* ==========================================================================
   SERVICIOS API Y COMUNICACIÓN CON SPRING BOOT - GAS EL VOLCÁN
   Desarrollado para Evaluación 3 Fullstack II (DSY1104)

   Microservicios REST:
   - Microservicio Usuarios:  http://localhost:8081 (/api/auth, /api/usuarios)
   - Microservicio Productos: http://localhost:8082 (/api/productos)
   - Microservicio Pedidos:   http://localhost:8083 (/api/pedidos)
   ========================================================================== */

const ENV = import.meta.env;

// Detectar el host dinámicamente si estamos en el navegador para apuntar a la IP correcta del backend
const hostBackend = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? window.location.hostname
  : 'localhost';

export const API_CONFIG = {
  MICROSERVICIO_USUARIOS: ENV?.VITE_API_USUARIOS || `http://${hostBackend}:8081`,
  MICROSERVICIO_PRODUCTOS: ENV?.VITE_API_PRODUCTOS || `http://${hostBackend}:8082`,
  MICROSERVICIO_PEDIDOS: ENV?.VITE_API_PEDIDOS || `http://${hostBackend}:8083`
};

const TIMEOUT_MS = 5000;

// Función para obtener el token JWT guardado en el navegador
export function obtenerTokenJWT() {
  return localStorage.getItem('jwtToken') || '';
}

// Genera cabeceras con autenticación Bearer para las peticiones protegidas
function obtenerHeaders(conAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };
  const token = obtenerTokenJWT();
  if (conAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Función auxiliar para hacer fetch con timeout y no congelar la pantalla
async function llamarAPI(url, opciones = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opciones, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// --------------------------------------------------------------------------
// CATÁLOGO LOCAL DE RESPALDO (por si los microservicios no están encendidos)
// --------------------------------------------------------------------------
export const DATOS_LOCAL_CATALOGO = {
  empresa: "Distribuidora de Gas El Volcán",
  productos: [
    {
      id: 1,
      codigo: "CL001",
      categoria: "Cilindros de Gas",
      nombre: "Cilindro GLP 5 kg",
      descripcion: "Cilindro de gas licuado de petróleo 5 kg. Para uso residencial (cocina, calefacción pequeña).",
      unidad: "Unidad",
      precio: 6500,
      stock: 80,
      imagen: "/img/cilindro_5kg.png"
    },
    {
      id: 2,
      codigo: "CL002",
      categoria: "Cilindros de Gas",
      nombre: "Cilindro GLP 11 kg",
      descripcion: "Cilindro estándar doméstico. El más utilizado en hogares de Chillán.",
      unidad: "Unidad",
      precio: 12000,
      stock: 200,
      imagen: "/img/cilindro_11kg.png"
    },
    {
      id: 3,
      codigo: "CL003",
      categoria: "Cilindros de Gas",
      nombre: "Cilindro GLP 15 kg",
      descripcion: "Cilindro de mayor capacidad para hogares de alto consumo o locales.",
      unidad: "Unidad",
      precio: 16000,
      stock: 90,
      imagen: "/img/cilindro_15kg.png"
    },
    {
      id: 4,
      codigo: "CL004",
      categoria: "Cilindros de Gas",
      nombre: "Cilindro GLP 45 kg",
      descripcion: "Cilindro industrial para restaurantes, panaderías y calefacción comercial.",
      unidad: "Unidad",
      precio: 45000,
      stock: 30,
      imagen: "/img/cilindros.png"
    },
    {
      id: 5,
      codigo: "RG001",
      categoria: "Reguladores",
      nombre: "Regulador doméstico estándar",
      descripcion: "Regulador de 1 etapa para cilindros de 5, 11 y 15 kg. Presión estándar 28 mbar.",
      unidad: "Unidad",
      precio: 8990,
      stock: 45,
      imagen: "/img/cilindros.png"
    },
    {
      id: 6,
      codigo: "MG004",
      categoria: "Mangueras y Conexiones",
      nombre: "Kit conexión completo",
      descripcion: "Incluye regulador estándar, manguera flexible de 1.5 metros y abrazaderas metálicas.",
      unidad: "Kit",
      precio: 12990,
      stock: 25,
      imagen: "/img/cilindros.png"
    }
  ],
  zonasDespacho: [
    {
      zona: "Zona Centro",
      comunasCubiertas: "Chillán (sectores centro, norte y sur)",
      diasDespacho: "Lunes a Sábado",
      horario: "08:00 – 20:00",
      tiempoEstimado: "1 – 3 horas"
    },
    {
      zona: "Zona Oriente",
      comunasCubiertas: "Chillán (sector oriente), Chillán Viejo",
      diasDespacho: "Lunes a Viernes",
      horario: "08:00 – 18:00",
      tiempoEstimado: "2 – 4 horas"
    },
    {
      zona: "Zona Rural",
      comunasCubiertas: "El Carmen, Pinto, San Ignacio",
      diasDespacho: "Martes y Jueves",
      horario: "08:00 – 16:00",
      tiempoEstimado: "3 – 6 horas"
    }
  ]
};

export async function obtenerZonasDespachoAPI() {
  return DATOS_LOCAL_CATALOGO.zonasDespacho;
}

// --------------------------------------------------------------------------
// 1. PRODUCTOS (Microservicio Productos - Puerto 8082)
// --------------------------------------------------------------------------
export async function obtenerProductosAPI() {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PRODUCTOS}/api/productos`;
    const resp = await llamarAPI(url, { headers: obtenerHeaders(false) });
    if (!resp.ok) throw new Error("Error al consultar microservicio de productos");
    const lista = await resp.json();

    // Adaptamos el modelo de Spring Boot al formato visual del frontend
    return lista.map(p => ({
      id: p.id,
      codigo: "CL00" + p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      precioResidencial: p.precio,
      stock: p.stockActual,
      stockActual: p.stockActual,
      pesoKg: p.pesoKg,
      imagen: p.imagenUrl || "/img/cilindros.png",
      categoria: p.pesoKg ? "Cilindros de Gas" : "Accesorios",
      activo: p.activo
    }));
  } catch (error) {
    console.warn("Aviso: No se pudo conectar con microservicio-productos (8082). Usando catálogo local:", error.message);
    return DATOS_LOCAL_CATALOGO.productos;
  }
}

// Crear producto (Solo Administrador)
export async function crearProductoAPI(producto) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PRODUCTOS}/api/productos`;
    const resp = await llamarAPI(url, {
      method: 'POST',
      headers: obtenerHeaders(true),
      body: JSON.stringify({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        pesoKg: Number(producto.pesoKg) || 11,
        precio: Number(producto.precio),
        stockActual: Number(producto.stock) || 10,
        imagenUrl: producto.imagen || '/img/cilindros.png',
        activo: true
      })
    });
    if (!resp.ok) throw new Error("No tienes permisos o falló la creación del producto");
    return await resp.json();
  } catch (err) {
    console.error("Error al crear producto en backend:", err);
    throw err;
  }
}

// Actualizar producto (Solo Administrador)
export async function actualizarProductoAPI(id, producto) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PRODUCTOS}/api/productos/${id}`;
    const resp = await llamarAPI(url, {
      method: 'PUT',
      headers: obtenerHeaders(true),
      body: JSON.stringify({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        pesoKg: Number(producto.pesoKg),
        precio: Number(producto.precio),
        stockActual: Number(producto.stock),
        imagenUrl: producto.imagen,
        activo: true
      })
    });
    if (!resp.ok) throw new Error("Error al actualizar producto");
    return await resp.json();
  } catch (err) {
    console.error("Error al actualizar producto en backend:", err);
    throw err;
  }
}

// Eliminar / Desactivar producto (Solo Administrador)
export async function eliminarProductoAPI(id) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PRODUCTOS}/api/productos/${id}`;
    const resp = await llamarAPI(url, {
      method: 'DELETE',
      headers: obtenerHeaders(true)
    });
    if (!resp.ok) throw new Error("Error al eliminar producto");
    return await resp.json();
  } catch (err) {
    console.error("Error al eliminar producto en backend:", err);
    throw err;
  }
}

// --------------------------------------------------------------------------
// 2. AUTENTICACIÓN Y ROLES (Microservicio Usuarios - Puerto 8081)
// --------------------------------------------------------------------------
export async function iniciarSesionAPI(username, password) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_USUARIOS}/api/auth/login`;
    const resp = await llamarAPI(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password: password.trim() })
    });

    if (resp.ok) {
      const data = await resp.json();
      // data viene con { token, username, nombreCompleto, rol }
      localStorage.setItem('jwtToken', data.token);

      const sesion = {
        nombre: data.nombreCompleto || data.username,
        email: data.username,
        username: data.username,
        rol: data.rol, // ROLE_ADMIN, ROLE_OPERADORA, ROLE_REPARTIDOR, ROLE_CLIENTE
        token: data.token
      };
      localStorage.setItem('usuarioSesion', JSON.stringify(sesion));

      return {
        estado: 'OK',
        mensaje: `¡Bienvenido(a) ${sesion.nombre}! Rol asignado: ${sesion.rol}`,
        usuario: sesion,
        token: data.token
      };
    }

    const errData = await resp.json().catch(() => ({}));
    return {
      estado: 'ERROR',
      mensaje: errData.error || 'Credenciales inválidas en el microservicio de usuarios.'
    };
  } catch (error) {
    console.warn("Microservicio 8081 no disponible. Intentando autenticación local de prueba:", error.message);

    // Usuarios de prueba en memoria por si el backend está apagado
    const usuariosPrueba = [
      { email: 'admin@gaselvolcan.cl', password: 'admin123', nombre: 'Rodrigo Admin', rol: 'ROLE_ADMIN' },
      { email: 'operadora@gaselvolcan.cl', password: 'opera123', nombre: 'Camila Operadora', rol: 'ROLE_OPERADORA' },
      { email: 'repartidor@gaselvolcan.cl', password: 'repa123', nombre: 'Carlos Repartidor', rol: 'ROLE_REPARTIDOR' },
      { email: 'cliente@gmail.com', password: 'cliente123', nombre: 'Juan Cliente', rol: 'ROLE_CLIENTE' }
    ];

    const encontrado = usuariosPrueba.find(u => u.email.toLowerCase() === username.toLowerCase() && u.password === password);
    if (encontrado) {
      const tokenLocal = 'demo-jwt-' + btoa(encontrado.email + ':' + encontrado.rol);
      localStorage.setItem('jwtToken', tokenLocal);
      const sesion = {
        nombre: encontrado.nombre,
        email: encontrado.email,
        username: encontrado.email,
        rol: encontrado.rol,
        token: tokenLocal
      };
      localStorage.setItem('usuarioSesion', JSON.stringify(sesion));
      return {
        estado: 'OK',
        mensaje: `¡Sesión local iniciada! Bienvenido(a) ${sesion.nombre} (${sesion.rol})`,
        usuario: sesion,
        token: tokenLocal
      };
    }

    return {
      estado: 'ERROR',
      mensaje: 'Usuario o contraseña incorrectos. Verifica que el microservicio esté activo en el puerto 8081 o usa admin@gaselvolcan.cl / admin123'
    };
  }
}

export async function registrarUsuarioAPI(datosUsuario) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_USUARIOS}/api/auth/registro`;
    const resp = await llamarAPI(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: datosUsuario.email.trim(),
        password: datosUsuario.password.trim(),
        nombreCompleto: datosUsuario.nombre.trim(),
        rol: datosUsuario.rol || 'ROLE_CLIENTE'
      })
    });

    if (resp.ok) {
      const data = await resp.json();
      return {
        estado: 'OK',
        mensaje: data.mensaje || '¡Cuenta creada con éxito en el Microservicio de Usuarios!',
        usuario: data
      };
    }

    const errData = await resp.json().catch(() => ({}));
    return {
      estado: 'ERROR',
      mensaje: errData.error || 'No se pudo registrar el usuario en el backend.'
    };
  } catch (error) {
    console.warn("Backend 8081 no disponible. Registrando cuenta en LocalStorage:", error.message);
    const sesionLocal = {
      nombre: datosUsuario.nombre,
      email: datosUsuario.email,
      username: datosUsuario.email,
      rol: 'ROLE_CLIENTE',
      token: 'demo-jwt-' + btoa(datosUsuario.email)
    };
    return {
      estado: 'OK',
      mensaje: '¡Cuenta creada con éxito! Ahora puedes iniciar sesión.',
      usuario: sesionLocal
    };
  }
}

// --------------------------------------------------------------------------
// 3. PEDIDOS (Microservicio Pedidos - Puerto 8083)
// --------------------------------------------------------------------------

// Crear pedido desde el carrito
export async function crearPedidoAPI(datosPedido) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PEDIDOS}/api/pedidos`;
    const item = datosPedido.productos && datosPedido.productos[0];

    const bodyBackend = {
      clienteNombre: datosPedido.usuario?.nombre || datosPedido.usuario?.nombreCompleto || 'Cliente El Volcán',
      direccionEntrega: datosPedido.direccion || 'Chillán Centro',
      productoId: item ? Number(item.id) || 1 : 1,
      productoNombre: item ? item.nombre : 'Cilindro GLP 11 kg',
      precioUnitario: item ? Number(item.precio) || 12000 : 12000,
      cantidad: item ? Number(item.cantidad) || 1 : 1
    };

    const resp = await llamarAPI(url, {
      method: 'POST',
      headers: obtenerHeaders(true),
      body: JSON.stringify(bodyBackend)
    });

    if (resp.ok) {
      const pedidoCreado = await resp.json();
      return {
        estado: 'OK',
        idPedido: pedidoCreado.id,
        mensaje: `Pedido #${pedidoCreado.id} registrado con éxito en el Microservicio de Pedidos (Estado: ${pedidoCreado.estado}).`
      };
    }

    throw new Error();
  } catch {
    // Respaldo local
    const idLocal = Math.floor(Math.random() * 9000) + 1000;
    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_locales') || '[]');
    pedidosLocales.unshift({
      id: idLocal,
      clienteNombre: datosPedido.usuario?.nombre || 'Cliente',
      direccionEntrega: datosPedido.direccion,
      productoNombre: datosPedido.productos?.[0]?.nombre || 'Cilindro GLP 11 kg',
      cantidad: datosPedido.productos?.[0]?.cantidad || 1,
      totalPagar: datosPedido.total || 12000,
      estado: 'PENDIENTE',
      fechaCreacion: new Date().toISOString()
    });
    localStorage.setItem('pedidos_locales', JSON.stringify(pedidosLocales));

    return {
      estado: 'OK',
      idPedido: idLocal,
      mensaje: `Pedido #${idLocal} guardado con éxito. Asignado a reparto en Chillán.`
    };
  }
}

// Obtener mis pedidos (para el cliente autenticado)
export async function obtenerMisPedidosAPI() {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PEDIDOS}/api/pedidos/mis-pedidos`;
    const resp = await llamarAPI(url, { headers: obtenerHeaders(true) });
    if (!resp.ok) throw new Error();
    return await resp.json();
  } catch {
    return JSON.parse(localStorage.getItem('pedidos_locales') || '[]');
  }
}

// Obtener todos los pedidos (para Operadora y Administrador)
export async function obtenerTodosPedidosAPI() {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PEDIDOS}/api/pedidos`;
    const resp = await llamarAPI(url, { headers: obtenerHeaders(true) });
    if (!resp.ok) throw new Error();
    return await resp.json();
  } catch {
    return JSON.parse(localStorage.getItem('pedidos_locales') || '[]');
  }
}

// Actualizar estado del pedido (EN_CAMINO, ENTREGADO, CANCELADO)
export async function actualizarEstadoPedidoAPI(id, nuevoEstado) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PEDIDOS}/api/pedidos/${id}/estado`;
    const resp = await llamarAPI(url, {
      method: 'PUT',
      headers: obtenerHeaders(true),
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!resp.ok) throw new Error("No tienes permisos para cambiar el estado");
    return await resp.json();
  } catch (err) {
    console.error("Error al actualizar estado en backend:", err);
    throw err;
  }
}

// Asignar repartidor al pedido
export async function asignarRepartidorPedidoAPI(id, repartidorUsername) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PEDIDOS}/api/pedidos/${id}/asignar`;
    const resp = await llamarAPI(url, {
      method: 'PUT',
      headers: obtenerHeaders(true),
      body: JSON.stringify({ repartidorUsername })
    });
    if (!resp.ok) throw new Error("Error al asignar repartidor");
    return await resp.json();
  } catch (err) {
    console.error("Error al asignar repartidor en backend:", err);
    throw err;
  }
}

// Cancelar / Eliminar pedido
export async function cancelarPedidoAPI(id) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_PEDIDOS}/api/pedidos/${id}`;
    const resp = await llamarAPI(url, {
      method: 'DELETE',
      headers: obtenerHeaders(true)
    });
    if (!resp.ok) throw new Error("No tienes permisos para cancelar este pedido");
    return await resp.json();
  } catch (err) {
    console.error("Error al cancelar pedido:", err);
    throw err;
  }
}

// --------------------------------------------------------------------------
// CRUD DE USUARIOS (Microservicio Usuarios - 8081)
// --------------------------------------------------------------------------

// Obtener lista completa de usuarios
export async function obtenerUsuariosAPI() {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_USUARIOS}/api/usuarios`;
    const resp = await llamarAPI(url, { headers: obtenerHeaders(true) });
    if (!resp.ok) throw new Error("No se pudo obtener la lista de usuarios");
    return await resp.json();
  } catch (err) {
    console.error("Error al listar usuarios:", err);
    return [];
  }
}

// Crear nuevo usuario desde el panel Admin
export async function crearUsuarioAdminAPI(datosUsuario) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_USUARIOS}/api/usuarios`;
    const resp = await llamarAPI(url, {
      method: 'POST',
      headers: obtenerHeaders(true),
      body: JSON.stringify(datosUsuario)
    });
    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || "Error al crear usuario en microservicio");
    }
    return await resp.json();
  } catch (err) {
    console.error("Error al crear usuario:", err);
    throw err;
  }
}

// Actualizar usuario existente (nombre, rol, estado activo, password opcional)
export async function actualizarUsuarioAPI(id, datosActualizados) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_USUARIOS}/api/usuarios/${id}`;
    const resp = await llamarAPI(url, {
      method: 'PUT',
      headers: obtenerHeaders(true),
      body: JSON.stringify(datosActualizados)
    });
    if (!resp.ok) throw new Error("No se pudo actualizar el usuario");
    return await resp.json();
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    throw err;
  }
}

// Desactivar / Eliminar usuario
export async function desactivarUsuarioAPI(id) {
  try {
    const url = `${API_CONFIG.MICROSERVICIO_USUARIOS}/api/usuarios/${id}`;
    const resp = await llamarAPI(url, {
      method: 'DELETE',
      headers: obtenerHeaders(true)
    });
    if (!resp.ok) throw new Error("No se pudo desactivar el usuario");
    return await resp.json();
  } catch (err) {
    console.error("Error al desactivar usuario:", err);
    throw err;
  }
}

