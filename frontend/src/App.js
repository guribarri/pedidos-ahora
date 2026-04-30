import React, { useState } from 'react';
import Login from './components/Login';

const App = () => {
  const [vistaActual, setVistaActual] = useState('login');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Pedidos Ahora</h1>
      <nav style={{ marginBottom: '20px' }}>
        <button onClick={() => setVistaActual('login')} style={{ marginRight: '10px' }}>Iniciar Sesión</button>
      </nav>
      <hr style={{ marginBottom: '20px' }} />
      <main>
        <Login />
      </main>
    </div>
  );
};

export default App;
