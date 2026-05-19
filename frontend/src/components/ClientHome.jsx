import { useEffect, useState, useRef } from 'react';
import MenuService from '../services/MenuService.jsx';
import PedidoService from '../services/PedidoService.jsx';
import { useNavigate } from 'react-router-dom';

const ClientHome = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success');
  const notificationTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    };
  }, []);

  const showNotification = (msg, type = 'success') => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setNotificationType(type);
    setNotification(msg);
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 3000);
  };

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
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleButtonClick = (menu) => {
    setSelectedMenus((prevMenus) => [
      ...prevMenus,
      { ...menu, cantidad: 1 },
    ]);
    setSidebarVisible(true);
  };

  const handleCancel = () => {
    setSelectedMenus([]);
    setSidebarVisible(false);
  };

  const updateMenuCantidad = (menuId, newCantidad) => {
    setSelectedMenus((prevMenus) =>
      prevMenus.map((menu) =>
        menu.id === menuId
          ? { ...menu, cantidad: Math.max(1, Math.min(20, newCantidad)) }
          : menu
      )
    );
  };

  const handleDecrement = (menuId, currentCantidad) => {
    if (currentCantidad > 1) {
      updateMenuCantidad(menuId, currentCantidad - 1);
    }
  };

  const handleIncrement = (menuId, currentCantidad) => {
    if (currentCantidad < 20) {
      updateMenuCantidad(menuId, currentCantidad + 1);
    }
  };

  const handlConfirmarPedido = async () => {
    if (selectedMenus.length === 0) return;
    setIsSubmitting(true);
    try {
      const menusPayload = selectedMenus.map((menu) => ({
        menu_id: menu.id,
        cantidad: menu.cantidad ?? 1,
        precio_unitario: menu.precio,
      }));
      await PedidoService.createPedido(menusPayload);
      showNotification('Pedido confirmado correctamente');
      setSelectedMenus([]);
      setSidebarVisible(false);
    } catch (e) {
      console.error(e);
      showNotification(e?.message || 'Error al confirmar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div style={{ ...styles.page, marginRight: sidebarVisible && !isMobile ? '300px' : '0', transition: 'margin-right 0.3s ease' }}>
      {notification && (
        <div
          style={{
            ...styles.notification,
            backgroundColor:
              notificationType === 'error'
                ? 'rgba(255,69,58,0.95)'
                : notificationType === 'info'
                ? 'rgba(30,144,255,0.95)'
                : 'rgba(40,167,69,0.95)'
          }}
        >
          {notification}
        </div>
      )}
      <nav style={{ ...styles.navbar, padding: isMobile ? '0 15px' : isTablet ? '0 25px' : '0 40px', height: isMobile ? '50px' : '60px' }}>
        <div style={{ ...styles.brand, fontSize: isMobile ? '18px' : '24px' }} onClick={() => navigate('/') }>
          <span style={{ color: '#2d3436' }}>
            P{!isMobile && 'edidos'}
          </span>
          <span style={{ color: '#ff4757' }}>
            A{!isMobile && 'hora'}!
          </span>
        </div>
      </nav>

      <main style={{ ...styles.mainContent, padding: isMobile ? '15px' : isTablet ? '20px' : '20px' }}>
        <h1 style={{ ...styles.title, fontSize: isMobile ? '20px' : '24px', textAlign: 'center' }}>Menús disponibles</h1>
        <p style={{ ...styles.subtitle, fontSize: isMobile ? '14px' : '16px', textAlign: 'center' }}>Estos son los menús que podés pedir ahora.</p>
        <div style={styles.divider} />

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div
            style={{
              ...styles.cardGrid,
              gridTemplateColumns: isMobile
                ? '1fr'
                : isTablet
                ? 'repeat(2, 1fr)'
                : 'repeat(auto-fill, minmax(420px, 1fr))',
            }}
          >
            {menus.length === 0 && <p>No hay menús disponibles ahora.</p>}
            {menus.map((m) => (
              <article key={m.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={{ ...styles.cardTitle, fontSize: isMobile ? '16px' : '18px' }}>{m.nombre}</h3>
                  <span style={{ ...styles.price, fontSize: isMobile ? '14px' : '16px' }}>${Number(m.precio).toFixed(2)}</span>
                </div>
                <p style={{ ...styles.cardDesc, fontSize: isMobile ? '13px' : '14px' }}>{m.descripcion}</p>
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => handleButtonClick(m)}
                    style={{
                      backgroundColor: selectedMenus.some(menu => menu.id === m.id) ? '#90ee90' : '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: isMobile ? '12px 20px' : '10px 20px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '14px' : '14px',
                      fontWeight: '600',
                      width: '100%',
                      transition: 'background-color 0.2s ease',
                    }}
                    disabled={selectedMenus.some(menu => menu.id === m.id)}
                  >
                    Elegir Menú
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {sidebarVisible && selectedMenus.length > 0 && (
        <>
          {isMobile && (
            <div
              style={styles.sidebarOverlay}
              onClick={() => setSidebarVisible(false)}
            />
          )}
          <aside style={{
            ...styles.sidebar,
            width: isMobile ? '100%' : '300px',
            position: isMobile ? 'fixed' : 'fixed',
            bottom: isMobile ? '0' : 'auto',
            right: isMobile ? '0' : '0',
            top: isMobile ? 'auto' : '0',
            borderRadius: isMobile ? '16px 16px 0 0' : '0',
            height: isMobile ? 'auto' : '100%',
            maxHeight: isMobile ? '85vh' : '100%',
            padding: isMobile ? '20px 15px' : '20px',
          }}>
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: isMobile ? '12px' : '15px' }}>Menús Elegidos</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: isMobile ? '15px' : '20px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button 
                onClick={() => handlConfirmarPedido()}
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#90ee90',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: isMobile ? '14px 10px' : '10px 10px',
                  fontSize: isMobile ? '15px' : '14px',
                  fontWeight: '600',
                  flex: isMobile ? 1 : 'unset',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}
              </button>
              
              <button 
                onClick={() => handleCancel()}
                style={{
                  backgroundColor: 'red',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: isMobile ? '14px 10px' : '10px 10px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '15px' : '14px',
                  fontWeight: '600',
                  flex: isMobile ? 1 : 'unset',
                }}
              >
                Cancelar pedido
              </button>
            </div>
          {selectedMenus.map((menu) => (
            <div key={menu.id} style={styles.sidebarItem}>
              <h3>{menu.nombre}</h3>
              <p>{menu.descripcion}</p>
              <p>Precio: ${Number(menu.precio).toFixed(2)}</p>
              <div style={styles.quantityControl}>
                <button
                  onClick={() => handleDecrement(menu.id, menu.cantidad ?? 1)}
                  style={styles.quantityButton}
                  aria-label={`Disminuir cantidad de ${menu.nombre}`}
                >
                  -
                </button>
                <span style={styles.quantityValue}>{menu.cantidad ?? 1}</span>
                <button
                  onClick={() => handleIncrement(menu.id, menu.cantidad ?? 1)}
                  style={styles.quantityButton}
                  aria-label={`Aumentar cantidad de ${menu.nombre}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div style={styles.sidebarTotal}>
            <span style={styles.sidebarTotalLabel}>Total:</span>
            <span style={styles.sidebarTotalAmount}>
              ${selectedMenus.reduce((sum, menu) => sum + (Number(menu.precio) * (menu.cantidad ?? 1)), 0).toFixed(2)}
            </span>
          </div>
        </aside>
        </>
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
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
    overflowY: 'auto',
    zIndex: 1000,
  },
  sidebarOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  sidebarItem: {
    marginTop: '15px',
    marginBottom: '15px',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    transition: 'box-shadow 0.2s ease',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '10px',
    marginTop: '10px',
  },
  quantityButton: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#f1f1f1',
    color: '#333',
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: '1',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  quantityValue: {
    minWidth: '30px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sidebarTotal: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid #ddd',
    backgroundColor: '#f9fff9',
    padding: '15px',
    borderRadius: '6px',
  },
  sidebarTotalLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  sidebarTotalAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#28a745',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.85)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '6px',
    zIndex: 9999,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    maxWidth: '90%',
    textAlign: 'center',
  },
};

export default ClientHome;
