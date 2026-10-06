import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('inicio');
  const [usuarioSesion, setUsuarioSesion] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    // Cargar sesión
    const sesionStr = localStorage.getItem('usuarioSesion');
    if (sesionStr) {
      try {
        setUsuarioSesion(JSON.parse(sesionStr));
      } catch {
        setUsuarioSesion(null);
      }
    }

    // Cargar carrito
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch {
        setCarrito([]);
      }
    }
  }, []);

  const totalCartCount = carrito.reduce((total, prod) => total + (prod.cantidad || 1), 0);

  const agregarAlCarrito = (id, nombre, precio, imagen) => {
    setCarrito(prev => {
      let nuevo = [...prev];
      const existente = nuevo.find(item => item.id === id);
      if (existente) {
        existente.cantidad += 1;
      } else {
        nuevo.push({ id, nombre, precio, imagen, cantidad: 1 });
      }
      localStorage.setItem('carrito', JSON.stringify(nuevo));
      return nuevo;
    });
    alert(`¡"${nombre}" fue agregado al carrito exitosamente!`);
  };

  const eliminarProductoCarrito = (index) => {
    setCarrito(prev => {
      const nuevo = [...prev];
      nuevo.splice(index, 1);
      localStorage.setItem('carrito', JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const vaciarCarrito = () => {
    localStorage.removeItem('carrito');
    setCarrito([]);
  };

  const loginUsuario = (sesion) => {
    localStorage.setItem('usuarioSesion', JSON.stringify(sesion));
    setUsuarioSesion(sesion);
  };

  const cerrarSesionUsuario = () => {
    localStorage.removeItem('usuarioSesion');
    setUsuarioSesion(null);
    alert('Has cerrado sesión correctamente.');
  };

  const navegar = (pagina) => {
    setCurrentPage(pagina);
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navegar,
        usuarioSesion,
        loginUsuario,
        cerrarSesionUsuario,
        carrito,
        totalCartCount,
        agregarAlCarrito,
        eliminarProductoCarrito,
        vaciarCarrito,
        menuAbierto,
        setMenuAbierto
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
