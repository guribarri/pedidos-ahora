import { useEffect, useState } from 'react';
import MenuService from '../services/MenuService.jsx';
import { useNavigate } from 'react-router-dom';

const ClientHome = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
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

  const handleButtonClick = (menu) => {
    setSelectedMenu(menu);
    setSidebarVisible(true);
  };

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
        <h1 style={{ ...styles.title, textAlign: 'center' }}>Menús disponibles</h1>
        <p style={{ ...styles.subtitle, textAlign: 'center' }}>Estos son los menús que podés pedir ahora.</p>
        <div style={styles.divider} />

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div
            style={{
              ...styles.cardGrid,
              gridTemplateColumns: isDesktop
                ? 'repeat(auto-fill, minmax(420px, 1fr))'
                : 'repeat(auto-fill, minmax(320px, 1fr))',
            }}
          >
            {menus.length === 0 && <p>No hay menús disponibles ahora.</p>}
            {menus.map((m) => (
              <article key={m.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{m.nombre}</h3>
                  <span style={styles.price}>${Number(m.precio).toFixed(2)}</span>
                </div>
                <p style={styles.cardDesc}>{m.descripcion}</p>
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => handleButtonClick(m)}
                    style={{
                      backgroundColor: selectedMenu?.id === m.id ? '#90ee90' : '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                    disabled={selectedMenu?.id === m.id}
                  >
                    Elegir Menú
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {sidebarVisible && selectedMenu && (
        <aside style={styles.sidebar}>
          <h2>{selectedMenu.nombre}</h2>
          <p>{selectedMenu.descripcion}</p>
          <p>Precio: ${Number(selectedMenu.precio).toFixed(2)}</p>
        </aside>
      )}
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    height: '60px',
  },
  brand: {
    cursor: 'pointer',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '20px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#ddd',
    marginBottom: '20px',
  },
  cardGrid: {
    display: 'grid',
    gap: '20px',
  },
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#fff',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  price: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'green',
  },
  cardDesc: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '10px',
  },
  cardFooter: {
    textAlign: 'center',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '300px',
    height: '100%',
    backgroundColor: '#fff',
    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
    padding: '20px',
  },
};

export default ClientHome;
