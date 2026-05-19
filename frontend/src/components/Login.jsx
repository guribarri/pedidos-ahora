import { useState, useEffect } from 'react';

const Login = ({ onLoginExitoso }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLoginExitoso) onLoginExitoso();
      } else {
        setError('Credenciales inválidas. Reintentá.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={{
        ...styles.card,
        padding: isMobile ? '30px 20px' : '40px 30px'
      }}>
        <div style={{
          ...styles.brandContainer,
          fontSize: isMobile ? '24px' : '32px'
        }}>
          <span style={{ color: '#2d3436' }}>Pedidos</span>
          <span style={{ color: '#ff4757' }}>Ahora!</span>
        </div>

        <h2 style={styles.cardTitle}>¡Hola!</h2>
        <p style={styles.cardSubtitle}>Ingresá tus datos para empezar.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              style={{ ...styles.input, padding: isMobile ? '16px' : '12px', fontSize: isMobile ? '18px' : '16px' }}
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              name="password"
              style={{ ...styles.input, padding: isMobile ? '16px' : '12px', fontSize: isMobile ? '18px' : '16px' }}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div style={styles.errorBanner}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              backgroundColor: loading ? '#b2bec3' : '#007bff',
              padding: isMobile ? '16px' : '14px',
              fontSize: isMobile ? '18px' : '16px'
            }}
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: "'Segoe UI', sans-serif",
    padding: '15px',
    boxSizing: 'border-box',
    margin: 0
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  brandContainer: {
    fontWeight: '800',
    marginBottom: '15px',
    display: 'inline-flex',
    gap: '0px',
    letterSpacing: '-1px'
  },
  cardTitle: { fontSize: '24px', color: '#2d3436', margin: '0 0 5px 0' },
  cardSubtitle: { fontSize: '14px', color: '#636e72', marginBottom: '25px' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#2d3436' },
  input: {
    width: '100%',
    borderRadius: '12px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    outlineColor: '#007bff',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  submitBtn: {
    width: '100%',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    transition: '0.3s'
  },
  errorBanner: {
    color: '#ff4757',
    fontSize: '13px',
    marginBottom: '15px',
    textAlign: 'center',
    backgroundColor: '#fff5f5',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ffebeb'
  }
};

export default Login;