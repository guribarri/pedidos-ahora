import { useState, useEffect } from 'react';
import { useUserContext } from '../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children, onLogout, mostrarBotonAgregar = true, mostrarBotonPedidosConfirmados = true }) => {
    const { usuario } = useUserContext();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={styles.page}>
            <nav style={{ ...styles.navbar, padding: isMobile ? '0 15px' : '0 40px' }}>

                <div style={styles.brand} onClick={() => navigate('/')}>
                    <span style={{ color: '#2d3436' }}>
                        P{!isMobile && 'edidos'}
                    </span>
                    <span style={{ color: '#ff4757' }}>
                        A{!isMobile && 'hora'}!
                    </span>
                </div>

                <div style={styles.navActions}>
                    {mostrarBotonAgregar && (
                        <button onClick={() => navigate('/admin/menu-form')} style={styles.addBtn}>
                            {isMobile ? '+' : '+ Agregar menú'}
                        </button>
                    )}

                    {mostrarBotonPedidosConfirmados && (
                        <button onClick={() => navigate('/admin/pedidos-confirmados')} style={styles.addBtn}>
                            {isMobile ? 'Pedidos' : 'Ver Pedidos'}
                        </button>
                    )}

                    <div style={styles.userSection}>
                        <div style={styles.userBadge}>
                            <span style={styles.userIcon}>👤</span>
                            {!isMobile && <span style={styles.userName}>{usuario?.email.split('@')[0]}</span>}
                        </div>

                        <button
                            onClick={() => {
                                console.log("Ejecutando Logout...");
                                if (onLogout) onLogout();
                            }}
                            style={styles.logoutBtn}
                        >
                            {isMobile ? 'Salir' : 'Cerrar Sesión'}
                        </button>
                    </div>
                </div>
            </nav>

            <main style={{ ...styles.mainContent, padding: isMobile ? '20px 10px' : '40px 20px' }}>
                {children}
            </main>
        </div>
    );
};

const styles = {
    page: { fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' },
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 },
    brand: { fontSize: '22px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    brandText: { marginLeft: '2px', fontWeight: '800', color: '#2d3436' }, // Estilo para el resto del texto
    navActions: { display: 'flex', alignItems: 'center', gap: '10px' },
    addBtn: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer' },
    userSection: { display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #eee', paddingLeft: '10px' },
    userBadge: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f1f2f6', padding: '5px 10px', borderRadius: '15px' },
    userName: { fontSize: '13px', fontWeight: '500' },
    logoutBtn: { backgroundColor: 'transparent', color: '#ff4757', border: '1px solid #ff4757', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    mainContent: { display: 'flex', justifyContent: 'center' }
};

export default Layout;