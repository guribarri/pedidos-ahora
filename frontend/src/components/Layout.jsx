import { useState, useEffect } from 'react';
import { useUserContext } from '../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children, onLogout, mostrarBotonAgregar = true, mostrarBotonPedidosConfirmados = true }) => {
    const { usuario } = useUserContext();
    const navigate = useNavigate();

    const getHomeRoute = (user) => {
        const email = user?.email?.toLowerCase?.();
        if (email === 'admin@pedidiosahora.com') {
            return '/admin';
        }
        return '/';
    };
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={styles.page}>
            <nav style={{ ...styles.navbar, padding: isMobile ? '0 12px' : '0 40px', height: isMobile ? '60px' : '70px' }}>

<div style={{ ...styles.brand, fontSize: isMobile ? '18px' : '22px' }} onClick={() => navigate(getHomeRoute(usuario))}>
                    <span style={{ color: '#2d3436' }}>
                        P{!isMobile && 'edidos'}
                    </span>
                    <span style={{ color: '#ff4757' }}>
                        A{!isMobile && 'hora'}!
                    </span>
                </div>

                <div style={{ ...styles.navActions, gap: isMobile ? '6px' : '10px' }}>
                    {mostrarBotonAgregar && (
                        <button onClick={() => navigate('/admin/menu-form')} style={{ ...styles.addBtn, padding: isMobile ? '6px 12px' : '8px 15px', fontSize: isMobile ? '12px' : '14px' }}>
                            {isMobile ? '+' : '+ Agregar menú'}
                        </button>
                    )}

                    {mostrarBotonPedidosConfirmados && (
                        <button onClick={() => navigate('/admin/pedidos-confirmados')} style={{ ...styles.addBtn, padding: isMobile ? '6px 12px' : '8px 15px', fontSize: isMobile ? '12px' : '14px' }}>
                            {isMobile ? 'Pedidos' : 'Ver Pedidos'}
                        </button>
                    )}

                    <div style={{ ...styles.userSection, gap: isMobile ? '4px' : '8px', paddingLeft: isMobile ? '6px' : '10px' }}>
                        <div style={{ ...styles.userBadge, padding: isMobile ? '4px 8px' : '5px 10px' }}>
                            <span style={{ ...styles.userIcon, fontSize: isMobile ? '14px' : '16px' }}>👤</span>
                            {!isMobile && <span style={{ ...styles.userName, fontSize: isMobile ? '11px' : '13px' }}>{usuario?.email.split('@')[0]}</span>}
                        </div>

                        <button
                            onClick={() => {
                                console.log("Ejecutando Logout...");
                                if (onLogout) onLogout();
                            }}
                            style={{ ...styles.logoutBtn, padding: isMobile ? '4px 8px' : '6px 10px', fontSize: isMobile ? '11px' : '12px' }}
                        >
                            {isMobile ? 'Salir' : 'Cerrar Sesión'}
                        </button>
                    </div>
                </div>
            </nav>

            <main style={{ ...styles.mainContent, padding: isMobile ? '15px' : '40px 20px' }}>
                {children}
            </main>
        </div>
    );
};

const styles = {
    page: { fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' },
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 },
    brand: { fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' },
    brandText: { marginLeft: '2px', fontWeight: '800', color: '#2d3436' },
    navActions: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' },
    addBtn: { backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '600', cursor: 'pointer', transition: '0.2s ease' },
    userSection: { display: 'flex', alignItems: 'center', borderLeft: '1px solid #eee' },
    userBadge: { display: 'flex', alignItems: 'center', backgroundColor: '#f1f2f6', borderRadius: '15px' },
    userIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    userName: { fontWeight: '500' },
    logoutBtn: { backgroundColor: 'transparent', color: '#ff4757', border: '1px solid #ff4757', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: '0.2s ease' },
    mainContent: { display: 'flex', justifyContent: 'center' }
};

export default Layout;