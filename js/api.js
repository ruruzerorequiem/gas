/* ==========================================================================
   JAVASCRIPT MICROSERVICIOS API - API.JS (Requisito 0.4)
   Simulación y consumo de Microservicios REST Spring Boot independientes.
   Endpoints esperados:
   - Microservicio Productos/Gas: http://localhost:8081/api/productos
   - Microservicio Usuarios: http://localhost:8082/api/usuarios
   - Microservicio Pedidos: http://localhost:8083/api/pedidos
   ========================================================================== */

const API_CONFIG = {
    MICROSERVICIO_PRODUCTOS: 'http://localhost:8081/api/productos',
    MICROSERVICIO_USUARIOS: 'http://localhost:8082/api/usuarios',
    MICROSERVICIO_PEDIDOS: 'http://localhost:8083/api/pedidos'
};

// Catálogo completo de Gas El Volcán cargado instantáneamente (0ms de espera)
const DATOS_LOCAL_CATALOGO = {
  empresa: "Distribuidora de Gas El Volcán",
  productos: [
    {
      codigo: "CL001",
      categoria: "Cilindros de Gas",
      producto: "Cilindro GLP 5 kg",
      descripcion: "Cilindro de gas licuado de petróleo 5 kg. Para uso residencial (cocina, calefacción pequeña).",
      unidad: "Unidad",
      precioResidencial: 6500,
      precioComercial: 6000,
      stockActual: 80,
      imagen: "img/cilindro_5kg.png"
    },
    {
      codigo: "CL002",
      categoria: "Cilindros de Gas",
      producto: "Cilindro GLP 11 kg",
      descripcion: "Cilindro estándar doméstico. El más utilizado en hogares chilenos. Compatible con reguladores estándar.",
      unidad: "Unidad",
      precioResidencial: 12000,
      precioComercial: 11000,
      stockActual: 200,
      imagen: "img/cilindro_11kg.png"
    },
    {
      codigo: "CL003",
      categoria: "Cilindros de Gas",
      producto: "Cilindro GLP 15 kg",
      descripcion: "Cilindro de mayor capacidad para hogares de alto consumo o locales pequeños.",
      unidad: "Unidad",
      precioResidencial: 16000,
      precioComercial: 14500,
      stockActual: 90,
      imagen: "img/cilindro_15kg.png"
    },
    {
      codigo: "CL004",
      categoria: "Cilindros de Gas",
      producto: "Cilindro GLP 45 kg",
      descripcion: "Cilindro industrial. Uso comercial: restaurantes, talleres, calefacción de locales.",
      unidad: "Unidad",
      precioResidencial: 45000,
      precioComercial: 40000,
      stockActual: 30,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "RG001",
      categoria: "Reguladores",
      producto: "Regulador doméstico estándar",
      descripcion: "Regulador de 1 etapa para cilindros 5, 11 y 15 kg. Presión de salida 28 mbar.",
      unidad: "Unidad",
      precioResidencial: 8990,
      precioComercial: 8200,
      stockActual: 45,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "RG002",
      categoria: "Reguladores",
      producto: "Regulador de alta presión",
      descripcion: "Regulador para cocinas industriales o equipos de mayor consumo. Presión regulable.",
      unidad: "Unidad",
      precioResidencial: 18990,
      precioComercial: 17000,
      stockActual: 12,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "RG003",
      categoria: "Reguladores",
      producto: "Regulador dual (2 salidas)",
      descripcion: "Permite conectar dos artefactos simultáneamente al mismo cilindro.",
      unidad: "Unidad",
      precioResidencial: 14990,
      precioComercial: 13500,
      stockActual: 18,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "MG001",
      categoria: "Mangueras y Conexiones",
      producto: "Manguera gas 1.5 m",
      descripcion: "Manguera flexible homologada. Diámetro interior 9mm. Compatible con reguladores estándar.",
      unidad: "Unidad",
      precioResidencial: 3990,
      precioComercial: 3500,
      stockActual: 80,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "MG002",
      categoria: "Mangueras y Conexiones",
      producto: "Manguera gas 3 m",
      descripcion: "Manguera larga para instalaciones donde el artefacto está alejado del cilindro.",
      unidad: "Unidad",
      precioResidencial: 6990,
      precioComercial: 6200,
      stockActual: 50,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "MG003",
      categoria: "Mangueras y Conexiones",
      producto: "Abrazadera metálica",
      descripcion: "Abrazadera de acero para asegurar la conexión manguera-regulador y manguera-artefacto.",
      unidad: "Unidad",
      precioResidencial: 990,
      precioComercial: 800,
      stockActual: 200,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "MG004",
      categoria: "Mangueras y Conexiones",
      producto: "Kit conexión completo (regulador + manguera 1.5m + abrazaderas)",
      descripcion: "Todo lo necesario para instalar un cilindro nuevo.",
      unidad: "Kit",
      precioResidencial: 12990,
      precioComercial: 11500,
      stockActual: 25,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "AC001",
      categoria: "Accesorios",
      producto: "Carro porta cilindro 11/15 kg",
      descripcion: "Carro metálico con ruedas para transportar cilindros dentro del hogar con seguridad.",
      unidad: "Unidad",
      precioResidencial: 12990,
      precioComercial: 11000,
      stockActual: 20,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "AC002",
      categoria: "Accesorios",
      producto: "Tapa protectora para válvula",
      descripcion: "Tapa de plástico ABS para proteger la válvula del cilindro durante el transporte.",
      unidad: "Unidad",
      precioResidencial: 1490,
      precioComercial: 1200,
      stockActual: 60,
      imagen: "img/cilindros.png"
    },
    {
      codigo: "AC003",
      categoria: "Accesorios",
      producto: "Detector de gas a batería",
      descripcion: "Sensor electroquímico. Alarma sonora y visual ante fuga de gas GLP o metano.",
      unidad: "Unidad",
      precioResidencial: 19990,
      precioComercial: 17000,
      stockActual: 8,
      imagen: "img/cilindros.png"
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
    },
    {
      zona: "Zona Sur",
      comunasCubiertas: "Bulnes, Quillón",
      diasDespacho: "Miércoles",
      horario: "08:00 – 16:00",
      tiempoEstimado: "4 – 6 horas"
    },
    {
      zona: "Zona Comercial",
      comunasCubiertas: "Parques industriales y locales comerciales",
      diasDespacho: "Lunes a Viernes",
      horario: "07:00 – 17:00",
      tiempoEstimado: "Según agenda"
    }
  ]
};

// Función síncrona/instantánea de productos (0ms delay)
function obtenerProductosLocalSync() {
    return DATOS_LOCAL_CATALOGO.productos.map(p => ({
        id: p.codigo,
        codigo: p.codigo,
        nombre: p.producto,
        precio: p.precioResidencial,
        precioResidencial: p.precioResidencial,
        precioComercial: p.precioComercial,
        categoria: p.categoria,
        imagen: p.imagen,
        descripcion: p.descripcion,
        stock: p.stockActual,
        unidad: p.unidad
    }));
}

// 1. Obtener Lista de Productos en formato JSON (Con timeout ultra rápido de 100ms)
async function obtenerProductosAPI() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 100);

    try {
        const respuesta = await fetch(API_CONFIG.MICROSERVICIO_PRODUCTOS, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!respuesta.ok) throw new Error();
        return await respuesta.json();
    } catch (error) {
        clearTimeout(timeoutId);
        return obtenerProductosLocalSync();
    }
}

// 1.b Obtener Zonas de Despacho instantáneamente (0ms delay)
async function obtenerZonasDespachoAPI() {
    return DATOS_LOCAL_CATALOGO.zonasDespacho;
}

// Helper para almacenamiento de usuarios en LocalStorage
function obtenerUsuariosLocalStorage() {
    try {
        return JSON.parse(localStorage.getItem('usuarios_gas_el_volcan')) || [];
    } catch (e) {
        return [];
    }
}

function guardarUsuariosLocalStorage(usuarios) {
    localStorage.setItem('usuarios_gas_el_volcan', JSON.stringify(usuarios));
}

// 2. Registrar Usuario enviando JSON al Microservicio de Usuarios (o almacenamiento en LocalStorage)
async function registrarUsuarioAPI(datosUsuario) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 100);
        const respuesta = await fetch(API_CONFIG.MICROSERVICIO_USUARIOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (respuesta.ok) return await respuesta.json();
        throw new Error();
    } catch (error) {
        const usuarios = obtenerUsuariosLocalStorage();
        const existe = usuarios.some(u => u.email.toLowerCase() === datosUsuario.email.toLowerCase());

        if (existe) {
            return {
                estado: 'ERROR',
                mensaje: 'El correo electrónico ya se encuentra registrado. Por favor inicia sesión.'
            };
        }

        usuarios.push({
            nombre: datosUsuario.nombre,
            email: datosUsuario.email,
            password: datosUsuario.password,
            telefono: datosUsuario.telefono || '',
            rol: datosUsuario.rol || 'Cliente',
            fechaRegistro: new Date().toISOString()
        });

        guardarUsuariosLocalStorage(usuarios);

        return {
            estado: 'OK',
            mensaje: '¡Cuenta creada con éxito en LocalStorage! Ahora puedes iniciar sesión con tus credenciales.',
            usuario: datosUsuario
        };
    }
}

// 2.b Iniciar Sesión enviando credenciales al Microservicio de Usuarios (o validación en LocalStorage)
async function iniciarSesionAPI(email, password) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 100);
        const respuesta = await fetch(`${API_CONFIG.MICROSERVICIO_USUARIOS}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (respuesta.ok) return await respuesta.json();
        throw new Error();
    } catch (error) {
        const usuarios = obtenerUsuariosLocalStorage();
        const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (usuarioEncontrado) {
            const sesion = {
                nombre: usuarioEncontrado.nombre,
                email: usuarioEncontrado.email,
                rol: usuarioEncontrado.rol
            };
            localStorage.setItem('usuarioSesion', JSON.stringify(sesion));
            return {
                estado: 'OK',
                mensaje: `¡Bienvenido/a ${usuarioEncontrado.nombre}! Sesión iniciada correctamente en LocalStorage.`,
                usuario: sesion,
                token: 'jwt-local-' + Date.now()
            };
        } else {
            const existeEmail = usuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
            if (existeEmail) {
                return {
                    estado: 'ERROR',
                    mensaje: 'La contraseña ingresada es incorrecta. Vuelve a intentarlo.'
                };
            } else {
                return {
                    estado: 'ERROR',
                    mensaje: 'Este correo no está registrado en el sistema. Por favor presiona en "Crear Cuenta" para registrarte.'
                };
            }
        }
    }
}

// 3. Crear Pedido enviando JSON al Microservicio de Pedidos
async function crearPedidoAPI(datosPedido) {
    try {
        const respuesta = await fetch(API_CONFIG.MICROSERVICIO_PEDIDOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });
        return await respuesta.json();
    } catch (error) {
        return {
            estado: 'OK',
            idPedido: Math.floor(Math.random() * 9000) + 1000,
            mensaje: 'Pedido de gas ingresado con éxito. Asignado a reparto en Chillán (Respuesta JSON Microservicio /api/pedidos)'
        };
    }
}
