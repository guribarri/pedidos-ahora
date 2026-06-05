import { useEffect, useState, useRef } from 'react';
import MenuService from '../services/MenuService.jsx';
import PedidoService from '../services/PedidoService.jsx';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useUserContext } from '../hooks/useUserContext';

const ClientHome = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pedidosConfirmados, setPedidosConfirmados] = useState([]);
  const { numero } = useParams();
  
  const getInitialMesaNumero = () => {
    return numero || localStorage.getItem('ultimoMesaNumero') || localStorage.getItem('mesaNumero') || null;
  };

  const [mesaActual, setMesaActual] = useState(() => {
    const mesaNum = getInitialMesaNumero();
    return mesaNum ? Number(mesaNum) : null;
  });
  const [currentPedidoId, setCurrentPedidoId] = useState(() => {
    const mesaNum = getInitialMesaNumero();
    if (!mesaNum) return null;
    const saved = localStorage.getItem(`currentPedidoId_mesa_${mesaNum}`);
    return saved ? Number(saved) : null;
  });
  const [orderPanelVisible, setOrderPanelVisible] = useState(() => {
    const mesaNum = getInitialMesaNumero();
    if (!mesaNum) return false;
    return localStorage.getItem(`orderPanelVisible_mesa_${mesaNum}`) === 'true';
  });
  const [orderPanelMinimized, setOrderPanelMinimized] = useState(() => {
    const mesaNum = getInitialMesaNumero();
    if (!mesaNum) return false;
    return localStorage.getItem(`orderPanelMinimized_mesa_${mesaNum}`) === 'true';
  });
  const [sesionMesaId, setSesionMesaId] = useState(() => {
    const mesaNum = getInitialMesaNumero();
    return mesaNum ? localStorage.getItem(`sesionMesaId_mesa_${mesaNum}`) : null;
  });
  const [sesionCuentaSolicitada, setSesionCuentaSolicitada] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success');
  const notificationTimerRef = useRef(null);
  const { usuario } = useUserContext();

  const getHomeRoute = (user) => {
    const email = user?.email?.toLowerCase?.();
    if (email === 'admin@pedidiosahora.com') {
      return '/admin';
    }
    return '/';
  };

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

  useEffect(() => {
    const initMesa = async () => {
      const token = searchParams.get('token');
      // Regla estricta: si se accede por /mesa/:numero SIN token, negar acceso y redirigir
      if (numero && !token) {
        showNotification('Acceso inválido a la mesa. Escaneá el QR para entrar.', 'error');
        navigate('/', { replace: true });
        return;
      }

      if (numero && token) {
        try {
          const data = await PedidoService.accederMesa(numero, token);
          setMesaActual(data.mesaNumero);
          
          // Guardar tanto en claves genéricas como específicas de mesa
          localStorage.setItem(`mesaId_mesa_${data.mesaNumero}`, data.mesaId);
          localStorage.setItem(`sesionMesaId_mesa_${data.mesaNumero}`, data.sesionId);
          localStorage.setItem('mesaId', data.mesaId);
          localStorage.setItem('sesionMesaId', data.sesionId);
          localStorage.setItem('mesaNumero', data.mesaNumero);
          localStorage.setItem('ultimoMesaNumero', String(data.mesaNumero));
          setSesionMesaId(String(data.sesionId));

          if (data.currentPedidoId) {
            localStorage.setItem(`currentPedidoId_mesa_${data.mesaNumero}`, String(data.currentPedidoId));
            setCurrentPedidoId(data.currentPedidoId);
            setOrderPanelVisible(true);
            setOrderPanelMinimized(false);
          } else {
            localStorage.removeItem(`currentPedidoId_mesa_${data.mesaNumero}`);
            setCurrentPedidoId(null);
            setOrderPanelVisible(false);
            setOrderPanelMinimized(false);
          }
          showNotification(`Acceso exitoso a Mesa ${data.mesaNumero}`, 'success');
        } catch (error) {
          console.error('Error al acceder a la mesa:', error);
          // Si el token es inválido o falla la validación, no permitir permanecer en la página
          showNotification('Error al acceder a la mesa. Verificá el código QR.', 'error');
          navigate('/', { replace: true });
        }
      }
    };
    initMesa();
  }, [numero, searchParams]);

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

  // Effect to load per-mesa data from localStorage when routing table number (numero) changes
  useEffect(() => {
    const mesaNum = numero || localStorage.getItem('ultimoMesaNumero') || null;
    if (mesaNum) {
      const parsedNum = Number(mesaNum);
      setMesaActual(parsedNum);
      localStorage.setItem('ultimoMesaNumero', String(mesaNum));
      localStorage.setItem('mesaNumero', String(mesaNum));

      const savedPedidoId = localStorage.getItem(`currentPedidoId_mesa_${mesaNum}`);
      setCurrentPedidoId(savedPedidoId ? Number(savedPedidoId) : null);

      const savedPanelVisible = localStorage.getItem(`orderPanelVisible_mesa_${mesaNum}`);
      setOrderPanelVisible(savedPanelVisible === 'true');

      const savedPanelMinimized = localStorage.getItem(`orderPanelMinimized_mesa_${mesaNum}`);
      setOrderPanelMinimized(savedPanelMinimized === 'true');

      const mesaId = localStorage.getItem(`mesaId_mesa_${mesaNum}`);
      const savedSesionMesaId = localStorage.getItem(`sesionMesaId_mesa_${mesaNum}`);
      setSesionMesaId(savedSesionMesaId || null);

      if (mesaId) {
        localStorage.setItem('mesaId', mesaId);
      } else {
        localStorage.removeItem('mesaId');
      }
      if (savedSesionMesaId) {
        localStorage.setItem('sesionMesaId', savedSesionMesaId);
      } else {
        localStorage.removeItem('sesionMesaId');
      }
    } else {
      setMesaActual(null);
      setCurrentPedidoId(null);
      setSesionMesaId(null);
      setOrderPanelVisible(false);
      setOrderPanelMinimized(false);
      localStorage.removeItem('mesaId');
      localStorage.removeItem('sesionMesaId');
    }
  }, [numero]);

  useEffect(() => {
    if (!mesaActual) return;
    if (currentPedidoId !== null) {
      localStorage.setItem(`currentPedidoId_mesa_${mesaActual}`, String(currentPedidoId));
      localStorage.setItem('currentPedidoId', String(currentPedidoId));
    } else {
      localStorage.removeItem(`currentPedidoId_mesa_${mesaActual}`);
      localStorage.removeItem('currentPedidoId');
    }
  }, [currentPedidoId, mesaActual]);

  useEffect(() => {
    if (!mesaActual) return;
    localStorage.setItem(`orderPanelVisible_mesa_${mesaActual}`, String(orderPanelVisible));
    localStorage.setItem('orderPanelVisible', String(orderPanelVisible));
  }, [orderPanelVisible, mesaActual]);

  useEffect(() => {
    if (!mesaActual) return;
    localStorage.setItem(`orderPanelMinimized_mesa_${mesaActual}`, String(orderPanelMinimized));
    localStorage.setItem('orderPanelMinimized', String(orderPanelMinimized));
  }, [orderPanelMinimized, mesaActual]);

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

  const handleMinimizeDetallePedido = () => {
    setOrderPanelVisible(false);
    setOrderPanelMinimized(true);
  };

  // Refresh ALL orders for the current session
  useEffect(() => {
    if (!sesionMesaId) {
      return;
    }

    const refreshPedidos = async () => {
      try {
        const pedidos = await PedidoService.getPedidosBySession(sesionMesaId);
        // Obtener estado de sesión (cuenta_solicitada)
        try {
          const ses = await PedidoService.getSession(sesionMesaId);
          setSesionCuentaSolicitada(!!ses?.cuenta_solicitada);
        } catch (e) {
          // ignore
        }
        const pedidosConTotal = pedidos.map(pedido => {
          const totalPedido = (pedido.menus || []).reduce(
            (sum, menu) => sum + Number(menu.precio_unitario) * (menu.cantidad ?? 1),
            0
          );
          return { ...pedido, total: totalPedido };
        });
        setPedidosConfirmados(pedidosConTotal);

        // Actualizar currentPedidoId al último pedido que NO esté entregado o pagado
        if (pedidosConTotal.length > 0) {
          const ultimoPedidoActivo = pedidosConTotal.find(p => p.estado === 'confirmado' || p.estado === 'en_preparacion');
          if (ultimoPedidoActivo) {
            setCurrentPedidoId(ultimoPedidoActivo.id);
          } else {
            // Si todos están entregados, el próximo pedido será uno nuevo
            setCurrentPedidoId(null);
          }
        }
      } catch (error) {
        console.error('Error actualizando pedidos de la sesión:', error);
      }
    };

    refreshPedidos();
    const intervalId = setInterval(refreshPedidos, 5000);
    return () => clearInterval(intervalId);
  }, [sesionMesaId]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmado':
        return '#ff4757';
      case 'en_preparacion':
        return '#ffa502';
      case 'entregado':
        return '#2ed573';
      case 'cuenta_pedida':
        return '#1e90ff';
      case 'pagado':
        return '#a4b0be';
      default:
        return '#999';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'confirmado':
        return 'Confirmado';
      case 'en_preparacion':
        return 'En Preparación';
      case 'entregado':
        return 'Entregado';
      case 'cuenta_pedida':
        return 'Cuenta Pedida 💰';
      case 'pagado':
        return 'Pagado ✅';
      default:
        return estado;
    }
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

  const handlePedirCuenta = async () => {
    try {
      // Validar que TODOS los pedidos estén entregados
      const todosEntregados = pedidosConfirmados.length > 0 && pedidosConfirmados.every(p => p.estado === 'entregado');
      if (!todosEntregados) {
        showNotification('Para pedir la cuenta, todos los pedidos deben estar entregados.', 'info');
        return;
      }

      // Solicitar la cuenta a nivel de sesión/mesa
      if (!sesionMesaId) {
        showNotification('No se encontró la sesión de mesa activa.', 'error');
        return;
      }

      await PedidoService.solicitarCuenta(sesionMesaId);
      showNotification('Cuenta solicitada. Gracias.', 'success');
      navigate('/gracias', { replace: true });
    } catch (err) {
      alert("Hubo un error al solicitar la cuenta. Por favor, avise al mozo.");
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

      const userEmail = usuario?.email;
      
      // Intentamos crear un nuevo pedido siempre que se confirme, 
      // vinculándolo a la sesión actual a través de los headers en PedidoService
      const response = await PedidoService.createPedido(menusPayload, userEmail);

      const nuevoPedido = response?.pedido || response;
      const totalNuevoPedido = (nuevoPedido.menus || []).reduce(
        (sum, menu) => sum + Number(menu.precio_unitario) * (menu.cantidad ?? 1),
        0
      );

      // Actualizar la lista de pedidos confirmados agregando el nuevo
      // Usamos una función de actualización para asegurarnos de tener el estado más reciente
      setPedidosConfirmados(prev => {
        // Evitar duplicados por ID si el refresh ya lo trajo
        const existe = prev.some(p => p.id === nuevoPedido.id);
        if (existe) return prev;
        return [{ ...nuevoPedido, total: totalNuevoPedido }, ...prev];
      });

      setCurrentPedidoId(nuevoPedido.id);
      setOrderPanelVisible(true);
      setOrderPanelMinimized(false);

      showNotification('Pedido confirmado correctamente');
      setSelectedMenus([]);
      setSidebarVisible(false);
    } catch (e) {
      console.error(e);
      showNotification(e?.message || 'Error al confirmar el pedido', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCerrarDetallePedido = () => {
    setOrderPanelVisible(false);
    setOrderPanelMinimized(true);
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

      {pedidosConfirmados.length > 0 && orderPanelVisible && (() => {
        const totalGeneral = pedidosConfirmados.reduce((sum, p) => sum + (p.total || 0), 0);
        // Nuevo: habilitar "Pedir cuenta" sólo si TODOS los pedidos están en 'entregado'
        const todosEntregados = pedidosConfirmados.length > 0 && pedidosConfirmados.every(p => p.estado === 'entregado');
        const todosPagados = pedidosConfirmados.every(p => p.estado === 'pagado');
        return (
          <div style={styles.orderPanel}>
            <div style={styles.orderPanelHeader}>
              <div>
                <h2 style={styles.modalTitle}>Detalle de pedidos</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <p style={styles.modalSubtitle}>{pedidosConfirmados.length} pedido{pedidosConfirmados.length > 1 ? 's' : ''}</p>
                  {mesaActual && <span style={styles.mesaBadge}>Mesa {mesaActual}</span>}
                </div>
              </div>
              <button onClick={handleCerrarDetallePedido} style={styles.modalCloseButton} aria-label="Minimizar detalle de pedido">
                —
              </button>
            </div>
            <div style={styles.modalStatusRow}>
              <span style={styles.modalTotalLabel}>Total mesa:</span>
              <strong style={styles.modalTotalValue}>${totalGeneral.toFixed(2)}</strong>
            </div>
            <div style={{ ...styles.modalList, maxHeight: '60vh', overflowY: 'auto' }}>
              {pedidosConfirmados.map((pedido) => (
                <div key={pedido.id} style={{ marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px' }}>Pedido #{pedido.id}</strong>
                    <span style={{ ...styles.modalStatus, backgroundColor: getEstadoColor(pedido.estado), padding: '4px 8px', fontSize: '11px' }}>
                      {getEstadoLabel(pedido.estado)}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 8px 0', fontSize: '13px', color: '#666' }}>Subtotal: ${pedido.total.toFixed(2)}</p>
                  {pedido.menus.map((menu, index) => (
                    <div key={index} style={styles.modalItem}>
                      <div style={styles.modalItemHeader}>
                        <h3 style={styles.modalItemTitle}>{menu.nombre}</h3>
                        <span style={styles.modalItemCantidad}>x{menu.cantidad}</span>
                      </div>
                      <p style={styles.modalItemDescription}>{menu.descripcion}</p>
                      <p style={styles.modalItemPrice}>Precio unitario: ${Number(menu.precio_unitario).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={styles.modalActionsRow}>
              <button onClick={handleCerrarDetallePedido} style={styles.modalActionButton}>
                Minimizar
              </button>
            </div>
                  <div style={{ marginTop: '16px', width: '100%' }}>
                    <button
                      onClick={handlePedirCuenta}
                      disabled={!todosEntregados || sesionCuentaSolicitada}
                      style={{
                        ...styles.cuentaBtn,
                        ...(!todosEntregados || sesionCuentaSolicitada ? styles.cuentaBtnDisabled : {})
                      }}
                    >
                      {sesionCuentaSolicitada ? 'Cuenta solicitada' : 'Pedir cuenta'}
                    </button>
                  </div>
          </div>
        );
      })()}
      <nav style={{ ...styles.navbar, padding: isMobile ? '0 15px' : isTablet ? '0 25px' : '0 40px', height: isMobile ? '50px' : '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '15px' }}>
          <div style={{ ...styles.brand, fontSize: isMobile ? '18px' : '24px' }} onClick={() => navigate('/')}>
            <span style={{ color: '#2d3436' }}>
              P{!isMobile && 'edidos'}
            </span>
            <span style={{ color: '#ff4757' }}>
              A{!isMobile && 'hora'}!
            </span>
          </div>
          {mesaActual && (
            <div style={{
              backgroundColor: '#ff4757',
              color: '#fff',
              padding: isMobile ? '4px 10px' : '6px 14px',
              borderRadius: '50px',
              fontSize: isMobile ? '12px' : '15px',
              fontWeight: '800',
              boxShadow: '0 4px 10px rgba(255, 71, 87, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff'
            }}>
              MESA {mesaActual}
            </div>
          )}
        </div>
        {pedidosConfirmados.length > 0 && !orderPanelVisible && (
          <button
            onClick={() => {
              setOrderPanelVisible(true);
              setOrderPanelMinimized(false);
            }}
            style={styles.openOrderPanelButton}
            aria-label="Mostrar estado del pedido"
          >
            Ver estado del pedido ({pedidosConfirmados.length})
          </button>
        )}
      </nav>
      {pedidosConfirmados.length > 0 && orderPanelMinimized && (() => {
        const totalGeneral = pedidosConfirmados.reduce((sum, p) => sum + (p.total || 0), 0);
        return (
          <div style={styles.minimizedOrderPanel}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ display: 'block' }}>{pedidosConfirmados.length} pedido{pedidosConfirmados.length > 1 ? 's' : ''}</strong>
                {mesaActual && <span style={styles.mesaBadgeSmall}>Mesa {mesaActual}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: '#333', fontWeight: '700' }}>Total: ${totalGeneral.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setOrderPanelVisible(true);
                setOrderPanelMinimized(false);
              }}
              style={styles.openOrderPanelButton}
            >
              Abrir
            </button>
          </div>
        );
      })()}
      <main style={styles.mainContent}>
        <h1 style={styles.title}>
          Bienvenido{usuario?.name ? `, ${usuario.name}` : ''}
        </h1>
        <p style={styles.subtitle}>Seleccioná el menú que quieras y confirmá tu pedido.</p>

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
    display: 'flex',
    flexDirection: 'column',
    minHeight: '260px',
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
    marginTop: 'auto',
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
  orderPanel: {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: 'min(420px, 95vw)',
    maxHeight: '80vh',
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
    zIndex: 10000,
    overflowY: 'auto',
  },
  orderPanelHeader: {
    position: 'relative',
    paddingTop: '8px',
    marginBottom: '16px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '20px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#2d3436',
  },
  modalSubtitle: {
    margin: '6px 0 0 0',
    color: '#666',
    fontSize: '14px',
  },
  modalCloseButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '24px',
    color: '#999',
    lineHeight: '1',
  },
  modalStatusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  modalStatus: {
    color: '#fff',
    padding: '8px 14px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '13px',
    letterSpacing: '0.4px',
  },
  modalTotalLabel: {
    color: '#555',
    fontSize: '15px',
  },
  modalTotalValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2d3436',
  },
  modalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px',
  },
  modalItem: {
    backgroundColor: '#f8f9fc',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e8eaf2',
  },
  modalItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '10px',
  },
  modalItemTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#2d3436',
  },
  modalItemCantidad: {
    color: '#555',
    fontWeight: '700',
    fontSize: '14px',
  },
  modalItemDescription: {
    margin: '0 0 8px 0',
    color: '#555',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  modalItemPrice: {
    margin: 0,
    fontSize: '14px',
    color: '#333',
    fontWeight: '600',
  },
  modalActionButton: {
    width: '100%',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
  },
  mesaBadge: {
    backgroundColor: '#ff4757',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  mesaBadgeSmall: {
    backgroundColor: '#ff4757',
    color: '#fff',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  modalActionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    flexWrap: 'wrap',
  },
  modalSecondaryButton: {
    width: '100%',
    backgroundColor: '#f1f2f6',
    color: '#333',
    border: '1px solid #ced6e0',
    borderRadius: '10px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
  },
  openOrderPanelButton: {
    backgroundColor: '#ff4757',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
  },
  minimizedOrderPanel: {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: 'min(360px, 90vw)',
    backgroundColor: '#fff',
    borderRadius: '18px',
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
    padding: '16px 18px',
    zIndex: 10001,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  cuentaBtn: {
    width: '100%',
    backgroundColor: '#007bff', // Color principal de tu app
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s, opacity 0.2s',
    boxSizing: 'border-box',
  },
  cuentaBtnDisabled: {
    backgroundColor: '#dfe6e9', // Gris apagado
    color: '#b2bec3',
    cursor: 'not-allowed',
  }
};

export default ClientHome;
