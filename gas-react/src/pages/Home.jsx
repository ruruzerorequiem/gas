import React from 'react';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { navegar, agregarAlCarrito } = useApp();

  return (
    <main>
      {/* HERO SECTION */}
      <section className="py-5 bg-light text-center border-bottom">
        <div className="container py-3">
          <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-bold mb-3">
            Chillán y Región de Ñuble
          </span>
          <h1 className="display-5 fw-bold text-dark mb-3">Distribuidora de Gas El Volcán</h1>
          <p className="lead text-muted col-lg-8 mx-auto mb-4">
            Gas licuado a domicilio rápido y seguro. Entregas en el día con cobertura en Chillán Centro, Oriente, zonas
            rurales y comerciales.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button
              onClick={() => navegar('productos')}
              className="btn btn-danger btn-lg px-4 fw-bold border-0"
            >
              Pedir Gas Ahora
            </button>
            <a href="#video-seccion" className="btn btn-outline-secondary btn-lg px-4">
              Ver Servicio
            </a>
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Nuestros Cilindros Destacados</h2>
            <p className="text-muted">Formatos residenciales certificados con entrega directa en tu puerta</p>
          </div>

          <div className="row g-4">
            {/* Cilindro 5 kg */}
            <div className="col-12 col-md-6 col-lg-3">
              <article className="card h-100 card-producto rounded-3 p-3">
                <div className="text-center p-3 bg-light rounded-3 mb-3">
                  <img
                    src="/img/cilindro_5kg.png"
                    alt="Cilindro GLP 5 kg"
                    className="img-fluid"
                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                  />
                </div>
                <div className="card-body d-flex flex-column p-0">
                  <span className="badge bg-secondary-subtle text-secondary w-auto align-self-start mb-2">CL001</span>
                  <h3 className="h5 fw-bold card-title">Cilindro GLP 5 kg</h3>
                  <p className="card-text text-muted small flex-grow-1">
                    Cilindro de gas licuado de petróleo 5 kg. Para uso residencial (cocina, calefacción pequeña).
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <span className="fs-4 fw-bold text-danger">$6.500</span>
                    <button
                      className="btn btn-danger fw-bold"
                      onClick={() => agregarAlCarrito('CL001', 'Cilindro GLP 5 kg', 6500, '/img/cilindro_5kg.png')}
                    >
                      <i className="bi bi-cart-plus me-1"></i> Pedir
                    </button>
                  </div>
                </div>
              </article>
            </div>

            {/* Cilindro 11 kg */}
            <div className="col-12 col-md-6 col-lg-3">
              <article className="card h-100 card-producto rounded-3 p-3 border-danger">
                <div className="text-center p-3 bg-light rounded-3 mb-3">
                  <img
                    src="/img/cilindro_11kg.png"
                    alt="Cilindro GLP 11 kg"
                    className="img-fluid"
                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                  />
                </div>
                <div className="card-body d-flex flex-column p-0">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="badge bg-secondary-subtle text-secondary">CL002</span>
                    <span className="badge bg-warning text-dark fw-bold">Más Vendido</span>
                  </div>
                  <h3 className="h5 fw-bold card-title">Cilindro GLP 11 kg</h3>
                  <p className="card-text text-muted small flex-grow-1">
                    Cilindro estándar doméstico. El más utilizado en hogares chilenos.
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <span className="fs-4 fw-bold text-danger">$12.000</span>
                    <button
                      className="btn btn-danger fw-bold"
                      onClick={() => agregarAlCarrito('CL002', 'Cilindro GLP 11 kg', 12000, '/img/cilindro_11kg.png')}
                    >
                      <i className="bi bi-cart-plus me-1"></i> Pedir
                    </button>
                  </div>
                </div>
              </article>
            </div>

            {/* Cilindro 15 kg */}
            <div className="col-12 col-md-6 col-lg-3">
              <article className="card h-100 card-producto rounded-3 p-3">
                <div className="text-center p-3 bg-light rounded-3 mb-3">
                  <img
                    src="/img/cilindro_15kg.png"
                    alt="Cilindro GLP 15 kg"
                    className="img-fluid"
                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                  />
                </div>
                <div className="card-body d-flex flex-column p-0">
                  <span className="badge bg-secondary-subtle text-secondary w-auto align-self-start mb-2">CL003</span>
                  <h3 className="h5 fw-bold card-title">Cilindro GLP 15 kg</h3>
                  <p className="card-text text-muted small flex-grow-1">
                    Cilindro de mayor capacidad para hogares de alto consumo o locales pequeños.
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <span className="fs-4 fw-bold text-danger">$16.000</span>
                    <button
                      className="btn btn-danger fw-bold"
                      onClick={() => agregarAlCarrito('CL003', 'Cilindro GLP 15 kg', 16000, '/img/cilindro_15kg.png')}
                    >
                      <i className="bi bi-cart-plus me-1"></i> Pedir
                    </button>
                  </div>
                </div>
              </article>
            </div>

            {/* Cilindro 45 kg */}
            <div className="col-12 col-md-6 col-lg-3">
              <article className="card h-100 card-producto rounded-3 p-3">
                <div className="text-center p-3 bg-light rounded-3 mb-3">
                  <img
                    src="/img/cilindros.png"
                    alt="Cilindro GLP 45 kg"
                    className="img-fluid"
                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                  />
                </div>
                <div className="card-body d-flex flex-column p-0">
                  <span className="badge bg-secondary-subtle text-secondary w-auto align-self-start mb-2">CL004</span>
                  <h3 className="h5 fw-bold card-title">Cilindro GLP 45 kg</h3>
                  <p className="card-text text-muted small flex-grow-1">
                    Cilindro industrial. Uso comercial: restaurantes, talleres, calefacción.
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <span className="fs-4 fw-bold text-danger">$45.000</span>
                    <button
                      className="btn btn-danger fw-bold"
                      onClick={() => agregarAlCarrito('CL004', 'Cilindro GLP 45 kg', 45000, '/img/cilindros.png')}
                    >
                      <i className="bi bi-cart-plus me-1"></i> Pedir
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO EMBEBIDO RESPONSIVE */}
      <section className="py-5 bg-light" id="video-seccion">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Conoce Nuestro Reparto y Normas de Seguridad</h2>
            <p className="text-muted">Comprometidos con entregas puntuales y manipulación responsable</p>
          </div>
          <div className="video-container shadow rounded-4 overflow-hidden">
            <div className="ratio ratio-16x9">
              <video controls poster="/img/cilindros.png" preload="metadata">
                <source
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  type="video/mp4"
                />
                Tu navegador no soporta el formato de video.
              </video>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
