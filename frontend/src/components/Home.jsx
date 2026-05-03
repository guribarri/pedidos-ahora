import React from 'react';
import { useUserContext } from '../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';

const Home = ({ onLogout }) => {
  const { usuario } = useUserContext();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenido a Pedidos Ahora</h1>
      <p style={styles.subtitle}>Has iniciado sesión correctamente</p>
      {usuario && (
        <p style={styles.userEmail}>
          <strong>Email:</strong> {usuario.email}
        </p>
      )}
      <button onClick={onLogout} style={styles.button}>
        Cerrar Sesión
      </button>
      <button
        onClick={() => navigate('/menu-form')}
        style={{ ...styles.button, marginTop: '20px', backgroundColor: '#007bff' }}
      >
        Ir al Formulario de Menú
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
    marginBottom: '20px',
  },
  userEmail: {
    fontSize: '14px',
    color: '#333',
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
