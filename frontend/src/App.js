import React, { useState } from 'react';
import Login from './components/Login';
import Home from './components/Home';

const App = () => {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

  const handleLoginExitoso = () => {
    setUsuarioAutenticado(true);
  };

  const handleLogout = () => {
    setUsuarioAutenticado(false);
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {usuarioAutenticado ? (
        <Home onLogout={handleLogout} />
      ) : (
        <Login onLoginExitoso={handleLoginExitoso} />
      )}
    </div>
  );
};

export default App;
