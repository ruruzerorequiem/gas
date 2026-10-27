/* ==========================================================================
   JAVASCRIPT PRINCIPAL - MAIN.JS
   Lógica simple para menú hamburguesa (móvil 360px) y funciones de interfaz.
   ========================================================================== */

// Espera a que todo el documento HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lógica del Menú Hamburguesa para vista Móvil (Requisito 0.3)
    const botonMenu = document.getElementById('botonMenu');
    const menuNavegacion = document.getElementById('menuNavegacion');

    if (botonMenu && menuNavegacion) {
        botonMenu.addEventListener('click', () => {
            // Alterna la clase 'active' para mostrar u ocultar el menú
            menuNavegacion.classList.toggle('active');
        });
    }

    // 2. Contador del Carrito de Compras (Actualización simple)
    actualizarContadorCarrito();

    // 3. Indicador de Usuario en Sesión en el Navbar
    actualizarEstadoSesionUI();
});

// Función para mostrar usuario logueado en el contenedor de la derecha
function actualizarEstadoSesionUI() {
    const sesionStr = localStorage.getItem('usuarioSesion');
    const contenedores = document.querySelectorAll('#contenedorUsuarioHeader');

    let sesion = null;
    if (sesionStr) {
        try {
            sesion = JSON.parse(sesionStr);
        } catch (e) {}
    }

    if (sesion && (sesion.nombre || sesion.email)) {
        const nombreMostrar = sesion.nombre ? sesion.nombre.split(' ')[0] : sesion.email;
        contenedores.forEach(c => {
            c.innerHTML = `
                <div class="dropdown d-inline-block">
                    <button class="btn btn-outline-success fw-semibold dropdown-toggle btn-sm py-2 px-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-person-fill-check me-1"></i> Hola, <strong>${nombreMostrar}</strong>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        <li><button class="dropdown-item small text-danger" onclick="cerrarSesionUsuario()"><i class="bi bi-box-arrow-right me-2"></i> Cerrar Sesión</button></li>
                    </ul>
                </div>
            `;
        });
    } else {
        contenedores.forEach(c => {
            c.innerHTML = `
                <a href="registro.html" class="btn btn-outline-secondary fw-semibold btn-sm py-2 px-3">
                    <i class="bi bi-person me-1"></i> Ingreso / Registro
                </a>
            `;
        });
    }
}

function cerrarSesionUsuario() {
    localStorage.removeItem('usuarioSesion');
    actualizarEstadoSesionUI();
    alert('Has cerrado sesión correctamente.');
    if (window.location.pathname.endsWith('registro.html')) {
        window.location.reload();
    }
}

// Función simple para actualizar la cantidad de ítems en el carrito desde localStorage
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const elementosContador = document.querySelectorAll('.cart-count');
    elementosContador.forEach(el => {
        el.textContent = carrito.reduce((total, prod) => total + (prod.cantidad || 1), 0);
    });
}

// Función auxiliar para agregar producto al carrito local
function agregarAlCarrito(id, nombre, precio, imagen) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const productoExistente = carrito.find(item => item.id === id);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio, imagen, cantidad: 1 });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert(`¡"${nombre}" fue agregado al carrito exitosamente!`);
}
