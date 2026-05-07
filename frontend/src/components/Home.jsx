import { useUserContext } from '../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout.jsx';

const Home = ({ onLogout }) => {
  const { usuario } = useUserContext();
  const navigate = useNavigate();

  return (

    <Layout onLogout={onLogout}>
      <div style={styles.page}>
        <main style={styles.mainContent}>
          <div style={styles.heroCard}>
            <h1 style={styles.title}>¡Bienvenido de nuevo!</h1>
            <p style={styles.subtitle}>Gestiona tus pedidos y menús desde un solo lugar.</p>
            <div style={styles.divider} />
            <p style={styles.info}>Sesión activa como: <strong>{usuario?.email}</strong></p>
          </div>
        </main>
      </div>
    </Layout>
  );
};

const styles = {
  page: {
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: '#f8f9fa',
    margin: 0,
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 40px',
    height: '70px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  brand: {
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '-1px',
    color: '#2d3436',
    cursor: 'pointer',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
  },
  addBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.3s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    borderLeft: '1px solid #eee',
    paddingLeft: '20px',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f1f2f6',
    padding: '5px 12px',
    borderRadius: '15px',
  },
  userIcon: {
    fontSize: '18px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2f3542',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: '#ff4757',
    border: '1px solid #ff4757',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  mainContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '80px',
  },
  heroCard: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '90%',
  },
  title: {
    fontSize: '28px',
    color: '#2d3436',
    margin: '0 0 10px 0',
  },
  subtitle: {
    color: '#636e72',
    fontSize: '16px',
    marginBottom: '20px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#eee',
    margin: '20px 0',
  },
  info: {
    fontSize: '14px',
    color: '#a4b0be',
  },
};

export default Home;