import { useUserContext } from '../hooks/useUserContext';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout.jsx';
import PedidoService from '../services/PedidoService.jsx';

const PedidosConfirmados = ({ onLogout }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [updatingId, setUpdatingId] = useState(null);
  const { usuario } = useUserContext();

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'confirmado':
        return '#ff4757';
      case 'en_preparacion':
        return '#ffa502';
      case 'entregado':
        return '#2ed573';
      default:
        return '#999';
    }
  };

  const getEstadoLabel = (estado) => {
    switch(estado) {
      case 'confirmado':
        return 'Confirmado';
      case 'en_preparacion':
        return 'En Preparación';
      case 'entregado':
        return 'Entregado';
      default:
        return estado;
    }
  };

  useEffect(() => {
    if (!usuario || !usuario.email) {
      return;
    }

    let isMounted = true;

    const loadPedidosConfirmados = async () => {
      try {
        setLoading(true);
        const data = await PedidoService.getAllPedidos(usuario.email);

        if (isMounted) {
          const sortedData = data.sort((a, b) => {
            if (a.estado === 'entregado' && b.estado !== 'entregado') return 1;
            if (a.estado !== 'entregado' && b.estado === 'entregado') return -1;
            return new Date(b.fecha) - new Date(a.fecha);
          });
          setPedidos(sortedData);
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

    return () => {
      isMounted = false;
    };
  }, [usuario]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEstadoChange = async (pedidoId, direction) => {
    try {
      setUpdatingId(pedidoId);
      const response = await PedidoService.updatePedidoEstado(pedidoId, direction);

      setPedidos(prevPedidos => {
        const updatedPedidos = prevPedidos.map(p =>
          p.id === pedidoId ? { ...p, estado: response.pedido.estado } : p
        );

        return updatedPedidos.sort((a, b) => {
          if (a.estado === 'entregado' && b.estado !== 'entregado') return 1;
          if (a.estado !== 'entregado' && b.estado === 'entregado') return -1;
          return new Date(b.fecha) - new Date(a.fecha);
        });
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!usuario || !usuario.email) {
    return (
      <Layout onLogout={onLogout}>
        <div style={{ ...styles.container, padding: isMobile ? '15px' : '20px' }}>
          <div className="loading">Cargando datos de usuario...</div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div style={{ ...styles.container, padding: isMobile ? '15px' : '20px' }}>
          <div className="loading">Cargando pedidos confirmados...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout onLogout={onLogout}>
        <div style={{ ...styles.container, padding: isMobile ? '15px' : '20px' }}>
          <div className="error">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  if (pedidos.length === 0) {
    return (
      <Layout onLogout={onLogout}>
        <div style={{ ...styles.container, padding: isMobile ? '15px' : '20px' }}>
          <h2 style={{ ...styles.title, fontSize: isMobile ? '20px' : '22px' }}>Pedidos Confirmados</h2>
          <div className="no-pedidos">No hay pedidos confirmados</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div style={{ ...styles.container, padding: isMobile ? '15px' : '20px' }}>
        <h2 style={{ ...styles.title, fontSize: isMobile ? '20px' : '22px' }}>Pedidos Confirmados</h2>
        {pedidos.map((pedido) => (
          <div key={pedido.id} style={{ ...styles.card, borderLeftColor: getEstadoColor(pedido.estado) }}>
            <div style={{ ...styles.cardHeader, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '8px' : '0' }}>
              <div style={styles.headerLeft}>
                <strong>ID Pedido: {pedido.id}</strong>
                <span style={{ ...styles.estadoLabel, backgroundColor: getEstadoColor(pedido.estado) }}>
                  {getEstadoLabel(pedido.estado)}
                </span>
              </div>
              <div style={styles.buttonsContainer}>
                <button
                  onClick={() => handleEstadoChange(pedido.id, 'backward')}
                  disabled={pedido.estado === 'confirmado' || updatingId === pedido.id}
                  style={{
                    ...styles.navButton,
                    opacity: (pedido.estado === 'confirmado' || updatingId === pedido.id) ? 0.5 : 1,
                    cursor: (pedido.estado === 'confirmado' || updatingId === pedido.id) ? 'not-allowed' : 'pointer'
                  }}
                  title="Retroceder estado"
                >
                  ←
                </button>
                <button
                  onClick={() => handleEstadoChange(pedido.id, 'forward')}
                  disabled={pedido.estado === 'entregado' || updatingId === pedido.id}
                  style={{
                    ...styles.navButton,
                    opacity: (pedido.estado === 'entregado' || updatingId === pedido.id) ? 0.5 : 1,
                    cursor: (pedido.estado === 'entregado' || updatingId === pedido.id) ? 'not-allowed' : 'pointer'
                  }}
                  title="Avanzar estado"
                >
                  →
                </button>
              </div>
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
    </Layout>
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    borderLeft: '6px solid #999'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    gap: '12px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  estadoLabel: {
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  buttonsContainer: {
    display: 'flex',
    gap: '8px',
    marginLeft: 'auto',
    marginRight: '16px'
  },
  navButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
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
