import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Carrito from './pages/Carrito';
import Contacto from './pages/Contacto';
import Registro from './pages/Registro';

export default function App() {
  const { currentPage } = useApp();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'inicio':
        return <Home />;
      case 'productos':
        return <Productos />;
      case 'carrito':
        return <Carrito />;
      case 'contacto':
        return <Contacto />;
      case 'registro':
        return <Registro />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      <Header />
      {renderCurrentPage()}
      <Footer />
    </>
  );
}
