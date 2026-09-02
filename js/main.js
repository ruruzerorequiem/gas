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
});

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
