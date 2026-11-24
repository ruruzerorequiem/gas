import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  obtenerTodosPedidosAPI,
  actualizarEstadoPedidoAPI,
  actualizarPedidoCompletoAPI,
  cancelarPedidoAPI,
  crearPedidoAPI,
  obtenerProductosAPI,
  crearProductoAPI,
  actualizarProductoAPI,
  eliminarProductoAPI,
  obtenerUsuariosAPI,
  crearUsuarioAdminAPI,
  actualizarUsuarioAPI,
  desactivarUsuarioAPI
} from '../api';

export default function AdminPanel() {
  const { usuarioSesion, navegar, mostrarToast } = useApp();

  const [tabActiva, setTabActiva] = useState('usuarios'); // 'usuarios' | 'pedidos' | 'productos'
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Filtros y búsquedas
  const [busqueda, setBusqueda] = useState('');

  // -------------------------------------------------------------------------
  // ESTADOS PARA MODALES PERSONALIZADOS (Sin alerts ni prompts por defecto)
  // -------------------------------------------------------------------------
  // Modal Producto (Crear o Editar)
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null); // null = nuevo
  const [formProd, setFormProd] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    pesoKg: '11',
    stock: '50',
    imagen: '/img/cilindros.png',
    activo: true
  });

  // Modal Usuario (Crear o Editar)
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null); // null = nuevo
  const [formUser, setFormUser] = useState({
    nombreCompleto: '',
    username: '',
    password: '',
    rol: 'ROLE_CLIENTE',
    activo: true
  });

  // Modal Pedido (Crear o Editar)
  const [modalPedidoAbierto, setModalPedidoAbierto] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [formPed, setFormPed] = useState({
    clienteNombre: '',
    direccionEntrega: '',
    productoId: '',
    cantidad: 1,
    repartidorUsername: '',
    estado: 'PENDIENTE',
    pagoRegistrado: false
  });

  // Modal de Confirmación Genérico (eliminar o cambiar estado)
  const [modalConfirmAbierto, setModalConfirmAbierto] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    titulo: '',
    mensaje: '',
    colorBoton: 'btn-danger',
    textoBoton: 'Confirmar',
    accion: () => {}
  });

  const rol = usuarioSesion?.rol;
  const esAdmin = rol === 'ROLE_ADMIN';
  const esOperadora = rol === 'ROLE_OPERADORA';
  const tieneAcceso = esAdmin || esOperadora;

  // Cargar datos
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const promesas = [obtenerTodosPedidosAPI(), obtenerProductosAPI()];
      if (esAdmin) promesas.push(obtenerUsuariosAPI());
      const res = await Promise.all(promesas);
      setPedidos(Array.isArray(res[0]) ? res[0] : []);
      setProductos(Array.isArray(res[1]) ? res[1] : []);
      if (esAdmin && res[2]) setUsuarios(Array.isArray(res[2]) ? res[2] : []);
    } catch {
      mostrarToast('Error al conectar con los microservicios', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (tieneAcceso) {
      cargarDatos();
      if (!esAdmin && tabActiva === 'usuarios') {
        setTabActiva('pedidos');
      }
    }
  }, [tieneAcceso, esAdmin]);

  // =========================================================================
  // GESTIÓN PRODUCTOS
  // =========================================================================
  const abrirModalProducto = (prod = null) => {
    if (prod) {
      setProductoEditando(prod);
      setFormProd({
        nombre: prod.nombre || '',
        descripcion: prod.descripcion || '',
        precio: prod.precio || '',
        pesoKg: prod.pesoKg || '11',
        stock: prod.stock || prod.stockActual || 0,
        imagen: prod.imagen || prod.imagenUrl || '/img/cilindros.png',
        activo: prod.activo !== false
      });
    } else {
      setProductoEditando(null);
      setFormProd({
        nombre: '',
        descripcion: '',
        precio: '',
        pesoKg: '11',
        stock: '50',
        imagen: '/img/cilindros.png',
        activo: true
      });
    }
    setModalProductoAbierto(true);
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!formProd.nombre.trim() || !formProd.precio) {
      mostrarToast('Nombre y precio son requeridos', 'warning');
      return;
    }

    try {
      if (productoEditando) {
        await actualizarProductoAPI(productoEditando.id, {
          id: productoEditando.id,
          nombre: formProd.nombre.trim(),
          descripcion: formProd.descripcion.trim(),
          precio: Number(formProd.precio),
          pesoKg: Number(formProd.pesoKg),
          stock: Number(formProd.stock),
          stockActual: Number(formProd.stock),
          imagenUrl: formProd.imagen,
          activo: formProd.activo
        });
        mostrarToast('¡Producto actualizado con éxito!', 'success');
      } else {
        await crearProductoAPI({
          nombre: formProd.nombre.trim(),
          descripcion: formProd.descripcion.trim(),
          precio: Number(formProd.precio),
          pesoKg: Number(formProd.pesoKg),
          stock: Number(formProd.stock),
          imagenUrl: formProd.imagen,
          activo: true
        });
        mostrarToast('¡Nuevo producto guardado en el catálogo!', 'success');
      }
      setModalProductoAbierto(false);
      cargarDatos();
    } catch (err) {
      mostrarToast('Error al guardar producto: ' + err.message, 'error');
    }
  };

  const confirmarEliminarProducto = (prod) => {
    setConfirmConfig({
      titulo: 'Desactivar Producto',
      mensaje: `¿Estás seguro de que deseas desactivar "${prod.nombre}" del catálogo comercial?`,
      colorBoton: 'btn-danger',
      textoBoton: 'Desactivar',
      accion: async () => {
        try {
          await eliminarProductoAPI(prod.id);
          mostrarToast(`Producto "${prod.nombre}" desactivado`, 'info');
          setModalConfirmAbierto(false);
          cargarDatos();
        } catch (err) {
          mostrarToast('Error al eliminar: ' + err.message, 'error');
        }
      }
    });
    setModalConfirmAbierto(true);
  };

  // =========================================================================
  // GESTIÓN USUARIOS
  // =========================================================================
  const abrirModalUsuario = (u = null) => {
    if (u) {
      setUsuarioEditando(u);
      setFormUser({
        nombreCompleto: u.nombreCompleto || '',
        username: u.username || '',
        password: '',
        rol: u.rol || 'ROLE_CLIENTE',
        activo: u.activo !== false
      });
    } else {
      setUsuarioEditando(null);
      setFormUser({
        nombreCompleto: '',
        username: '',
        password: '',
        rol: 'ROLE_CLIENTE',
        activo: true
      });
    }
    setModalUsuarioAbierto(true);
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    if (!formUser.nombreCompleto.trim() || !formUser.username.trim()) {
      mostrarToast('Nombre y Username son requeridos', 'warning');
      return;
    }

    try {
      if (usuarioEditando) {
        await actualizarUsuarioAPI(usuarioEditando.id, {
          nombreCompleto: formUser.nombreCompleto.trim(),
          rol: formUser.rol,
          activo: formUser.activo,
          password: formUser.password ? formUser.password.trim() : null
        });
        mostrarToast('¡Usuario modificado con éxito en MySQL!', 'success');
      } else {
        if (!formUser.password) {
          mostrarToast('La contraseña inicial es requerida', 'warning');
          return;
        }
        await crearUsuarioAdminAPI({
          nombreCompleto: formUser.nombreCompleto.trim(),
          username: formUser.username.trim(),
          password: formUser.password.trim(),
          rol: formUser.rol,
          activo: true
        });
        mostrarToast('¡Usuario registrado exitosamente en MySQL!', 'success');
      }
      setModalUsuarioAbierto(false);
      cargarDatos();
    } catch (err) {
      mostrarToast('Error: ' + err.message, 'error');
    }
  };

  const confirmarToggleUsuario = (u) => {
    const accion = u.activo ? 'desactivar' : 'reactivar';
    setConfirmConfig({
      titulo: `${u.activo ? 'Desactivar' : 'Activar'} Usuario`,
      mensaje: `¿Confirmas que deseas ${accion} la cuenta de acceso de ${u.nombreCompleto} (${u.username})?`,
      colorBoton: u.activo ? 'btn-danger' : 'btn-success',
      textoBoton: u.activo ? 'Desactivar' : 'Activar',
      accion: async () => {
        try {
          await actualizarUsuarioAPI(u.id, {
            nombreCompleto: u.nombreCompleto,
            rol: u.rol,
            activo: !u.activo
          });
          mostrarToast(`Cuenta de ${u.username} actualizada`, 'info');
          setModalConfirmAbierto(false);
          cargarDatos();
        } catch (err) {
          mostrarToast('Error: ' + err.message, 'error');
        }
      }
    });
    setModalConfirmAbierto(true);
  };

  // =========================================================================
  // GESTIÓN PEDIDOS
  // =========================================================================
  const abrirModalPedido = (ped = null) => {
    if (ped) {
      setPedidoEditando(ped);
      setFormPed({
        clienteNombre: ped.clienteNombre || ped.clienteUsername || '',
        direccionEntrega: ped.direccionEntrega || '',
        productoId: ped.productoId || (productos[0]?.id || ''),
        cantidad: ped.cantidad || 1,
        repartidorUsername: ped.repartidorUsername || '',
        estado: ped.estado || 'PENDIENTE',
        pagoRegistrado: ped.pagoRegistrado === true
      });
    } else {
      setPedidoEditando(null);
      setFormPed({
        clienteNombre: 'Cliente Mostrador / Venta Telefónica',
        direccionEntrega: 'Chillán Centro',
        productoId: productos[0]?.id || 1,
        cantidad: 1,
        repartidorUsername: 'repartidor1',
        estado: 'PENDIENTE',
        pagoRegistrado: false
      });
    }
    setModalPedidoAbierto(true);
  };

  const handleGuardarPedido = async (e) => {
    e.preventDefault();
    try {
      if (pedidoEditando) {
        await actualizarPedidoCompletoAPI(pedidoEditando.id, {
          clienteNombre: formPed.clienteNombre,
          direccionEntrega: formPed.direccionEntrega,
          cantidad: Number(formPed.cantidad),
          repartidorUsername: formPed.repartidorUsername,
          estado: formPed.estado,
          pagoRegistrado: formPed.pagoRegistrado
        });
        mostrarToast(`¡Pedido #${pedidoEditando.id} actualizado!`, 'success');
      } else {
        const prod = productos.find(p => p.id === Number(formPed.productoId)) || productos[0];
        await crearPedidoAPI({
          usuario: { email: usuarioSesion.username, nombre: formPed.clienteNombre },
          direccion: formPed.direccionEntrega,
          zona: 'Zona Centro',
          productos: [{ id: prod?.id, nombre: prod?.nombre, precio: prod?.precio, cantidad: Number(formPed.cantidad) }],
          total: (prod?.precio || 12000) * Number(formPed.cantidad)
        });
        mostrarToast('¡Nuevo pedido creado exitosamente!', 'success');
      }
      setModalPedidoAbierto(false);
      cargarDatos();
    } catch (err) {
      mostrarToast('Error en pedido: ' + err.message, 'error');
    }
  };

  const confirmarCancelarPedido = (p) => {
    setConfirmConfig({
      titulo: 'Cancelar Pedido #' + p.id,
      mensaje: `¿Deseas marcar como CANCELADO el pedido de ${p.clienteNombre || p.clienteUsername}?`,
      colorBoton: 'btn-danger',
      textoBoton: 'Cancelar Pedido',
      accion: async () => {
        try {
          await cancelarPedidoAPI(p.id);
          mostrarToast(`Pedido #${p.id} cancelado`, 'info');
          setModalConfirmAbierto(false);
          cargarDatos();
        } catch (err) {
          mostrarToast('Error al cancelar: ' + err.message, 'error');
        }
      }
    });
    setModalConfirmAbierto(true);
  };

  // ------------------------------------------------------------------------
  // RESTRICCIÓN DE SEGURIDAD
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
              Se requiere rol de <strong>Operaciones</strong> o <strong>Administrador</strong> para ingresar.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-danger" onClick={() => navegar('registro')}>
                Iniciar Sesión
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navegar('inicio')}>
                Inicio
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-4 fade-in">
      <div className="container-fluid px-lg-5">
        {/* Cabecera Principal */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 border-bottom pb-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-speedometer2 fs-2 text-danger"></i>
              <div>
                <h1 className="h3 fw-bold mb-0 text-white">Dashboard Integral de Control</h1>
                <p className="text-muted small mb-0">Gas El Volcán Chillán | Microservicios Spring Boot & MySQL</p>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            {esAdmin && (
              <button
                className={`btn ${tabActiva === 'usuarios' ? 'btn-danger' : 'btn-outline-secondary'} fw-semibold`}
                onClick={() => setTabActiva('usuarios')}
              >
                <i className="bi bi-people-fill me-1"></i> Usuarios ({usuarios.length})
              </button>
            )}
            <button
              className={`btn ${tabActiva === 'pedidos' ? 'btn-danger' : 'btn-outline-secondary'} fw-semibold`}
              onClick={() => setTabActiva('pedidos')}
            >
              <i className="bi bi-truck me-1"></i> Pedidos ({pedidos.length})
            </button>
            <button
              className={`btn ${tabActiva === 'productos' ? 'btn-danger' : 'btn-outline-secondary'} fw-semibold`}
              onClick={() => setTabActiva('productos')}
            >
              <i className="bi bi-box-seam me-1"></i> Catálogo y Cilindros ({productos.length})
            </button>
            <button className="btn btn-outline-primary" onClick={cargarDatos} disabled={cargando} title="Recargar datos">
              <i className={`bi bi-arrow-clockwise ${cargando ? 'spin' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* =================================================================
            TAB 1: CONTROL TOTAL DE USUARIOS
            ================================================================= */}
        {tabActiva === 'usuarios' && esAdmin && (
          <div className="surface-card p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
              <div>
                <h2 className="h4 fw-bold mb-1 text-white">
                  <i className="bi bi-people-fill text-danger me-2"></i>Gestión de Cuentas y Accesos
                </h2>
                <span className="text-muted small">Cuentas almacenadas en MySQL (<code>gas_usuarios_db</code>)</span>
              </div>
              <button className="btn btn-danger fw-bold" onClick={() => abrirModalUsuario(null)}>
                <i className="bi bi-person-plus-fill me-1"></i> Crear Usuario
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Nombre Completo</th>
                    <th>Username / Correo</th>
                    <th>Rol en Sistema</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => {
                    let rolBadge = 'bg-secondary';
                    if (u.rol === 'ROLE_ADMIN') rolBadge = 'bg-danger';
                    if (u.rol === 'ROLE_OPERADORA') rolBadge = 'bg-primary';
                    if (u.rol === 'ROLE_REPARTIDOR') rolBadge = 'bg-warning text-dark';
                    if (u.rol === 'ROLE_CLIENTE') rolBadge = 'bg-success';

                    return (
                      <tr key={u.id}>
                        <td><strong>#{u.id}</strong></td>
                        <td className="fw-semibold text-white">{u.nombreCompleto}</td>
                        <td><code>{u.username}</code></td>
                        <td><span className={`badge ${rolBadge}`}>{u.rol}</span></td>
                        <td>
                          <span className={`badge ${u.activo ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                            {u.activo ? 'Activo' : 'Suspendido'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-outline-info btn-sm me-2"
                            onClick={() => abrirModalUsuario(u)}
                            title="Editar usuario"
                          >
                            <i className="bi bi-pencil-square me-1"></i> Modificar
                          </button>
                          <button
                            className={`btn btn-sm ${u.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => confirmarToggleUsuario(u)}
                            title={u.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                          >
                            <i className={`bi ${u.activo ? 'bi-person-dash' : 'bi-person-check'} me-1`}></i>
                            {u.activo ? 'Suspender' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 2: CONTROL TOTAL DE PEDIDOS
            ================================================================= */}
        {tabActiva === 'pedidos' && (
          <div className="surface-card p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
              <div>
                <h2 className="h4 fw-bold mb-1 text-white">
                  <i className="bi bi-truck text-danger me-2"></i>Monitoreo y Despacho de Pedidos
                </h2>
                <span className="text-muted small">Órdenes de gas en tiempo real (<code>gas_pedidos_db</code>)</span>
              </div>
              <button className="btn btn-danger fw-bold" onClick={() => abrirModalPedido(null)}>
                <i className="bi bi-plus-circle me-1"></i> Crear Pedido Manual
              </button>
            </div>

            {pedidos.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1 d-block mb-2"></i> No hay pedidos registrados en el sistema.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th># Pedido</th>
                      <th>Cliente</th>
                      <th>Dirección</th>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Total</th>
                      <th>Repartidor</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map(p => {
                      let badge = 'bg-warning text-dark';
                      if (p.estado === 'ASIGNADO') badge = 'bg-info text-dark';
                      if (p.estado === 'EN_CAMINO') badge = 'bg-primary text-white';
                      if (p.estado === 'ENTREGADO') badge = 'bg-success text-white';
                      if (p.estado === 'CANCELADO') badge = 'bg-secondary text-white';

                      return (
                        <tr key={p.id}>
                          <td><strong>#{p.id}</strong></td>
                          <td className="fw-semibold text-white">{p.clienteNombre || p.clienteUsername}</td>
                          <td className="small">{p.direccionEntrega}</td>
                          <td>{p.productoNombre || 'Cilindro GLP'}</td>
                          <td><strong>{p.cantidad}</strong></td>
                          <td className="text-danger fw-bold">
                            {typeof p.totalPagar === 'number' ? `$${p.totalPagar.toLocaleString('es-CL')}` : p.totalPagar}
                          </td>
                          <td>
                            <span className="badge bg-secondary">{p.repartidorUsername || 'Sin asignar'}</span>
                          </td>
                          <td>
                            <span className={`badge ${badge}`}>{p.estado}</span>
                            {p.pagoRegistrado && (
                              <div className="small text-success mt-1"><i className="bi bi-check-circle"></i> Pagado</div>
                            )}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-outline-info btn-sm me-2"
                              onClick={() => abrirModalPedido(p)}
                              title="Modificar pedido completo"
                            >
                              <i className="bi bi-pencil-square me-1"></i> Modificar
                            </button>
                            {p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO' && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => confirmarCancelarPedido(p)}
                                title="Cancelar pedido"
                              >
                                Cancelar
                              </button>
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

        {/* =================================================================
            TAB 3: CONTROL TOTAL DE PRODUCTOS (CON FOTO Y EDICIÓN COMPLETA)
            ================================================================= */}
        {tabActiva === 'productos' && (
          <div className="surface-card p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
              <div>
                <h2 className="h4 fw-bold mb-1 text-white">
                  <i className="bi bi-box-seam text-danger me-2"></i>Catálogo Comercial y Stock de Cilindros
                </h2>
                <span className="text-muted small">Productos almacenados en MySQL (<code>gas_productos_db</code>)</span>
              </div>
              {esAdmin && (
                <button className="btn btn-danger fw-bold" onClick={() => abrirModalProducto(null)}>
                  <i className="bi bi-plus-circle me-1"></i> Agregar Nuevo Cilindro
                </button>
              )}
            </div>

            <div className="row g-4">
              {productos.map(p => (
                <div key={p.id} className="col-md-6 col-lg-4 col-xl-3">
                  <div className="card h-100 bg-dark text-white border-secondary shadow-sm">
                    <div className="text-center p-3 bg-secondary-subtle rounded-top position-relative" style={{ minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={p.imagenUrl || p.imagen || '/img/cilindros.png'}
                        alt={p.nombre}
                        className="img-fluid"
                        style={{ maxHeight: '150px', objectFit: 'contain' }}
                        onError={(e) => { e.target.src = '/img/cilindros.png'; }}
                      />
                      <span className={`badge position-absolute top-0 end-0 m-2 ${p.activo !== false ? 'bg-success' : 'bg-danger'}`}>
                        {p.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h3 className="h6 fw-bold mb-1">{p.nombre}</h3>
                      <p className="small text-muted mb-2 flex-grow-1">{p.descripcion}</p>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-danger fw-bold fs-5">${Number(p.precio).toLocaleString('es-CL')}</span>
                        <span className="badge bg-secondary">{p.pesoKg || 11} kg</span>
                      </div>
                      <div className="small text-muted mb-3">
                        Stock disponible: <strong>{p.stock || p.stockActual || 0} unidades</strong>
                      </div>
                      {esAdmin && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-info btn-sm flex-fill"
                            onClick={() => abrirModalProducto(p)}
                          >
                            <i className="bi bi-pencil me-1"></i> Editar Todo
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => confirmarEliminarProducto(p)}
                            title="Desactivar producto"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL PERSONALIZADO 1: PRODUCTO (CREAR / EDITAR COMPLETO CON IMAGEN)
          ===================================================================== */}
      {modalProductoAbierto && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-dialog">
            <div className="custom-modal-content">
              <div className="custom-modal-header">
                <h3 className="h5 fw-bold mb-0 text-white">
                  <i className="bi bi-box-seam text-danger me-2"></i>
                  {productoEditando ? `Modificar Producto: ${productoEditando.nombre}` : 'Nuevo Cilindro de Gas'}
                </h3>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalProductoAbierto(false)}></button>
              </div>
              <form onSubmit={handleGuardarProducto}>
                <div className="custom-modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-white">Nombre del Producto *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formProd.nombre}
                        onChange={(e) => setFormProd({ ...formProd, nombre: e.target.value })}
                        placeholder="Ej: Cilindro GLP 15 kg Plus"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-white">Descripción Completa</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formProd.descripcion}
                        onChange={(e) => setFormProd({ ...formProd, descripcion: e.target.value })}
                        placeholder="Uso residencial, para calefacción o cocina..."
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Precio ($ CLP) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formProd.precio}
                        onChange={(e) => setFormProd({ ...formProd, precio: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Peso en Kilogramos (kg)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formProd.pesoKg}
                        onChange={(e) => setFormProd({ ...formProd, pesoKg: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Stock Actual en Bodega</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formProd.stock}
                        onChange={(e) => setFormProd({ ...formProd, stock: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Estado Comercial</label>
                      <select
                        className="form-select"
                        value={formProd.activo ? 'true' : 'false'}
                        onChange={(e) => setFormProd({ ...formProd, activo: e.target.value === 'true' })}
                      >
                        <option value="true">Activo (Visible en tienda)</option>
                        <option value="false">Desactivado (Oculto)</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-white">URL de la Imagen del Cilindro</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={formProd.imagen}
                          onChange={(e) => setFormProd({ ...formProd, imagen: e.target.value })}
                          placeholder="/img/cilindro_15kg.png o URL web https://..."
                        />
                      </div>
                      <div className="mt-2 d-flex gap-2 align-items-center">
                        <span className="small text-muted">Imágenes rápidas:</span>
                        <button type="button" className="btn btn-sm btn-outline-secondary py-0" onClick={() => setFormProd({ ...formProd, imagen: '/img/cilindro_5kg.png' })}>5kg</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary py-0" onClick={() => setFormProd({ ...formProd, imagen: '/img/cilindro_11kg.png' })}>11kg</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary py-0" onClick={() => setFormProd({ ...formProd, imagen: '/img/cilindro_15kg.png' })}>15kg</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary py-0" onClick={() => setFormProd({ ...formProd, imagen: '/img/cilindro_45kg.png' })}>45kg</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="custom-modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalProductoAbierto(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-danger fw-bold">
                    <i className="bi bi-save me-1"></i> Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL PERSONALIZADO 2: USUARIO (CREAR / EDITAR COMPLETO)
          ===================================================================== */}
      {modalUsuarioAbierto && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-dialog">
            <div className="custom-modal-content">
              <div className="custom-modal-header">
                <h3 className="h5 fw-bold mb-0 text-white">
                  <i className="bi bi-person-gear text-danger me-2"></i>
                  {usuarioEditando ? `Modificar Usuario: ${usuarioEditando.username}` : 'Registrar Nuevo Usuario'}
                </h3>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalUsuarioAbierto(false)}></button>
              </div>
              <form onSubmit={handleGuardarUsuario}>
                <div className="custom-modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-white">Nombre Completo *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formUser.nombreCompleto}
                        onChange={(e) => setFormUser({ ...formUser, nombreCompleto: e.target.value })}
                        placeholder="Ej: Marcelo Rios"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-white">Username / Correo Electrónico *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formUser.username}
                        onChange={(e) => setFormUser({ ...formUser, username: e.target.value })}
                        placeholder="usuario@gaselvolcan.cl"
                        disabled={!!usuarioEditando}
                        required
                      />
                      {usuarioEditando && (
                        <div className="small text-muted mt-1">El username es único y no se puede alterar una vez creado.</div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-white">
                        {usuarioEditando ? 'Nueva Contraseña (Dejar en blanco para mantener la actual)' : 'Contraseña *'}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={formUser.password}
                        onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        required={!usuarioEditando}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Rol Asignado *</label>
                      <select
                        className="form-select"
                        value={formUser.rol}
                        onChange={(e) => setFormUser({ ...formUser, rol: e.target.value })}
                      >
                        <option value="ROLE_CLIENTE">ROLE_CLIENTE (Cliente)</option>
                        <option value="ROLE_OPERADORA">ROLE_OPERADORA (Operadora)</option>
                        <option value="ROLE_REPARTIDOR">ROLE_REPARTIDOR (Chofer)</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN (Administrador)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Estado de la Cuenta</label>
                      <select
                        className="form-select"
                        value={formUser.activo ? 'true' : 'false'}
                        onChange={(e) => setFormUser({ ...formUser, activo: e.target.value === 'true' })}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Suspendido</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="custom-modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalUsuarioAbierto(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-danger fw-bold">
                    <i className="bi bi-save me-1"></i> Guardar en MySQL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL PERSONALIZADO 3: PEDIDO (MODIFICAR TODO / CREAR MANUAL)
          ===================================================================== */}
      {modalPedidoAbierto && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-dialog">
            <div className="custom-modal-content">
              <div className="custom-modal-header">
                <h3 className="h5 fw-bold mb-0 text-white">
                  <i className="bi bi-truck text-danger me-2"></i>
                  {pedidoEditando ? `Modificar Pedido #${pedidoEditando.id}` : 'Crear Pedido de Entrega'}
                </h3>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalPedidoAbierto(false)}></button>
              </div>
              <form onSubmit={handleGuardarPedido}>
                <div className="custom-modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-white">Nombre del Cliente *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formPed.clienteNombre}
                        onChange={(e) => setFormPed({ ...formPed, clienteNombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-white">Dirección de Despacho en Chillán *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formPed.direccionEntrega}
                        onChange={(e) => setFormPed({ ...formPed, direccionEntrega: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Cantidad de Cilindros</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formPed.cantidad}
                        onChange={(e) => setFormPed({ ...formPed, cantidad: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Repartidor Asignado</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formPed.repartidorUsername}
                        onChange={(e) => setFormPed({ ...formPed, repartidorUsername: e.target.value })}
                        placeholder="Ej: repartidor1"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Estado del Despacho</label>
                      <select
                        className="form-select"
                        value={formPed.estado}
                        onChange={(e) => setFormPed({ ...formPed, estado: e.target.value })}
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="ASIGNADO">ASIGNADO</option>
                        <option value="EN_CAMINO">EN_CAMINO</option>
                        <option value="ENTREGADO">ENTREGADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Estado de Pago</label>
                      <select
                        className="form-select"
                        value={formPed.pagoRegistrado ? 'true' : 'false'}
                        onChange={(e) => setFormPed({ ...formPed, pagoRegistrado: e.target.value === 'true' })}
                      >
                        <option value="false">Pendiente de Pago</option>
                        <option value="true">Pagado (Banco Estado / Efectivo)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="custom-modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalPedidoAbierto(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-danger fw-bold">
                    <i className="bi bi-save me-1"></i> Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL PERSONALIZADO 4: CONFIRMACIÓN GENÉRICA
          ===================================================================== */}
      {modalConfirmAbierto && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-dialog" style={{ maxWidth: '420px' }}>
            <div className="custom-modal-content text-center p-4">
              <i className="bi bi-exclamation-triangle text-warning display-4 mb-3"></i>
              <h3 className="h5 fw-bold text-white mb-2">{confirmConfig.titulo}</h3>
              <p className="text-muted small mb-4">{confirmConfig.mensaje}</p>
              <div className="d-flex justify-content-center gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setModalConfirmAbierto(false)}>
                  Cancelar
                </button>
                <button type="button" className={`btn ${confirmConfig.colorBoton} fw-bold`} onClick={confirmConfig.accion}>
                  {confirmConfig.textoBoton}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
