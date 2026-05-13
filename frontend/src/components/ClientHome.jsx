import { useEffect, useState } from 'react';
import MenuService from '../services/MenuService.jsx';
import { useNavigate } from 'react-router-dom';

const ClientHome = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  const loadMenus = async () => {
    try {
      const data = await MenuService.getAllMenus();
      const visibles = (data || []).filter((m) => m.visible === true || m.visible === 'true');
      setMenus(visibles);
    } catch (e) {
      console.error(e);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={styles.page}>
      <nav style={{ ...styles.navbar, padding: isMobile ? '0 15px' : '0 40px' }}>
        <div style={styles.brand} onClick={() => navigate('/') }>
          <span style={{ color: '#2d3436' }}>
            P{!isMobile && 'edidos'}
          </span>
          <span style={{ color: '#ff4757' }}>
            A{!isMobile && 'hora'}!
          </span>
        </div>
      </nav>

      <main style={styles.mainContent}>
        <h1 style={styles.title}>Menús disponibles</h1>
        <p style={styles.subtitle}>Estos son los menús que podés pedir ahora.</p>
        <div style={styles.divider} />

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div style={{ ...styles.cardGrid, gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(420px, 1fr))' : 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {menus.length === 0 && <p>No hay menús disponibles ahora.</p>}
            {menus.map((m) => (
              <article key={m.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{m.nombre}</h3>
                  <span style={styles.price}>${Number(m.precio).toFixed(2)}</span>
                </div>
                <p style={styles.cardDesc}>{m.descripcion}</p>
                <div style={styles.cardFooter}>
                  <div />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: '#f8f9fa',
    margin: 0,
    padding: 20,
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    width: '100%'
  },
  cardGrid: {
    display: 'grid',
    gap: '18px',
    width: '100%',
    maxWidth: '1400px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '16px',
    margin: 0,
    color: '#2d3436',
  },
  price: {
    fontWeight: 700,
    color: '#2f9e44',
  },
  cardDesc: {
    color: '#69707a',
    fontSize: '14px',
    marginBottom: '12px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 },
  brand: { fontSize: '22px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center' },
};

export default ClientHome;
