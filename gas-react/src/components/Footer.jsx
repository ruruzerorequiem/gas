import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-custom py-4 mt-auto border-top">
      <div className="container">
        <div className="row g-3 align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-1">
              <i className="bi bi-fire text-danger me-1"></i>
              <strong>Distribuidora de Gas El Volcán</strong> - Chillán, Región del Ñuble
            </p>
            <small className="text-muted">Teléfono de Pedidos: +56 42 222 3344 | Correo: contacto@gaselvolcan.cl</small>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <small className="text-secondary">&copy; 2026 Proyecto DSY1104 - Desarrollo Fullstack II (Forma C)</small>
          </div>
        </div>
      </div>
    </footer>
  );
}
