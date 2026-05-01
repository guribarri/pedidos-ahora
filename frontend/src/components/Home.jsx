import React from 'react';

const Home = ({ onLogout }) => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenido a Pedidos Ahora</h1>
      <p style={styles.subtitle}>Has iniciado sesión correctamente</p>
      <button onClick={onLogout} style={styles.button}>
        Cerrar Sesión
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Home;
