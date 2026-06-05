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
  const [mesasCerradas, setMesasCerradas] = useState([]);
  const [sessionFlags, setSessionFlags] = useState({});

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmado': return '#ff4757';
      case 'en_preparacion': return '#ffa502';
      case 'entregado': return '#2ed573';
      case 'cuenta_pedida': return '#1e90ff';
      case 'pagado': return '#a4b0be';
      default: return '#999';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'confirmado': return 'Confirmado';
      case 'en_preparacion': return 'En Preparación';
      case 'entregado': return 'Entregado';
      case 'cuenta_pedida': return 'Cuenta Pedida 💰';
      case 'pagado': return 'Pagado ✅';
      default: return estado;
    }
  };

  useEffect(() => {
    if (!usuario || !usuario.email) {
      return;
    }

    let isMounted = true;
    let initialLoad = true;

    const loadPedidosConfirmados = async () => {
      try {
        if (initialLoad) {
          setLoading(true);
        }
        const data = await PedidoService.getAllPedidos(usuario.email);

        if (isMounted) {
          const sortedData = data.sort((a, b) => {
            if (a.estado === 'entregado' && b.estado !== 'entregado') return 1;
            if (a.estado !== 'entregado' && b.estado === 'entregado') return -1;
            return new Date(b.fecha) - new Date(a.fecha);
          });
          setPedidos(sortedData);
          // Obtener información de sesiones únicas
          const uniqueSesionIds = Array.from(new Set(sortedData.map(d => d.sesion_mesa_id).filter(Boolean)));
          const flags = {};
          await Promise.all(uniqueSesionIds.map(async (sid) => {
            try {
              const ses = await PedidoService.getSession(sid);
              flags[sid] = ses;
            } catch (e) {
              // ignore per-session fetch errors
            }
          }));
          setSessionFlags(flags);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setPedidos([]);
        }
      } finally {
        if (isMounted && initialLoad) {
          setLoading(false);
          initialLoad = false;
        }
      }
    };

    loadPedidosConfirmados();
    const intervalId = setInterval(loadPedidosConfirmados, 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
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

  const handleCerrarMesa = async (mesaLabel, pedidosDeMesa) => {
    const numeroMesa = mesaLabel.replace('Mesa ', '');

    if (!window.confirm(`¿Estás seguro de que querés cerrar la ${mesaLabel}?`)) return;

    // 1. Agregamos la mesa al "candado" para que el setInterval no la vuelva a meter
    setMesasCerradas(prev => [...prev, mesaLabel]);

    // 2. La borramos visualmente en el acto
    setPedidos(prevPedidos => prevPedidos.filter(p => `Mesa ${p.mesa_numero}` !== mesaLabel));

    try {
      await PedidoService.cerrarMesa(numeroMesa);
      console.log(`${mesaLabel} cerrada en el servidor con éxito.`);
    } catch (err) {
      console.error("Error por detrás en el backend:", err.message);
      // Si falló el backend, quitamos el candado para que vuelva a aparecer y el mozo sepa que no se guardó
      setMesasCerradas(prev => prev.filter(m => m !== mesaLabel));
      alert(`No se pudo cerrar en el servidor: ${err.message}`);
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

  // Agrupar pedidos por mesa
  const pedidosAgrupados = pedidos.reduce((groups, pedido) => {
    const mesaKey = pedido.mesa_numero ? `Mesa ${pedido.mesa_numero}` : 'Sin Mesa';
    if (!groups[mesaKey]) {
      groups[mesaKey] = [];
    }
    groups[mesaKey].push(pedido);
    return groups;
  }, {});

  return (
    <Layout onLogout={onLogout}>
      <div style={{ ...styles.container, padding: isMobile ? '15px' : '20px' }}>
        <h2 style={{ ...styles.title, fontSize: isMobile ? '20px' : '22px' }}>Pedidos Confirmados</h2>

        {Object.entries(pedidosAgrupados)
          .filter(([mesaLabel]) => !mesasCerradas.includes(mesaLabel))
          .map(([mesaLabel, pedidosDeMesa]) => (
            <div key={mesaLabel} style={styles.tableGroup}>

              {/* HEADER DE GRUPO CON BOTÓN CONDICIONAL */}
              <div style={styles.mesaHeaderContainer}>
                <div>
                  <h3 style={styles.mesaGroupHeader}>{mesaLabel}</h3>
                  {mesaLabel !== 'Sin Mesa' && (
                    <div style={{ fontSize: '14px', color: '#2d3436', fontWeight: '600', marginTop: '-10px', marginBottom: '10px' }}>
                      Total mesa: ${pedidosDeMesa.reduce((sum, p) => {
                        const subtotal = (p.menus || []).reduce((s, m) => s + Number(m.precio_unitario) * m.cantidad, 0);
                        return sum + subtotal;
                      }, 0).toFixed(2)}
                    </div>
                  )}
                </div>
                {(() => {
                  const sesionId = pedidosDeMesa[0]?.sesion_mesa_id;
                  const tieneCuentaPedida = sesionId ? !!sessionFlags[sesionId]?.cuenta_solicitada : false;
                  const sePuedeCerrar = tieneCuentaPedida; // Sólo permitir cerrar si la sesión solicitó la cuenta
                  return mesaLabel !== 'Sin Mesa' && (
                    <button
                      onClick={() => handleCerrarMesa(mesaLabel, pedidosDeMesa)}
                      disabled={!sePuedeCerrar}
                      style={{
                        ...styles.cerrarMesaBtn,
                        ...(!sePuedeCerrar ? styles.cerrarMesaBtnDisabled : {})
                      }}
                      title={!sePuedeCerrar ? "No se puede cerrar la mesa porque aún hay pedidos en curso" : "Cerrar mesa y liberar"}
                    >
                      Cerrar Mesa
                    </button>
                  );
                })()}
              </div>

              <div style={styles.groupContent}>
                {pedidosDeMesa.map((pedido) => (
                  <div key={pedido.id} style={{
                    ...styles.card,
                    borderLeftColor: getEstadoColor(pedido.estado),
                    ...(pedido.estado === 'pagado' ? styles.cardPagado : {})
                  }}>
                    <div style={{ ...styles.cardHeader, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '8px' : '0' }}>
                      <div style={styles.headerLeft}>
                        <strong>ID Pedido: {pedido.id}</strong>
                        <span style={{ ...styles.estadoLabel, backgroundColor: getEstadoColor(pedido.estado) }}>
                          {getEstadoLabel(pedido.estado)}
                        </span>
                      </div>

                      {/* CONTENEDOR DE BOTONES DE TRANSICIÓN DE ESTADO */}
                      {pedido.estado !== 'pagado' && (
                        <div style={styles.buttonsContainer}>
                          {/* BOTÓN RETROCEDER (←) */}
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

                          {/* BOTÓN CERRAR PEDIDO (SI ES CUENTA PEDIDA) */}
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
                      )}

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
            </div>
          ))}
      </div>
    </Layout>
  );
}

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
  tableGroup: {
    marginBottom: '24px',
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e9ecef'
  },
  mesaGroupHeader: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    color: '#ff4757',
    fontWeight: '800',
    textTransform: 'uppercase',
    borderBottom: '2px solid #ff4757',
    display: 'inline-block',
    paddingBottom: '4px'
  },
  groupContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
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
  },
  mesaHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '10px',
    borderBottom: '2px solid #f1f2f6',
    marginBottom: '15px'
  },
  cerrarMesaBtn: {
    backgroundColor: '#ff4757', // Rojo para acción destructiva/cierre
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 5px rgba(255, 71, 87, 0.2)',
  },
  cerrarMesaBtnDisabled: {
    backgroundColor: '#dfe6e9',
    color: '#b2bec3',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  cerrarPedidoBtn: {
    backgroundColor: '#2ed573',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 5px rgba(46, 213, 115, 0.2)',
  },
  cardPagado: {
    backgroundColor: '#f5f6fa',
    opacity: 0.75,
  }
};

export default PedidosConfirmados;
