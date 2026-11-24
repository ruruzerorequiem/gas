import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  obtenerTodosPedidosAPI,
  actualizarEstadoPedidoAPI,
  obtenerProductosAPI,
  crearProductoAPI,
  actualizarProductoAPI,
  eliminarProductoAPI
} from '../api';

export default function AdminPanel() {
  const { usuarioSesion, navegar, mostrarToast } = useApp();

  const [tabActiva, setTabActiva] = useState('pedidos'); // 'pedidos' | 'productos'
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Formulario para nuevo producto
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoPeso, setNuevoPeso] = useState('11');
  const [nuevoStock, setNuevoStock] = useState('50');

  const rol = usuarioSesion?.rol;
  const esAdmin = rol === 'ROLE_ADMIN';
  const esOperadora = rol === 'ROLE_OPERADORA';
  const tieneAcceso = esAdmin || esOperadora;

  // Cargar pedidos y productos
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [listaPedidos, listaProductos] = await Promise.all([
        obtenerTodosPedidosAPI(),
        obtenerProductosAPI()
      ]);
      setPedidos(Array.isArray(listaPedidos) ? listaPedidos : []);
      setProductos(Array.isArray(listaProductos) ? listaProductos : []);
    } catch {
      mostrarToast('Error al conectar con los microservicios', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (tieneAcceso) {
      cargarDatos();
    }
  }, [tieneAcceso]);

  // Cambiar estado de un pedido (Ej: EN_CAMINO, ENTREGADO)
  const handleCambiarEstado = async (idPedido, nuevoEstado) => {
    try {
      await actualizarEstadoPedidoAPI(idPedido, nuevoEstado);
      mostrarToast(`Pedido #${idPedido} actualizado a: ${nuevoEstado}`, 'success');
      cargarDatos();
    } catch (err) {
      mostrarToast('No se pudo cambiar el estado del pedido: ' + err.message, 'error');
    }
  };

  // Crear producto nuevo (CRUD - Solo Admin)
  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoPrecio) {
      mostrarToast('Nombre y precio son obligatorios', 'warning');
      return;
    }

    try {
      await crearProductoAPI({
        nombre: nuevoNombre,
        descripcion: nuevaDesc,
        precio: Number(nuevoPrecio),
        pesoKg: Number(nuevoPeso),
        stock: Number(nuevoStock),
        imagen: '/img/cilindros.png'
      });
      mostrarToast('¡Producto agregado al catálogo exitosamente!', 'success');
      setNuevoNombre('');
      setNuevaDesc('');
      setNuevoPrecio('');
      cargarDatos();
    } catch (err) {
      mostrarToast('Error al crear producto: ' + err.message, 'error');
    }
  };

  // Desactivar / Eliminar producto (CRUD - Solo Admin)
  const handleEliminarProducto = async (id) => {
    if (!window.confirm('¿Seguro que deseas desactivar este producto del catálogo?')) return;
    try {
      await eliminarProductoAPI(id);
      mostrarToast('Producto desactivado correctamente', 'info');
      cargarDatos();
    } catch (err) {
      mostrarToast('Error al eliminar producto: ' + err.message, 'error');
    }
  };

  // Rápida edición de stock (CRUD)
  const handleModificarStock = async (prod) => {
    const nuevo = prompt(`Ingresa el nuevo stock para "${prod.nombre}":`, prod.stock || prod.stockActual);
    if (nuevo === null || isNaN(nuevo)) return;
    try {
      await actualizarProductoAPI(prod.id, {
        ...prod,
        stock: Number(nuevo)
      });
      mostrarToast('Stock actualizado correctamente', 'success');
      cargarDatos();
    } catch (err) {
      mostrarToast('Error al actualizar stock: ' + err.message, 'error');
    }
  };

  // ------------------------------------------------------------------------
  // RESTRICCIÓN DE ACCESO POR ROLES (Requisito Evaluación 3 - IE3.3.3 / IE3.3.6)
  // ------------------------------------------------------------------------
  if (!tieneAcceso) {
    return (
      <main className="py-5 fade-in">
        <div className="container" style={{ maxWidth: '650px' }}>
          <div className="surface-card p-4 text-center border-danger shadow-sm">
            <div className="text-danger mb-3">
              <i className="bi bi-shield-lock-fill" style={{ fontSize: '3.5rem' }}></i>
            </div>
            <h1 className="h4 fw-bold text-danger mb-2">Acceso Restringido</h1>
            <p className="text-muted mb-3">
              Esta sección está reservada exclusivamente para el personal de <strong>Operaciones</strong> y <strong>Administración</strong> de Gas El Volcán.
            </p>

            <div className="alert alert-warning text-start py-2 px-3 small mb-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              Tu usuario actual tiene el rol: <strong>{rol || 'No autenticado (Invitado)'}</strong>.
            </div>

            <p className="small text-muted mb-4">
              Para ingresar a este panel con fines evaluativos, inicia sesión con las cuentas del personal:
              <br />
              <strong>Admin:</strong> admin@gaselvolcan.cl (Clave: admin123)
              <br />
              <strong>Operadora:</strong> operadora@gaselvolcan.cl (Clave: opera123)
            </p>

            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-danger" onClick={() => navegar('registro')}>
                <i className="bi bi-person-badge me-1"></i> Iniciar Sesión con Rol Autorizado
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navegar('inicio')}>
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-4 fade-in">
      <div className="container">
        {/* Cabecera del Panel */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2 border-bottom pb-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-sliders2 fs-3 text-danger"></i>
              <h1 className="h3 fw-bold mb-0" style={{ color: 'var(--gas-blue-dark)' }}>
                Panel de Operaciones y Control
              </h1>
            </div>
            <p className="text-muted small mb-0 mt-1">
              Usuario en sesión: <strong>{usuarioSesion?.nombre || usuarioSesion?.username}</strong> |
              Rol: <span className="badge bg-danger ms-1">{rol}</span>
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              className={`btn ${tabActiva === 'pedidos' ? 'btn-danger' : 'btn-outline-secondary'} fw-semibold btn-sm`}
              onClick={() => setTabActiva('pedidos')}
            >
              <i className="bi bi-truck me-1"></i> Pedidos Recibidos ({pedidos.length})
            </button>
            <button
              className={`btn ${tabActiva === 'productos' ? 'btn-danger' : 'btn-outline-secondary'} fw-semibold btn-sm`}
              onClick={() => setTabActiva('productos')}
            >
              <i className="bi bi-box-seam me-1"></i> Catálogo y Stock ({productos.length})
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={cargarDatos} disabled={cargando}>
              <i className={`bi bi-arrow-clockwise ${cargando ? 'spin' : ''}`}></i> Refrescar
            </button>
          </div>
        </div>

        {/* ==================================================================
            PESTAÑA 1: GESTIÓN DE PEDIDOS (Operadora y Admin)
            ================================================================== */}
        {tabActiva === 'pedidos' && (
          <div className="surface-card p-4">
            <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--gas-blue-dark)' }}>
              <i className="bi bi-card-checklist me-2 text-danger"></i>
              Despacho de Cilindros en Chillán
            </h2>

            {pedidos.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                No hay pedidos registrados en el microservicio en este momento.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th># Pedido</th>
                      <th>Cliente</th>
                      <th>Dirección</th>
                      <th>Cilindro</th>
                      <th>Cant.</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acción Operadora / Chofer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map(p => {
                      let badgeColor = 'bg-warning text-dark';
                      if (p.estado === 'ASIGNADO') badgeColor = 'bg-info text-dark';
                      if (p.estado === 'EN_CAMINO') badgeColor = 'bg-primary text-white';
                      if (p.estado === 'ENTREGADO') badgeColor = 'bg-success text-white';
                      if (p.estado === 'CANCELADO') badgeColor = 'bg-secondary text-white';

                      return (
                        <tr key={p.id}>
                          <td><strong>#{p.id}</strong></td>
                          <td>{p.clienteNombre || p.clienteUsername}</td>
                          <td className="small">{p.direccionEntrega}</td>
                          <td><strong>{p.productoNombre}</strong></td>
                          <td>{p.cantidad}</td>
                          <td className="text-danger fw-bold">
                            {typeof p.totalPagar === 'number'
                              ? `$${p.totalPagar.toLocaleString('es-CL')}`
                              : p.totalPagar}
                          </td>
                          <td>
                            <span className={`badge ${badgeColor}`}>{p.estado}</span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              {p.estado === 'PENDIENTE' && (
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleCambiarEstado(p.id, 'EN_CAMINO')}
                                >
                                  <i className="bi bi-truck me-1"></i> Despachar
                                </button>
                              )}
                              {p.estado === 'EN_CAMINO' && (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleCambiarEstado(p.id, 'ENTREGADO')}
                                >
                                  <i className="bi bi-check-circle me-1"></i> Entregar
                                </button>
                              )}
                              {p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO' && (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleCambiarEstado(p.id, 'CANCELADO')}
                                >
                                  Cancelar
                                </button>
                              )}
                              {p.estado === 'ENTREGADO' && (
                                <span className="text-success small fw-semibold">
                                  <i className="bi bi-check-all"></i> Pagado y Descontado
                                </span>
                              )}
                            </div>
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

        {/* ==================================================================
            PESTAÑA 2: CRUD DE PRODUCTOS (Solo Administrador)
            ================================================================== */}
        {tabActiva === 'productos' && (
          <div className="row g-4">
            {/* Formulario Crear Producto */}
            {esAdmin ? (
              <div className="col-lg-4">
                <div className="surface-card p-4">
                  <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--gas-blue-dark)' }}>
                    <i className="bi bi-plus-circle me-2 text-danger"></i>
                    Agregar Cilindro / Producto
                  </h2>
                  <form onSubmit={handleCrearProducto}>
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">Nombre del Producto *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Ej: Cilindro GLP 15 kg Plus"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">Descripción</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Uso residencial o comercial..."
                        value={nuevaDesc}
                        onChange={(e) => setNuevaDesc(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Precio ($ CLP) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="16000"
                          value={nuevoPrecio}
                          onChange={(e) => setNuevoPrecio(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Peso (kg)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={nuevoPeso}
                          onChange={(e) => setNuevoPeso(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Stock Inicial</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={nuevoStock}
                        onChange={(e) => setNuevoStock(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-danger btn-sm w-100 fw-bold py-2">
                      <i className="bi bi-save me-1"></i> Guardar en Base de Datos
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="col-lg-4">
                <div className="alert alert-info small">
                  <i className="bi bi-info-circle me-1"></i>
                  Tu rol de <strong>Operadora</strong> te permite visualizar el catálogo. La creación y eliminación de cilindros está reservada para el rol de <strong>Administrador</strong>.
                </div>
              </div>
            )}

            {/* Tabla de Productos Existentes */}
            <div className={esAdmin ? 'col-lg-8' : 'col-lg-12'}>
              <div className="surface-card p-4">
                <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--gas-blue-dark)' }}>
                  Catálogo Actual en Microservicio (Puerto 8082)
                </h2>
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        {esAdmin && <th className="text-end">Acciones CRUD</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map(p => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.nombre}</strong>
                            <div className="text-muted small">{p.descripcion}</div>
                          </td>
                          <td className="fw-bold text-danger">
                            ${Number(p.precio).toLocaleString('es-CL')}
                          </td>
                          <td>
                            <span className={`badge ${p.stock < 20 ? 'bg-warning text-dark' : 'bg-success'}`}>
                              {p.stock || p.stockActual || 0} unid.
                            </span>
                          </td>
                          {esAdmin && (
                            <td className="text-end">
                              <button
                                className="btn btn-outline-secondary btn-sm me-1"
                                onClick={() => handleModificarStock(p)}
                                title="Editar stock"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleEliminarProducto(p.id)}
                                title="Desactivar producto"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
