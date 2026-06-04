import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PedidoService from '../services/PedidoService.jsx';

const GraciasPage = () => {
    const navigate = useNavigate();
    const [tienePedidosPendientes, setTienePedidosPendientes] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mesaNumero, setMesaNumero] = useState(null);

    useEffect(() => {
        const checkPedidos = async () => {
            const sesionId = localStorage.getItem('sesionMesaId');
            const mesaNum = localStorage.getItem('ultimoMesaNumero') || localStorage.getItem('mesaNumero');
            setMesaNumero(mesaNum);

            if (!sesionId) {
                setLoading(false);
                return;
            }

            try {
                const pedidos = await PedidoService.getPedidosBySession(sesionId);
                // Si hay algún pedido que NO sea 'cuenta_pedida' o 'pagado', 
                // significa que aún hay actividad pendiente en la mesa.
                const pendientes = pedidos.some(p => p.estado !== 'cuenta_pedida' && p.estado !== 'pagado');
                
                setTienePedidosPendientes(pendientes);

                if (!pendientes) {
                    // Si NO hay pendientes, limpiamos la sesión local
                    limpiarSesionLocal(mesaNum);
                }
            } catch (error) {
                console.error('Error al verificar pedidos en GraciasPage:', error);
            } finally {
                setLoading(false);
            }
        };

        checkPedidos();
    }, []);

    const limpiarSesionLocal = (mesaNum) => {
        if (mesaNum) {
            localStorage.removeItem(`mesaId_mesa_${mesaNum}`);
            localStorage.removeItem(`sesionMesaId_mesa_${mesaNum}`);
            localStorage.removeItem(`currentPedidoId_mesa_${mesaNum}`);
            localStorage.removeItem(`orderPanelVisible_mesa_${mesaNum}`);
            localStorage.removeItem(`orderPanelMinimized_mesa_${mesaNum}`);
        }
        localStorage.removeItem('mesaId');
        localStorage.removeItem('sesionMesaId');
        localStorage.removeItem('currentPedidoId');
        localStorage.removeItem('mesaNumero');
        localStorage.removeItem('ultimoMesaNumero');
        console.log('Sesión local de la mesa destruida con éxito.');
    };

    const handleBackToHome = () => {
        if (mesaNumero) {
            navigate(`/mesa/${mesaNumero}`);
        } else {
            navigate('/');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <span style={styles.icon}>👋</span>
                <h1 style={styles.title}>¡Gracias por su visita!</h1>
                <p style={styles.subtitle}>
                    {tienePedidosPendientes 
                        ? "Has solicitado la cuenta para tus pedidos entregados. El resto de tus pedidos siguen en curso."
                        : "Un mozo se acercará a la mesa para traerte la cuenta y procesar el pago."}
                </p>
                
                {loading ? (
                    <p style={{ marginTop: '20px', color: '#999' }}>Cargando...</p>
                ) : (
                    tienePedidosPendientes && (
                        <button 
                            onClick={handleBackToHome}
                            style={styles.backButton}
                        >
                            Regresar al Home
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        padding: '20px',
        boxSizing: 'border-box'
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '40px 30px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
    },
    icon: {
        fontSize: '64px',
        display: 'block',
        marginBottom: '20px'
    },
    title: {
        fontSize: '28px',
        color: '#2d3436',
        margin: '0 0 12px 0',
        fontWeight: '700'
    },
    subtitle: {
        color: '#636e72',
        fontSize: '15px',
        lineHeight: '1.6',
        margin: 0
    },
    backButton: {
        marginTop: '25px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        width: '100%',
        transition: 'background-color 0.2s'
    }
};

export default GraciasPage;