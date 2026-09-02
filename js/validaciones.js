/* ==========================================================================
   VALIDACIONES DE FORMULARIO - VALIDACIONES.JS (PDF Requisito 2)
   Validaciones simples y comprensibles en JavaScript vanilla.
   Muestra mensajes de error claros y personalizados debajo de cada campo.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. FORMULARIO DE REGISTRO
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (evento) => {
            // Evita que el formulario se reargue por defecto
            evento.preventDefault();

            // Limpia errores previos
            limpiarErrores();

            // Captura los valores de los campos
            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            const telefono = document.getElementById('telefono').value.trim();

            let formularioValido = true;

            // Validación Campo Nombre
            if (nombre === '') {
                mostrarError('nombre', 'El nombre completo es obligatorio.');
                formularioValido = false;
            } else if (nombre.length < 3) {
                mostrarError('nombre', 'El nombre debe tener al menos 3 caracteres.');
                formularioValido = false;
            }

            // Validación Campo Email (con expresión regular simple)
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email === '') {
                mostrarError('email', 'El correo electrónico es obligatorio.');
                formularioValido = false;
            } else if (!regexEmail.test(email)) {
                mostrarError('email', 'Por favor ingresa un correo electrónico válido (ejemplo: usuario@correo.com).');
                formularioValido = false;
            }

            // Validación Campo Contraseña
            if (password === '') {
                mostrarError('password', 'La contraseña es obligatoria.');
                formularioValido = false;
            } else if (password.length < 6) {
                mostrarError('password', 'La contraseña debe tener mínimo 6 caracteres.');
                formularioValido = false;
            }

            // Validación Confirmar Contraseña
            if (confirmPassword === '') {
                mostrarError('confirmPassword', 'Debes confirmar tu contraseña.');
                formularioValido = false;
            } else if (password !== confirmPassword) {
                mostrarError('confirmPassword', 'Las contraseñas no coinciden.');
                formularioValido = false;
            }

            // Validación Teléfono (Solo números opcionales de 9 dígitos)
            if (telefono !== '' && !/^[0-9]{9}$/.test(telefono)) {
                mostrarError('telefono', 'El teléfono debe contener exactamente 9 números.');
                formularioValido = false;
            }

            // Si todo es correcto, simula el registro llamando al Microservicio (api.js)
            if (formularioValido) {
                const datosUsuario = { nombre, email, password, telefono };
                
                // Llamada al Microservicio Usuarios (api.js)
                const respuestaBackend = await registrarUsuarioAPI(datosUsuario);

                const mensajeExito = document.getElementById('mensajeExito');
                if (mensajeExito) {
                    mensajeExito.textContent = `¡Registro exitoso! ${respuestaBackend.mensaje}`;
                    mensajeExito.style.display = 'block';
                }

                // Limpia el formulario
                formRegistro.reset();
            }
        });
    }

    // 2. FORMULARIO DE CONTACTO
    const formContacto = document.getElementById('formContacto');
    if (formContacto) {
        formContacto.addEventListener('submit', (evento) => {
            evento.preventDefault();
            limpiarErrores();

            const nombre = document.getElementById('contactoNombre').value.trim();
            const email = document.getElementById('contactoEmail').value.trim();
            const asunto = document.getElementById('contactoAsunto').value.trim();
            const mensaje = document.getElementById('contactoMensaje').value.trim();

            let esValido = true;

            if (nombre === '') {
                mostrarError('contactoNombre', 'Por favor ingresa tu nombre.');
                esValido = false;
            }
            if (email === '' || !email.includes('@')) {
                mostrarError('contactoEmail', 'Ingresa un correo de contacto válido.');
                esValido = false;
            }
            if (asunto === '') {
                mostrarError('contactoAsunto', 'El asunto es obligatorio.');
                esValido = false;
            }
            if (mensaje === '') {
                mostrarError('contactoMensaje', 'Por favor escribe tu mensaje.');
                esValido = false;
            }

            if (esValido) {
                const mensajeExito = document.getElementById('mensajeExitoContacto');
                if (mensajeExito) {
                    mensajeExito.textContent = '¡Gracias por contactarnos! Tu mensaje fue enviado con éxito.';
                    mensajeExito.style.display = 'block';
                }
                formContacto.reset();
            }
        });
    }
});

// Función auxiliar para mostrar mensaje de error dinámico en el campo específico
function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;

    // Agrega borde rojo al input
    campo.classList.add('input-error');

    // Busca el elemento de mensaje de error asociado
    const errorElemento = document.getElementById(`error-${idCampo}`);
    if (errorElemento) {
        errorElemento.textContent = mensaje;
        errorElemento.style.display = 'block';
    }
}

// Función auxiliar para limpiar todos los errores visibles
function limpiarErrores() {
    // Quita clases de error de los inputs
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('input-error');
    });

    // Oculta mensajes de error
    document.querySelectorAll('.mensaje-error').forEach(msg => {
        msg.textContent = '';
        msg.style.display = 'none';
    });

    // Oculta mensajes de éxito
    const msgExito = document.getElementById('mensajeExito');
    if (msgExito) msgExito.style.display = 'none';

    const msgExitoContacto = document.getElementById('mensajeExitoContacto');
    if (msgExitoContacto) msgExitoContacto.style.display = 'none';
}
