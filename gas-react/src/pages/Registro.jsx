import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { registrarUsuarioAPI, iniciarSesionAPI } from '../api';

export default function Registro() {
  const { loginUsuario, usuarioSesion, cerrarSesionUsuario } = useApp();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'registro'

  // Estados Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrores, setLoginErrores] = useState({});
  const [mensajeExitoLogin, setMensajeExitoLogin] = useState('');
  const [mensajeErrorLogin, setMensajeErrorLogin] = useState('');

  // Estados Registro
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('Cliente');
  const [registroErrores, setRegistroErrores] = useState({});
  const [mensajeExitoRegistro, setMensajeExitoRegistro] = useState('');
  const [mensajeErrorRegistro, setMensajeErrorRegistro] = useState('');

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMensajeExitoLogin('');
    setMensajeErrorLogin('');

    const errores = {};
    if (!regexEmail.test(loginEmail.trim())) {
      errores.email = 'Ingresa un correo válido.';
    }
    if (loginPassword.trim().length < 4) {
      errores.password = 'Ingresa tu contraseña.';
    }

    if (Object.keys(errores).length > 0) {
      setLoginErrores(errores);
      return;
    }

    setLoginErrores({});
    const resp = await iniciarSesionAPI(loginEmail.trim(), loginPassword.trim());

    if (resp.estado === 'OK') {
      setMensajeExitoLogin(resp.mensaje);
      loginUsuario(resp.usuario);
      setLoginPassword('');
    } else {
      setMensajeErrorLogin(resp.mensaje);
    }
  };

  // Handle Registro
  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setMensajeExitoRegistro('');
    setMensajeErrorRegistro('');

    const errores = {};
    if (nombre.trim().length < 3) {
      errores.nombre = 'El nombre completo debe tener al menos 3 caracteres.';
    }
    if (!regexEmail.test(email.trim())) {
      errores.email = 'Ingresa un correo electrónico válido.';
    }
    if (password.trim().length < 6) {
      errores.password = 'La contraseña debe tener mínimo 6 caracteres.';
    }
    if (confirmPassword.trim() === '' || confirmPassword !== password) {
      errores.confirmPassword = 'Las contraseñas no coinciden.';
    }
    if (telefono.trim() !== '' && !/^[0-9]{9}$/.test(telefono.trim())) {
      errores.telefono = 'El teléfono debe tener 9 dígitos numéricos.';
    }

    if (Object.keys(errores).length > 0) {
      setRegistroErrores(errores);
      return;
    }

    setRegistroErrores({});

    const datos = {
      nombre: nombre.trim(),
      email: email.trim(),
      password: password.trim(),
      telefono: telefono.trim(),
      rol: rol
    };

    const resp = await registrarUsuarioAPI(datos);

    if (resp.estado === 'OK') {
      setMensajeExitoRegistro(resp.mensaje);
      setNombre('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTelefono('');
      setRol('Cliente');
    } else {
      setMensajeErrorRegistro(resp.mensaje);
    }
  };

  return (
    <main className="py-5 bg-light">
      <div className="container" style={{ maxWidth: '580px' }}>
        {usuarioSesion && (
          <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
            <div>
              <i className="bi bi-person-check-fill me-2"></i>
              Actualmente tienes sesión iniciada como <strong>{usuarioSesion.nombre || usuarioSesion.email}</strong>.
            </div>
            <button className="btn btn-outline-danger btn-sm" onClick={cerrarSesionUsuario}>
              Cerrar Sesión
            </button>
          </div>
        )}

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white p-3 border-bottom-0">
            <ul className="nav nav-pills nav-fill" id="authTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'login' ? 'active' : ''}`}
                  id="tab-login-btn"
                  type="button"
                  onClick={() => setActiveTab('login')}
                >
                  Iniciar Sesión
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'registro' ? 'active' : ''}`}
                  id="tab-registro-btn"
                  type="button"
                  onClick={() => setActiveTab('registro')}
                >
                  Crear Cuenta
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4 pt-2">
            <div className="tab-content" id="pills-tabContent">
              {/* PANEL LOGIN */}
              {activeTab === 'login' && (
                <div className="tab-pane fade show active" id="pills-login" role="tabpanel">
                  <h2 className="h4 fw-bold mb-2">Ingresar al Sistema</h2>
                  <p className="text-muted small mb-4">Accede con tu cuenta para gestionar tus entregas</p>

                  {mensajeExitoLogin && (
                    <div className="alert alert-success" id="mensajeExitoLogin" role="alert">
                      {mensajeExitoLogin}
                    </div>
                  )}
                  {mensajeErrorLogin && (
                    <div className="alert alert-danger" id="mensajeErrorLogin" role="alert">
                      {mensajeErrorLogin}
                    </div>
                  )}

                  <form id="formLogin" onSubmit={handleLoginSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="loginEmail" className="form-label fw-semibold">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        id="loginEmail"
                        className={`form-control ${loginErrores.email ? 'is-invalid' : ''}`}
                        placeholder="usuario@correo.com"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (loginErrores.email) setLoginErrores({ ...loginErrores, email: null });
                        }}
                      />
                      {loginErrores.email && (
                        <div className="invalid-feedback">{loginErrores.email}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="loginPassword" className="form-label fw-semibold">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        id="loginPassword"
                        className={`form-control ${loginErrores.password ? 'is-invalid' : ''}`}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (loginErrores.password) setLoginErrores({ ...loginErrores, password: null });
                        }}
                      />
                      {loginErrores.password && (
                        <div className="invalid-feedback">{loginErrores.password}</div>
                      )}
                    </div>

                    <button type="submit" className="btn btn-danger w-100 py-2 fw-bold">
                      Ingresar
                    </button>
                  </form>
                </div>
              )}

              {/* PANEL REGISTRO */}
              {activeTab === 'registro' && (
                <div className="tab-pane fade show active" id="pills-registro" role="tabpanel">
                  <h2 className="h4 fw-bold mb-2">Registro de Usuario</h2>
                  <p className="text-muted small mb-3">Crea tu cuenta para realizar pedidos directos</p>

                  {mensajeExitoRegistro && (
                    <div className="alert alert-success" id="mensajeExito" role="alert">
                      {mensajeExitoRegistro}
                    </div>
                  )}
                  {mensajeErrorRegistro && (
                    <div className="alert alert-danger" id="mensajeErrorRegistro" role="alert">
                      {mensajeErrorRegistro}
                    </div>
                  )}

                  <form id="formRegistro" onSubmit={handleRegistroSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="nombre" className="form-label fw-semibold">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        className={`form-control ${registroErrores.nombre ? 'is-invalid' : ''}`}
                        placeholder="Ej: María González"
                        autoComplete="name"
                        value={nombre}
                        onChange={(e) => {
                          setNombre(e.target.value);
                          if (registroErrores.nombre) setRegistroErrores({ ...registroErrores, nombre: null });
                        }}
                      />
                      <div className="form-text">Ingresa tu nombre y dos apellidos.</div>
                      {registroErrores.nombre && (
                        <div className="invalid-feedback">{registroErrores.nombre}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-semibold">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${registroErrores.email ? 'is-invalid' : ''}`}
                        placeholder="usuario@correo.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (registroErrores.email) setRegistroErrores({ ...registroErrores, email: null });
                        }}
                      />
                      {registroErrores.email && (
                        <div className="invalid-feedback">{registroErrores.email}</div>
                      )}
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-md-6">
                        <label htmlFor="password" className="form-label fw-semibold">
                          Contraseña *
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          className={`form-control ${registroErrores.password ? 'is-invalid' : ''}`}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (registroErrores.password) setRegistroErrores({ ...registroErrores, password: null });
                          }}
                        />
                        {registroErrores.password && (
                          <div className="invalid-feedback">{registroErrores.password}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="confirmPassword" className="form-label fw-semibold">
                          Confirmar *
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className={`form-control ${registroErrores.confirmPassword ? 'is-invalid' : ''}`}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (registroErrores.confirmPassword) setRegistroErrores({ ...registroErrores, confirmPassword: null });
                          }}
                        />
                        {registroErrores.confirmPassword && (
                          <div className="invalid-feedback">{registroErrores.confirmPassword}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="telefono" className="form-label fw-semibold">
                        Teléfono de Contacto
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        className={`form-control ${registroErrores.telefono ? 'is-invalid' : ''}`}
                        placeholder="Ej: 912345678"
                        autoComplete="tel"
                        value={telefono}
                        onChange={(e) => {
                          setTelefono(e.target.value);
                          if (registroErrores.telefono) setRegistroErrores({ ...registroErrores, telefono: null });
                        }}
                      />
                      <div className="form-text">9 dígitos para coordinar con el chofer.</div>
                      {registroErrores.telefono && (
                        <div className="invalid-feedback">{registroErrores.telefono}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="rol" className="form-label fw-semibold">
                        Rol Solicitado
                      </label>
                      <select
                        id="rol"
                        className="form-select"
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                      >
                        <option value="Cliente">Cliente Residencial / Comercial</option>
                        <option value="Operadora">Operadora / Despachadora</option>
                        <option value="Repartidor">Repartidor en Ruta</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-danger w-100 py-2 fw-bold">
                      Crear Cuenta
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
