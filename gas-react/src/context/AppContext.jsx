import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('inicio');
  const [usuarioSesion, setUsuarioSesion] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Notificaciones Toast personalizadas
  const mostrarToast = useCallback((mensaje, tipo = 'info', duracion = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, mensaje, tipo }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duracion);
  }, []);

  const removerToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
      const existe = prev.some(item => item.id === id);
      const nuevo = existe
        ? prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item)
        : [...prev, { id, nombre, precio, imagen, cantidad: 1 }];
      localStorage.setItem('carrito', JSON.stringify(nuevo));
      return nuevo;
    });
    mostrarToast(`"${nombre}" se agregó al pedido`, 'success');
  };

  const eliminarProductoCarrito = (index) => {
    setCarrito(prev => {
      const eliminado = prev[index];
      const nuevo = [...prev];
      nuevo.splice(index, 1);
      localStorage.setItem('carrito', JSON.stringify(nuevo));
      if (eliminado) {
        mostrarToast(`"${eliminado.nombre}" eliminado del pedido`, 'info');
      }
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
    mostrarToast(`¡Bienvenido(a), ${sesion.nombre || sesion.email}!`, 'success');
  };

  const cerrarSesionUsuario = () => {
    localStorage.removeItem('usuarioSesion');
    setUsuarioSesion(null);
    mostrarToast('Has cerrado sesión correctamente', 'info');
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
        setMenuAbierto,
        toasts,
        mostrarToast,
        removerToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
