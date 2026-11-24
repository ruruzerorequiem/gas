import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { crearPedidoAPI, obtenerMisPedidosAPI } from '../api';

const ZONAS_OPCIONES = [
  { valor: 'Zona Centro', label: 'Zona Centro - Chillán (Centro, Norte, Sur)', tiempo: '1 – 3 horas', dias: 'Lunes a Sábado (08:00 – 20:00)' },
  { valor: 'Zona Oriente', label: 'Zona Oriente - Chillán Oriente / Chillán Viejo', tiempo: '2 – 4 horas', dias: 'Lunes a Viernes (08:00 – 18:00)' },
  { valor: 'Zona Rural', label: 'Zona Rural - El Carmen, Pinto, San Ignacio', tiempo: '3 – 6 horas', dias: 'Martes y Jueves (08:00 – 16:00)' },
  { valor: 'Zona Sur', label: 'Zona Sur - Bulnes, Quillón', tiempo: '4 – 6 horas', dias: 'Miércoles (08:00 – 16:00)' },
  { valor: 'Zona Comercial', label: 'Zona Comercial - Parques Industriales / Locales', tiempo: 'Según agenda', dias: 'Lunes a Viernes (07:00 – 17:00)' }
];

export default function Carrito() {
  const { carrito, eliminarProductoCarrito, vaciarCarrito, usuarioSesion, navegar, mostrarToast } = useApp();

  const [tabActiva, setTabActiva] = useState('nuevo'); // 'nuevo' | 'historial'
  const [historialPedidos, setHistorialPedidos] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [direccion, setDireccion] = useState('');
  const [zona, setZona] = useState('');
  const [metodoPago, setMetodoPago] = useState('Banco Estado (PagoRUT / Transferencia)');
  const [errores, setErrores] = useState({});
  const [mensajePedido, setMensajePedido] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Estados para Pasarela de Pago Banco Estado
  const [modalBancoEstadoAbierto, setModalBancoEstadoAbierto] = useState(false);
  const [rutBanco, setRutBanco] = useState('');
  const [claveBanco, setClaveBanco] = useState('');
  const [tipoCuentaBanco, setTipoCuentaBanco] = useState('CuentaRUT');
  const [pasoBanco, setPasoBanco] = useState(1); // 1 = Credenciales, 2 = Clave Coordenadas/BE Pass, 3 = Éxito
  const [bePassCode, setBePassCode] = useState('');
  const [procesandoBanco, setProcesandoBanco] = useState(false);
  const [pedidoPendientePago, setPedidoPendientePago] = useState(null);

  const cargarHistorial = async () => {
    if (!usuarioSesion) return;
    setCargandoHistorial(true);
    try {
      const data = await obtenerMisPedidosAPI();
      setHistorialPedidos(Array.isArray(data) ? data : []);
    } catch {
      console.warn('No se pudo cargar el historial');
    } finally {
      setCargandoHistorial(false);
    }
  };

  useEffect(() => {
    if (tabActiva === 'historial') {
      cargarHistorial();
    }
  }, [tabActiva]);

  const zonaSeleccionada = ZONAS_OPCIONES.find(z => z.valor === zona);
  const total = carrito.reduce((acc, prod) => acc + (prod.precio * (prod.cantidad || 1)), 0);

  const handleProcesarPedido = async () => {
    if (!usuarioSesion) {
      mostrarToast('Debes iniciar sesión para confirmar tu compra', 'warning');
      return;
    }

    if (carrito.length === 0) {
      mostrarToast('Agrega al menos un cilindro al pedido', 'warning');
      return;
    }

    const nuevosErrores = {};
    if (!direccion.trim()) nuevosErrores.direccion = 'Ingresa tu dirección de entrega.';
    if (!zona) nuevosErrores.zona = 'Selecciona tu zona de despacho.';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});

    const datosPedido = {
      fecha: new Date().toISOString(),
      usuario: usuarioSesion,
      direccion: direccion.trim(),
      zona: zona,
      tiempoEstimado: zonaSeleccionada ? zonaSeleccionada.tiempo : '',
      metodoPago: metodoPago,
      productos: carrito,
      total: `$${total.toLocaleString('es-CL')}`
    };

    // Si seleccionó Banco Estado, abrimos la pasarela interactiva de simulación oficial
    if (metodoPago.includes('Banco Estado')) {
      setPedidoPendientePago(datosPedido);
      setPasoBanco(1);
      setRutBanco(usuarioSesion?.username?.includes('@') ? '18.492.114-K' : '19.234.567-8');
      setClaveBanco('');
      setBePassCode('');
      setModalBancoEstadoAbierto(true);
      return;
    }

    // Para efectivo al repartidor u otro
    ejecutarCreacionPedido(datosPedido, false);
  };

  const ejecutarCreacionPedido = async (datos, pagadoOnline) => {
    setEnviando(true);
    try {
      const respuestaAPI = await crearPedidoAPI(datos);
      setMensajePedido({
        texto: respuestaAPI.mensaje + (pagadoOnline ? ' [PAGO APROBADO VÍA BANCO ESTADO]' : ''),
        codigo: respuestaAPI.idPedido,
        zona: datos.zona,
        tiempo: datos.tiempoEstimado
      });
      mostrarToast(`¡Pedido #${respuestaAPI.idPedido} generado exitosamente!`, 'success');
      vaciarCarrito();
      setDireccion('');
      setZona('');
    } catch {
      mostrarToast('Hubo un error al registrar el pedido.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  // -------------------------------------------------------------------------
  // PASARELA BANCO ESTADO
  // -------------------------------------------------------------------------
  const handleValidarBancoPaso1 = (e) => {
    e.preventDefault();
    if (!rutBanco.trim() || !claveBanco.trim()) {
      mostrarToast('Ingresa tu RUT y Clave de Internet de Banco Estado', 'warning');
      return;
    }
    setProcesandoBanco(true);
    setTimeout(() => {
      setProcesandoBanco(false);
      setPasoBanco(2); // Pasar a verificación BE Pass / Clave Dinámica
    }, 1000);
  };

  const handleConfirmarPagoBanco = (e) => {
    e.preventDefault();
    if (!bePassCode || bePassCode.length < 4) {
      mostrarToast('Ingresa el código BE Pass de 4 o 6 dígitos', 'warning');
      return;
    }

    setProcesandoBanco(true);
    setTimeout(async () => {
      setProcesandoBanco(false);
      setPasoBanco(3); // Aprobado
      setTimeout(async () => {
        setModalBancoEstadoAbierto(false);
        if (pedidoPendientePago) {
          await ejecutarCreacionPedido(pedidoPendientePago, true);
        }
      }, 1500);
    }, 1500);
  };

  return (
    <main className="py-4 fade-in">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-cart3 fs-3" style={{ color: 'var(--gas-orange)' }}></i>
            <h1 className="h3 fw-bold mb-0 text-white">
              Gestión de Pedidos de Gas
            </h1>
          </div>

          <div className="btn-group">
            <button
              className={`btn btn-sm ${tabActiva === 'nuevo' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setTabActiva('nuevo')}
            >
              <i className="bi bi-cart-check me-1"></i> Carrito Actual ({carrito.length})
            </button>
            <button
              className={`btn btn-sm ${tabActiva === 'historial' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setTabActiva('historial')}
            >
              <i className="bi bi-clock-history me-1"></i> Mis Pedidos en Tiempo Real
            </button>
          </div>
        </div>

        {/* PESTAÑA HISTORIAL */}
        {tabActiva === 'historial' && (
          <div className="surface-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0 text-white">
                <i className="bi bi-truck text-danger me-2"></i>Historial de Pedidos
              </h2>
              <button className="btn btn-outline-secondary btn-sm" onClick={cargarHistorial} disabled={cargandoHistorial}>
                <i className={`bi bi-arrow-clockwise ${cargandoHistorial ? 'spin' : ''}`}></i> Refrescar
              </button>
            </div>

            {historialPedidos.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                Aún no tienes pedidos registrados.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th># Pedido</th>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Dirección</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialPedidos.map(p => {
                      let badge = 'bg-warning text-dark';
                      if (p.estado === 'ASIGNADO') badge = 'bg-info text-dark';
                      if (p.estado === 'EN_CAMINO') badge = 'bg-primary text-white';
                      if (p.estado === 'ENTREGADO') badge = 'bg-success text-white';
                      if (p.estado === 'CANCELADO') badge = 'bg-secondary text-white';

                      return (
                        <tr key={p.id}>
                          <td><strong>#{p.id}</strong></td>
                          <td className="text-white">{p.productoNombre || 'Cilindro GLP'}</td>
                          <td>{p.cantidad} unid.</td>
                          <td className="small text-muted">{p.direccionEntrega}</td>
                          <td className="fw-bold text-danger">
                            {typeof p.totalPagar === 'number' ? `$${p.totalPagar.toLocaleString('es-CL')}` : p.totalPagar}
                          </td>
                          <td><span className={`badge ${badge}`}>{p.estado}</span></td>
                          <td>
                            {p.pagoRegistrado ? (
                              <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Pagado</span>
                            ) : (
                              <span className="badge bg-secondary">Pendiente</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA CARRITO */}
        {tabActiva === 'nuevo' && (
          <>
            {mensajePedido && (
              <div className="alert alert-success border-0 shadow-sm mb-4">
                <strong>¡Pedido Confirmado!</strong> {mensajePedido.texto} (Código: #{mensajePedido.codigo}) |{' '}
                <strong>Zona:</strong> {mensajePedido.zona} ({mensajePedido.tiempo})
              </div>
            )}

            {!usuarioSesion && (
              <div className="alert alert-warning border-0 shadow-sm mb-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill fs-3 me-3 text-warning"></i>
                  <div>
                    <strong>Inicio de sesión requerido</strong> — Para confirmar tu pedido debes registrarte o iniciar sesión con tu cuenta.
                    <div className="mt-2">
                      <button onClick={() => navegar('registro')} className="btn btn-sm btn-danger me-2">
                        Iniciar Sesión / Registrarse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row g-4">
              <div className="col-lg-8">
                <div className="surface-card p-4 mb-4">
                  <h2 className="h5 fw-bold mb-3 text-white">Detalle del Pedido</h2>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Cilindro</th>
                          <th>Precio</th>
                          <th className="text-center">Cant.</th>
                          <th>Subtotal</th>
                          <th className="text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {carrito.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4 text-muted">
                              No has agregado cilindros a tu pedido.{' '}
                              <a href="#productos" onClick={(e) => { e.preventDefault(); navegar('productos'); }} className="fw-bold text-danger">
                                Ver catálogo
                              </a>
                            </td>
                          </tr>
                        ) : (
                          carrito.map((item) => (
                            <tr key={item.id}>
                              <td className="text-white"><strong>{item.nombre}</strong></td>
                              <td>${Number(item.precio).toLocaleString('es-CL')}</td>
                              <td className="text-center">{item.cantidad || 1}</td>
                              <td className="fw-bold text-danger">
                                ${(Number(item.precio) * (item.cantidad || 1)).toLocaleString('es-CL')}
                              </td>
                              <td className="text-center">
                                <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarProductoCarrito(item.id)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Formulario de Checkout */}
              <div className="col-lg-4">
                <div className="surface-card p-4">
                  <h2 className="h5 fw-bold mb-3 text-white">Datos de Despacho</h2>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Dirección en Chillán *</label>
                    <input
                      type="text"
                      className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                      placeholder="Calle, número, depto o villa"
                      value={direccion}
                      onChange={(e) => { setDireccion(e.target.value); if (errores.direccion) setErrores({ ...errores, direccion: null }); }}
                    />
                    {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Zona de Cobertura *</label>
                    <select
                      className={`form-select ${errores.zona ? 'is-invalid' : ''}`}
                      value={zona}
                      onChange={(e) => { setZona(e.target.value); if (errores.zona) setErrores({ ...errores, zona: null }); }}
                    >
                      <option value="" disabled>Selecciona tu zona...</option>
                      {ZONAS_OPCIONES.map((z) => (
                        <option key={z.valor} value={z.valor}>{z.label}</option>
                      ))}
                    </select>
                    {errores.zona && <div className="invalid-feedback">{errores.zona}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Pasarela de Pago *</label>
                    <select
                      className="form-select border-warning"
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    >
                      <option value="Banco Estado (PagoRUT / Transferencia)">🏦 Banco Estado (CuentaRUT / WebPay)</option>
                      <option value="Efectivo al Repartidor">💵 Efectivo al Repartidor en Domicilio</option>
                      <option value="Tarjeta Débito / Crédito">💳 Tarjeta Débito / Crédito al Chofer</option>
                    </select>
                    {metodoPago.includes('Banco Estado') && (
                      <div className="small text-warning mt-1">
                        <i className="bi bi-shield-lock-fill me-1"></i> Se abrirá la pasarela segura simulada de Banco Estado.
                      </div>
                    )}
                  </div>

                  <hr className="border-secondary" />

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-semibold text-muted">Total a pagar:</span>
                    <span className="fs-4 fw-bold text-danger">
                      ${total.toLocaleString('es-CL')}
                    </span>
                  </div>

                  <button
                    className="btn btn-danger w-100 mb-2 py-2 fw-bold"
                    onClick={handleProcesarPedido}
                    disabled={enviando || carrito.length === 0}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    {enviando ? 'Procesando...' : (metodoPago.includes('Banco Estado') ? 'Pagar con Banco Estado' : 'Confirmar Pedido')}
                  </button>
                  <button className="btn btn-outline-secondary w-100 btn-sm" onClick={vaciarCarrito}>
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* =====================================================================
          MODAL: PAGO BANCO ESTADO (TEMA OSCURO INTEGRADO Y CON CONTRASTE)
          ===================================================================== */}
      {modalBancoEstadoAbierto && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-dialog" style={{ maxWidth: '440px' }}>
            <div className="custom-modal-content border-secondary shadow-lg">
              
              {/* Header BancoEstado */}
              <div className="custom-modal-header" style={{ backgroundColor: '#002B49', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge px-2 py-1" style={{ backgroundColor: '#FF8200', color: '#002B49', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    BancoEstado
                  </span>
                  <span className="text-white fw-bold small">Pago en Línea</span>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalBancoEstadoAbierto(false)}></button>
              </div>

              <div className="custom-modal-body">
                {/* Cuadro de resumen oscuro con texto blanco nítido */}
                <div className="p-3 mb-3 rounded" style={{ backgroundColor: '#131924', border: '1px solid #2e3a50' }}>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                    <span className="text-muted">Comercio:</span>
                    <strong className="text-white">Gas El Volcán Chillán</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>Total a pagar:</span>
                    <span className="fw-bold fs-5 text-warning">${total.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>

                {/* PASO 1: LOGIN BANCO ESTADO */}
                {pasoBanco === 1 && (
                  <form onSubmit={handleValidarBancoPaso1}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-white mb-1">RUT del Titular</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: 19234567-8"
                        value={rutBanco}
                        onChange={(e) => setRutBanco(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-white mb-1">Clave de Internet (4 dígitos)</label>
                      <input
                        type="password"
                        maxLength="4"
                        className="form-control"
                        placeholder="••••"
                        value={claveBanco}
                        onChange={(e) => setClaveBanco(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label small fw-semibold text-white mb-1">Tipo de Cuenta</label>
                      <select
                        className="form-select"
                        value={tipoCuentaBanco}
                        onChange={(e) => setTipoCuentaBanco(e.target.value)}
                      >
                        <option value="CuentaRUT">CuentaRUT</option>
                        <option value="Cuenta Corriente">Cuenta Corriente</option>
                        <option value="Chequera Electrónica">Chequera Electrónica</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 fw-bold py-2 text-white"
                      style={{ backgroundColor: '#FF8200' }}
                      disabled={procesandoBanco}
                    >
                      {procesandoBanco ? 'Verificando datos...' : 'Continuar'}
                    </button>
                  </form>
                )}

                {/* PASO 2: BE PASS */}
                {pasoBanco === 2 && (
                  <form onSubmit={handleConfirmarPagoBanco}>
                    <div className="text-center mb-3">
                      <h6 className="fw-bold text-white mb-1">Confirmar con BE Pass</h6>
                      <p className="text-muted small mb-0">
                        Ingresa el código dinámico de tu app BancoEstado
                      </p>
                    </div>

                    <div className="mb-4 text-center">
                      <input
                        type="password"
                        maxLength="6"
                        className="form-control text-center fs-3 fw-bold mx-auto"
                        style={{ maxWidth: '200px', borderColor: '#FF8200', letterSpacing: '4px' }}
                        placeholder="123456"
                        value={bePassCode}
                        onChange={(e) => setBePassCode(e.target.value)}
                        autoFocus
                        required
                      />
                      <span className="text-muted small mt-2 d-block" style={{ fontSize: '0.75rem' }}>Prueba: 123456</span>
                    </div>

                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-secondary w-50" onClick={() => setPasoBanco(1)}>
                        Atrás
                      </button>
                      <button
                        type="submit"
                        className="btn w-50 fw-bold text-white"
                        style={{ backgroundColor: '#FF8200' }}
                        disabled={procesandoBanco}
                      >
                        {procesandoBanco ? 'Procesando...' : 'Pagar'}
                      </button>
                    </div>
                  </form>
                )}

                {/* PASO 3: ÉXITO */}
                {pasoBanco === 3 && (
                  <div className="text-center py-4">
                    <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
                    <h5 className="fw-bold text-success mb-1">¡Pago Aprobado!</h5>
                    <p className="small text-muted mb-2">Comprobante #{Math.floor(Math.random() * 900000) + 100000}</p>
                    <span className="text-white small">Registrando pedido...</span>
                  </div>
                )}
              </div>

              <div className="custom-modal-footer justify-content-center text-muted small py-2" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-shield-lock me-1 text-warning"></i> Transacción segura BancoEstado
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
