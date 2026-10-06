import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { obtenerProductosAPI, obtenerZonasDespachoAPI } from '../api';

export default function Productos() {
  const { agregarAlCarrito } = useApp();
  const [productos, setProductos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let montado = true;
    async function cargarDatos() {
      try {
        const [listaProds, listaZonas] = await Promise.all([
          obtenerProductosAPI(),
          obtenerZonasDespachoAPI()
        ]);
        if (montado) {
          setProductos(listaProds || []);
          setZonas(listaZonas || []);
        }
      } catch (e) {
        console.error("Error al cargar productos", e);
      } finally {
        if (montado) setCargando(false);
      }
    }
    cargarDatos();
    return () => { montado = false; };
  }, []);

  return (
    <main>
      {/* CABECERA DE SECCIÓN */}
      <section className="py-4 bg-light border-bottom text-center">
        <div className="container py-2">
          <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-bold mb-2">
            Forma C - Tarifas Oficiales
          </span>
          <h1 className="display-6 fw-bold text-dark">Catálogo de Productos y Tarifas</h1>
          <p className="text-muted col-lg-8 mx-auto mb-0">
            Revisa nuestro catálogo completo de cilindros de gas, reguladores, mangueras y accesorios con precios
            residenciales y comerciales:
          </p>
        </div>
      </section>

      {/* GRID DE PRODUCTOS */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4" id="contenedorProductos">
            {cargando ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : (
              productos.map((prod) => (
                <div className="col-12 col-md-6 col-lg-4" key={prod.codigo || prod.id}>
                  <article className="card h-100 card-producto rounded-3 p-3">
                    <div className="text-center p-3 bg-light rounded-3 mb-3">
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="img-fluid"
                        style={{ maxHeight: '180px', objectFit: 'contain' }}
                      />
                    </div>
                    <div className="card-body d-flex flex-column p-0">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-secondary-subtle text-secondary">{prod.codigo || 'GAS'}</span>
                        <span className="badge bg-danger-subtle text-danger fw-bold">{prod.categoria}</span>
                      </div>
                      <h3 className="h5 fw-bold card-title mb-1">{prod.nombre}</h3>
                      <p className="card-text text-muted small flex-grow-1 mb-3">{prod.descripcion}</p>

                      <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                        <div>
                          <span className="fs-4 fw-bold text-danger">
                            $
                            {prod.precioResidencial
                              ? prod.precioResidencial.toLocaleString('es-CL')
                              : (prod.precio || 0).toLocaleString('es-CL')}
                          </span>
                          {prod.precioComercial && (
                            <div className="small text-muted" style={{ fontSize: '11px' }}>
                              Comercial: ${prod.precioComercial.toLocaleString('es-CL')}
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-danger fw-bold"
                          onClick={() =>
                            agregarAlCarrito(
                              prod.codigo || prod.id,
                              prod.nombre,
                              prod.precioResidencial || prod.precio,
                              prod.imagen
                            )
                          }
                        >
                          <i className="bi bi-cart-plus me-1"></i> Pedir
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* TABLA DE ZONAS DE DESPACHO BOOTSTRAP */}
      <section className="py-5 bg-light border-top">
        <div className="container">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-truck text-danger fs-3 me-2"></i>
            <h2 className="h4 fw-bold mb-0">Zonas de Cobertura y Horarios de Despacho</h2>
          </div>
          <p className="text-muted small mb-4">
            Tiempos estimados y horarios de reparto para Chillán y comunas de la Región del Ñuble:
          </p>

          <div className="table-responsive rounded-3 shadow-sm border bg-white">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Zona</th>
                  <th>Comunas Cubiertas</th>
                  <th>Días de Despacho</th>
                  <th>Horario</th>
                  <th>Tiempo Estimado</th>
                </tr>
              </thead>
              <tbody id="filasZonas">
                {zonas.map((z, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{z.zona}</td>
                    <td>{z.comunasCubiertas}</td>
                    <td>{z.diasDespacho}</td>
                    <td>{z.horario}</td>
                    <td><span className="badge bg-secondary">{z.tiempoEstimado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
