import { useUserContext } from '../hooks/useUserContext';
import React, { useState, useEffect } from 'react';
import PedidoService from '../services/PedidoService.jsx';

const PedidosConfirmados = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { usuario } = useUserContext();

  useEffect(() => {
    // 1. Evita llamar a la API si el usuario o su email aún no están cargados en el contexto
    if (!usuario || !usuario.email) {
      return; 
    }

    let isMounted = true;

    const loadPedidosConfirmados = async () => {
      try {
        setLoading(true);
        const data = await PedidoService.getAllPedidos(usuario.email);
        
        // 2. Solo actualiza el estado si el componente sigue montado
        if (isMounted) {
          setPedidos(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setPedidos([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPedidosConfirmados();

    // 3. Función de limpieza (cleanup) que cancela el efecto si cambia el usuario o se desmonta
    return () => {
      isMounted = false;
    };
  }, [usuario]); // Se vuelve a ejecutar únicamente cuando el objeto usuario cambia

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!usuario || !usuario.email) {
    return <div className="loading">Cargando datos de usuario...</div>;
  }

  if (loading) {
    return <div className="loading">Cargando pedidos confirmados...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (pedidos.length === 0) {
    return <div className="no-pedidos">No hay pedidos confirmados</div>;
  }

  return (
    <div style={{ ...styles.container, padding: isMobile ? '15px' : '20px' }}>
      <h2 style={{ ...styles.title, fontSize: isMobile ? '20px' : '22px' }}>Pedidos Confirmados</h2>
      {pedidos.map((pedido) => (
        <div key={pedido.id} style={styles.card}>
          <div style={{ ...styles.cardHeader, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '8px' : '0' }}>
            <strong>ID Pedido: {pedido.id}</strong>
            {pedido.fecha && <span style={{ ...styles.date, fontSize: isMobile ? '12px' : '12px' }}>{new Date(pedido.fecha).toLocaleString()}</span>}
          </div>
          {isMobile ? (
            <div style={styles.mobileList}>
              {pedido.menus && pedido.menus.map((menu, index) => (
                <div key={index} style={styles.mobileItem}>
                  <div style={styles.mobileItemHeader}>
                    <span style={styles.mobileBold}>{menu.nombre}</span>
                    <span style={styles.mobileQuantity}>Qty: {menu.cantidad}</span>
                  </div>
                  <p style={styles.mobileDesc}>{menu.descripcion}</p>
                </div>
              ))}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Descripción</th>
                  <th style={styles.th}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {pedido.menus && pedido.menus.map((menu, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{menu.nombre}</td>
                    <td style={styles.td}>{menu.descripcion}</td>
                    <td style={styles.tdCenter}>{menu.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  title: {
    fontSize: '22px',
    margin: 0,
    color: '#2d3436'
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  date: {
    fontSize: '12px',
    color: '#666'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '8px',
    backgroundColor: '#f7f7f7',
    borderBottom: '1px solid #eaeaea'
  },
  tr: {
    borderBottom: '1px solid #f0f0f0'
  },
  td: {
    padding: '10px 8px'
  },
  tdCenter: {
    padding: '10px 8px',
    textAlign: 'center'
  },
  tdRight: {
    padding: '10px 8px',
    textAlign: 'right',
    fontWeight: '600'
  },
  mobileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  mobileItem: {
    padding: '12px',
    backgroundColor: '#f8f8f8',
    borderRadius: '6px',
    borderLeft: '4px solid #007bff'
  },
  mobileItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  mobileBold: {
    fontWeight: '600',
    fontSize: '14px'
  },
  mobileQuantity: {
    fontSize: '13px',
    color: '#666',
    backgroundColor: '#e8f4f8',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  mobileDesc: {
    fontSize: '12px',
    color: '#666',
    margin: '0'
  }
};

export default PedidosConfirmados;
