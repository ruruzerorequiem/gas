import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { crearPedidoAPI } from '../api';

const ZONAS_OPCIONES = [
  { valor: 'Zona Centro', label: 'Zona Centro - Chillán (Centro, Norte, Sur)', tiempo: '1 – 3 horas', dias: 'Lunes a Sábado (08:00 – 20:00)' },
  { valor: 'Zona Oriente', label: 'Zona Oriente - Chillán Oriente / Chillán Viejo', tiempo: '2 – 4 horas', dias: 'Lunes a Viernes (08:00 – 18:00)' },
  { valor: 'Zona Rural', label: 'Zona Rural - El Carmen, Pinto, San Ignacio', tiempo: '3 – 6 horas', dias: 'Martes y Jueves (08:00 – 16:00)' },
  { valor: 'Zona Sur', label: 'Zona Sur - Bulnes, Quillón', tiempo: '4 – 6 horas', dias: 'Miércoles (08:00 – 16:00)' },
  { valor: 'Zona Comercial', label: 'Zona Comercial - Parques Industriales / Locales', tiempo: 'Según agenda', dias: 'Lunes a Viernes (07:00 – 17:00)' }
];

export default function Carrito() {
  const { carrito, eliminarProductoCarrito, vaciarCarrito, usuarioSesion, navegar } = useApp();

  const [direccion, setDireccion] = useState('');
  const [zona, setZona] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo al Repartidor');
  const [errores, setErrores] = useState({});
  const [mensajePedido, setMensajePedido] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const zonaSeleccionada = ZONAS_OPCIONES.find(z => z.valor === zona);

  const total = carrito.reduce((acc, prod) => acc + (prod.precio * (prod.cantidad || 1)), 0);

  const handleProcesarPedido = async () => {
    // 1. Verificar autenticación
    if (!usuarioSesion) {
      alert('Debes iniciar sesión o registrarte antes de poder confirmar y realizar una compra.');
      return;
    }

    if (carrito.length === 0) {
      alert('Debe agregar al menos un cilindro de gas.');
      return;
    }

    const nuevosErrores = {};
    if (!direccion.trim()) {
      nuevosErrores.direccion = 'Ingresa tu dirección de entrega.';
    }
    if (!zona) {
      nuevosErrores.zona = 'Selecciona tu zona de despacho.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    setEnviando(true);

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

    try {
      const respuestaAPI = await crearPedidoAPI(datosPedido);
      setMensajePedido({
        texto: respuestaAPI.mensaje,
        codigo: respuestaAPI.idPedido,
        zona: zona,
        tiempo: zonaSeleccionada ? zonaSeleccionada.tiempo : ''
      });
      vaciarCarrito();
      setDireccion('');
      setZona('');
    } catch {
      alert('Hubo un error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="py-4">
      <div className="container">
        <h1 className="display-6 fw-bold mb-4">Solicitud de Pedido de Gas</h1>

        {mensajePedido && (
          <div className="alert alert-success mb-4" role="alert">
            <strong>¡Pedido Confirmado!</strong> {mensajePedido.texto} (Código: #{mensajePedido.codigo}) |{' '}
            <strong>Zona:</strong> {mensajePedido.zona} ({mensajePedido.tiempo})
          </div>
        )}

        {/* ALERTA SI EL USUARIO NO HA INICIADO SESIÓN */}
        {!usuarioSesion && (
          <div className="alert alert-warning border-warning mb-4 shadow-sm" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill text-warning fs-3 me-3"></i>
              <div>
                <strong>¡Inicio de sesión requerido!</strong> No puedes confirmar compras sin antes registrarte o iniciar sesión.
                <div className="mt-2">
                  <button
                    onClick={() => navegar('registro')}
                    className="btn btn-sm btn-danger fw-bold me-2 border-0"
                  >
                    Ir a Iniciar Sesión / Registrarse
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* Tabla de ítems */}
          <div className="col-lg-8">
            <div className="card border rounded-3 p-3 mb-4">
              <h2 className="h5 fw-bold mb-3">Detalle del Pedido</h2>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Cilindro / Producto</th>
                      <th>Precio</th>
                      <th className="text-center">Cant.</th>
                      <th>Subtotal</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody id="filasCarrito">
                    {carrito.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No has agregado cilindros a tu pedido.{' '}
                          <a
                            href="#productos"
                            onClick={(e) => { e.preventDefault(); navegar('productos'); }}
                            className="fw-bold text-danger"
                          >
                            Ver catálogo
                          </a>
                        </td>
                      </tr>
                    ) : (
                      carrito.map((prod, index) => {
                        const subtotal = prod.precio * prod.cantidad;
                        return (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={prod.imagen}
                                  alt={prod.nombre}
                                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                />
                                <span className="fw-bold">{prod.nombre}</span>
                              </div>
                            </td>
                            <td>${prod.precio.toLocaleString('es-CL')}</td>
                            <td className="text-center">{prod.cantidad}</td>
                            <td className="fw-bold text-danger">${subtotal.toLocaleString('es-CL')}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => eliminarProductoCarrito(index)}
                              >
                                Quitar
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Formulario Datos del Despacho */}
          <div className="col-lg-4">
            <div className="card border rounded-3 p-4">
              <h2 className="h5 fw-bold mb-3">Datos del Despacho</h2>

              <div className="mb-3">
                <label htmlFor="direccionEntrega" className="form-label fw-semibold">
                  Dirección en Chillán / Comuna *
                </label>
                <input
                  type="text"
                  id="direccionEntrega"
                  className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                  placeholder="Calle, número, depto o villa"
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value);
                    if (errores.direccion) setErrores({ ...errores, direccion: null });
                  }}
                />
                {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
              </div>

              {/* SELECCIÓN DE ZONA DE DESPACHO */}
              <div className="mb-3">
                <label htmlFor="zonaEntrega" className="form-label fw-semibold">
                  Zona de Cobertura / Despacho *
                </label>
                <select
                  id="zonaEntrega"
                  className={`form-select ${errores.zona ? 'is-invalid' : ''}`}
                  value={zona}
                  onChange={(e) => {
                    setZona(e.target.value);
                    if (errores.zona) setErrores({ ...errores, zona: null });
                  }}
                >
                  <option value="" disabled>Selecciona tu zona o comuna...</option>
                  {ZONAS_OPCIONES.map((z) => (
                    <option key={z.valor} value={z.valor}>
                      {z.label}
                    </option>
                  ))}
                </select>
                {errores.zona && <div className="invalid-feedback">{errores.zona}</div>}
              </div>

              {/* INFORMACIÓN DE TIEMPO ESTIMADO */}
              {zonaSeleccionada && (
                <div id="infoZonaBox" className="p-2 border rounded bg-light small mb-3">
                  <div>
                    <strong>Tiempo estimado:</strong> <span>{zonaSeleccionada.tiempo}</span>
                  </div>
                  <div className="text-muted">{zonaSeleccionada.dias}</div>
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="metodoPago" className="form-label fw-semibold">
                  Método de Pago *
                </label>
                <select
                  id="metodoPago"
                  className="form-select"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="Efectivo al Repartidor">Efectivo al Repartidor</option>
                  <option value="Tarjeta Débito / Crédito">Tarjeta Débito / Crédito</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                </select>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold">Total a pagar:</span>
                <span className="fs-4 fw-bold text-danger" id="totalPagar">
                  ${total.toLocaleString('es-CL')}
                </span>
              </div>

              <button
                className="btn btn-danger w-100 fw-bold mb-2 py-2"
                onClick={handleProcesarPedido}
                disabled={enviando}
              >
                {enviando ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
              <button
                className="btn btn-outline-secondary w-100 btn-sm"
                onClick={vaciarCarrito}
              >
                Vaciar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
