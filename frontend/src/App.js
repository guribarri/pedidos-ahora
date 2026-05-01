import React, { useState } from 'react';
import Login from './components/Login';
import Home from './components/Home';

const App = () => {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const handleLoginExitoso = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUsuario(JSON.parse(userData));
    }
    setUsuarioAutenticado(true);
  };

  const handleLogout = () => {
    setUsuarioAutenticado(false);
    setUsuario(null);
    localStorage.removeItem('user');
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {usuarioAutenticado ? (
        <Home usuario={usuario} onLogout={handleLogout} />
      ) : (
        <Login onLoginExitoso={handleLoginExitoso} />
      )}
    </div>
  );
};

export default App;
