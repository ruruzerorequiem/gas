import React, { useState } from 'react';

export default function Contacto() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState({});
  const [exito, setExito] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    if (nombre.trim().length < 3) {
      nuevosErrores.nombre = 'Ingresa tu nombre.';
    }

    if (!email.includes('@')) {
      nuevosErrores.email = 'Ingresa un correo válido.';
    }

    if (asunto.trim() === '') {
      nuevosErrores.asunto = 'El asunto es obligatorio.';
    }

    if (mensaje.trim().length < 5) {
      nuevosErrores.mensaje = 'Escribe tu mensaje.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setExito(false);
      return;
    }

    setErrores({});
    setExito(true);
    setNombre('');
    setEmail('');
    setAsunto('');
    setMensaje('');
  };

  return (
    <main className="py-5 fade-in">
      <div className="container" style={{ maxWidth: '620px' }}>
        <div className="surface-card p-4 p-md-5">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-chat-square-text-fill fs-4" style={{ color: 'var(--gas-orange)' }}></i>
            <h1 className="h3 fw-bold mb-0" style={{ color: 'var(--gas-blue-dark)' }}>
              Contacto y Atención al Cliente
            </h1>
          </div>
          <p className="text-muted small mb-4">
            ¿Dudas con tu reparto o convenio comercial? Escríbenos y una operadora te contactará
          </p>

          {exito && (
            <div className="alert alert-success" id="mensajeExitoContacto" role="alert">
              ¡Mensaje enviado con éxito a la operadora de Chillán!
            </div>
          )}

          <form id="formContacto" onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="contactoNombre" className="form-label fw-semibold">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="contactoNombre"
                className={`form-control ${errores.nombre ? 'is-invalid' : ''} ${!errores.nombre && nombre ? 'is-valid' : ''}`}
                placeholder="Tu nombre completo"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errores.nombre) setErrores({ ...errores, nombre: null });
                }}
              />
              {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="contactoEmail" className="form-label fw-semibold">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="contactoEmail"
                className={`form-control ${errores.email ? 'is-invalid' : ''} ${!errores.email && email ? 'is-valid' : ''}`}
                placeholder="usuario@correo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errores.email) setErrores({ ...errores, email: null });
                }}
              />
              {errores.email && <div className="invalid-feedback">{errores.email}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="contactoAsunto" className="form-label fw-semibold">
                Asunto *
              </label>
              <input
                type="text"
                id="contactoAsunto"
                className={`form-control ${errores.asunto ? 'is-invalid' : ''} ${!errores.asunto && asunto ? 'is-valid' : ''}`}
                placeholder="Ej: Consulta sobre zonas de reparto en Pinto"
                value={asunto}
                onChange={(e) => {
                  setAsunto(e.target.value);
                  if (errores.asunto) setErrores({ ...errores, asunto: null });
                }}
              />
              {errores.asunto && <div className="invalid-feedback">{errores.asunto}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="contactoMensaje" className="form-label fw-semibold">
                Mensaje o Consulta *
              </label>
              <textarea
                id="contactoMensaje"
                className={`form-control ${errores.mensaje ? 'is-invalid' : ''} ${!errores.mensaje && mensaje ? 'is-valid' : ''}`}
                rows="4"
                placeholder="Escribe aquí tu consulta..."
                value={mensaje}
                onChange={(e) => {
                  setMensaje(e.target.value);
                  if (errores.mensaje) setErrores({ ...errores, mensaje: null });
                }}
              ></textarea>
              {errores.mensaje && <div className="invalid-feedback">{errores.mensaje}</div>}
            </div>

            <button type="submit" className="btn btn-danger w-100 py-2 fw-bold">
              Enviar Mensaje a Operadora
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
