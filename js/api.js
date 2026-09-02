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

// Datos Mock en formato JSON de Gas El Volcán usando la imagen de los cilindros de gas
const MOCK_DATA = {
    productos: [
        { 
            id: 1, 
            nombre: 'Cilindro de Gas 5 kg', 
            precio: 12500, 
            categoria: 'Cilindros', 
            imagen: 'img/cilindro_5kg.png', 
            descripcion: 'Cilindro pequeño de 5 kg. Ideal para estufas portátiles y camping.' 
        },
        { 
            id: 2, 
            nombre: 'Cilindro de Gas 11 kg', 
            precio: 21900, 
            categoria: 'Cilindros', 
            imagen: 'img/cilindro_11kg.png', 
            descripcion: 'Cilindro mediano de 11 kg. El más utilizado para cocina y calefacción familiar.' 
        },
        { 
            id: 3, 
            nombre: 'Cilindro de Gas 15 kg', 
            precio: 27500, 
            categoria: 'Cilindros', 
            imagen: 'img/cilindro_15kg.png', 
            descripcion: 'Cilindro grande de 15 kg. Máxima duración para hogares y locales comerciales.' 
        }
    ]
};

// 1. Obtener Lista de Cilindros de Gas en formato JSON
async function obtenerProductosAPI() {
    try {
        const respuesta = await fetch(API_CONFIG.MICROSERVICIO_PRODUCTOS);
        if (!respuesta.ok) {
            throw new Error(`Error en servidor: ${respuesta.status}`);
        }
        return await respuesta.json();
    } catch (error) {
        console.warn('Backend Spring Boot no disponible. Usando datos simulados (Mock JSON):', error.message);
        return MOCK_DATA.productos;
    }
}

// 2. Registrar Usuario enviando JSON al Microservicio de Usuarios
async function registrarUsuarioAPI(datosUsuario) {
    try {
        const respuesta = await fetch(API_CONFIG.MICROSERVICIO_USUARIOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });
        return await respuesta.json();
    } catch (error) {
        console.warn('Simulación de respuesta JSON exitosa del Microservicio de Usuarios.');
        return {
            estado: 'OK',
            mensaje: 'Usuario registrado correctamente en Gas El Volcán (Respuesta JSON Microservicio /api/usuarios)',
            usuario: datosUsuario
        };
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
        console.warn('Simulación de respuesta JSON exitosa del Microservicio de Pedidos.');
        return {
            estado: 'OK',
            idPedido: Math.floor(Math.random() * 9000) + 1000,
            mensaje: 'Pedido de gas ingresado con éxito. Asignado a reparto en Chillán (Respuesta JSON Microservicio /api/pedidos)'
        };
    }
}
