/* ==========================================================================
   VALIDACIONES DE FORMULARIO - VALIDACIONES.JS (PDF Requisito 2)
   Integrado con clases contextuales de Bootstrap 5
   ========================================================================== */


document.addEventListener('DOMContentLoaded', () => {

  // 1. REGISTRO
  const formRegistro = document.getElementById('formRegistro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      limpiarErrores('formRegistro');

      const nombre = document.getElementById('nombre');
      const email = document.getElementById('email');
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirmPassword');
      const telefono = document.getElementById('telefono');

      let esValido = true;

      if (nombre.value.trim().length < 3) {
        setInvalid(nombre, 'error-nombre', 'El nombre completo debe tener al menos 3 caracteres.');
        esValido = false;
      } else {
        setValid(nombre);
      }

      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email.value.trim())) {
        setInvalid(email, 'error-email', 'Ingresa un correo electrónico válido.');
        esValido = false;
      } else {
        setValid(email);
      }

      if (password.value.trim().length < 6) {
        setInvalid(password, 'error-password', 'La contraseña debe tener mínimo 6 caracteres.');
        esValido = false;
      } else {
        setValid(password);
      }

      if (confirmPassword.value.trim() === '' || confirmPassword.value !== password.value) {
        setInvalid(confirmPassword, 'error-confirmPassword', 'Las contraseñas no coinciden.');
        esValido = false;
      } else {
        setValid(confirmPassword);
      }

      if (telefono.value.trim() !== '' && !/^[0-9]{9}$/.test(telefono.value.trim())) {
        setInvalid(telefono, 'error-telefono', 'El teléfono debe tener 9 dígitos numéricos.');
        esValido = false;
      } else if (telefono.value.trim() !== '') {
        setValid(telefono);
      }

      if (esValido) {
        const datos = {
          nombre: nombre.value.trim(),
          email: email.value.trim(),
          password: password.value.trim(),
          telefono: telefono.value.trim(),
          rol: document.getElementById('rol').value
        };
        const resp = await registrarUsuarioAPI(datos);
        const alerta = document.getElementById('mensajeExito');
        alerta.textContent = `¡Registro exitoso! ${resp.mensaje}`;
        alerta.classList.remove('d-none');
        formRegistro.reset();
        limpiarEstados('formRegistro');
      }
    });
  }

  // 2. LOGIN
  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      limpiarErrores('formLogin');

      const email = document.getElementById('loginEmail');
      const password = document.getElementById('loginPassword');
      let esValido = true;

      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email.value.trim())) {
        setInvalid(email, 'error-loginEmail', 'Ingresa un correo válido.');
        esValido = false;
      } else {
        setValid(email);
      }

      if (password.value.trim().length < 4) {
        setInvalid(password, 'error-loginPassword', 'Ingresa tu contraseña.');
        esValido = false;
      } else {
        setValid(password);
      }

      if (esValido) {
        const resp = await iniciarSesionAPI(email.value.trim(), password.value.trim());
        const alerta = document.getElementById('mensajeExitoLogin');
        alerta.textContent = `¡Bienvenido! ${resp.mensaje}`;
        alerta.classList.remove('d-none');
        localStorage.setItem('usuarioSesion', JSON.stringify(resp.usuario));
        formLogin.reset();
        limpiarEstados('formLogin');
      }
    });
  }

  // 3. CONTACTO
  const formContacto = document.getElementById('formContacto');
  if (formContacto) {
    formContacto.addEventListener('submit', (e) => {
      e.preventDefault();
      limpiarErrores('formContacto');

      const nombre = document.getElementById('contactoNombre');
      const email = document.getElementById('contactoEmail');
      const asunto = document.getElementById('contactoAsunto');
      const mensaje = document.getElementById('contactoMensaje');
      let esValido = true;

      if (nombre.value.trim().length < 3) {
        setInvalid(nombre, 'error-contactoNombre', 'Ingresa tu nombre.');
        esValido = false;
      } else setValid(nombre);

      if (!email.value.includes('@')) {
        setInvalid(email, 'error-contactoEmail', 'Ingresa un correo válido.');
        esValido = false;
      } else setValid(email);

      if (asunto.value.trim() === '') {
        setInvalid(asunto, 'error-contactoAsunto', 'El asunto es obligatorio.');
        esValido = false;
      } else setValid(asunto);

      if (mensaje.value.trim().length < 5) {
        setInvalid(mensaje, 'error-contactoMensaje', 'Escribe tu mensaje.');
        esValido = false;
      } else setValid(mensaje);

      if (esValido) {
        const alerta = document.getElementById('mensajeExitoContacto');
        alerta.textContent = '¡Mensaje enviado con éxito a la operadora de Chillán!';
        alerta.classList.remove('d-none');
        formContacto.reset();
        limpiarEstados('formContacto');
      }
    });
  }
});

function setInvalid(input, errorId, mensaje) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  const errorBox = document.getElementById(errorId);
  if (errorBox) {
    errorBox.textContent = mensaje;
  }
}

function setValid(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
}

function limpiarErrores(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
}

function limpiarEstados(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
}
