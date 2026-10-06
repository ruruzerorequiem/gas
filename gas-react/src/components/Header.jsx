import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { currentPage, navegar, usuarioSesion, cerrarSesionUsuario, totalCartCount } = useApp();
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [navCollapse, setNavCollapse] = useState(false);

  const nombreMostrar = usuarioSesion
    ? (usuarioSesion.nombre ? usuarioSesion.nombre.split(' ')[0] : usuarioSesion.email)
    : '';

  return (
    <header className="sticky-top shadow-sm">
      <nav className="navbar navbar-expand-lg navbar-custom py-2" aria-label="Navegación principal">
        <div className="container">
          <a
            className="navbar-brand brand-volcan fs-4"
            href="#inicio"
            onClick={(e) => { e.preventDefault(); navegar('inicio'); }}
          >
            <i className="bi bi-fire text-danger me-1"></i>Gas <span>El Volcán</span>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setNavCollapse(!navCollapse)}
            aria-controls="navbarMain"
            aria-expanded={navCollapse}
            aria-label="Abrir navegación"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${navCollapse ? 'show' : ''}`} id="navbarMain">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-semibold">
              <li className="nav-item">
                <a
                  className={`nav-link ${currentPage === 'inicio' ? 'active text-danger' : ''}`}
                  href="#inicio"
                  onClick={(e) => { e.preventDefault(); navegar('inicio'); }}
                  aria-current={currentPage === 'inicio' ? 'page' : undefined}
                >
                  Inicio
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${currentPage === 'productos' ? 'active text-danger' : ''}`}
                  href="#productos"
                  onClick={(e) => { e.preventDefault(); navegar('productos'); }}
                >
                  Cilindros de Gas
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${currentPage === 'contacto' ? 'active text-danger' : ''}`}
                  href="#contacto"
                  onClick={(e) => { e.preventDefault(); navegar('contacto'); }}
                >
                  Contacto
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              <div id="contenedorUsuarioHeader">
                {usuarioSesion ? (
                  <div className="dropdown d-inline-block position-relative">
                    <button
                      className="btn btn-outline-success fw-semibold dropdown-toggle btn-sm py-2 px-3"
                      type="button"
                      onClick={() => setDropdownAbierto(!dropdownAbierto)}
                      aria-expanded={dropdownAbierto}
                    >
                      <i className="bi bi-person-fill-check me-1"></i> Hola, <strong>{nombreMostrar}</strong>
                    </button>
                    {dropdownAbierto && (
                      <ul className="dropdown-menu dropdown-menu-end shadow-sm show position-absolute mt-1">
                        <li>
                          <button
                            className="dropdown-item small text-danger"
                            onClick={() => {
                              setDropdownAbierto(false);
                              cerrarSesionUsuario();
                            }}
                          >
                            <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                ) : (
                  <a
                    href="#registro"
                    onClick={(e) => { e.preventDefault(); navegar('registro'); }}
                    className="btn btn-outline-secondary fw-semibold btn-sm py-2 px-3"
                  >
                    <i className="bi bi-person me-1"></i> Ingreso / Registro
                  </a>
                )}
              </div>

              <a
                href="#carrito"
                onClick={(e) => { e.preventDefault(); navegar('carrito'); }}
                className={`btn ${currentPage === 'carrito' ? 'btn-danger' : 'btn-outline-danger'} fw-bold position-relative`}
              >
                <i className="bi bi-cart3 me-1"></i> Mis Pedidos
                <span className={`badge ${currentPage === 'carrito' ? 'bg-white text-danger' : 'bg-danger'} rounded-pill cart-count ms-1`}>
                  {totalCartCount}
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
