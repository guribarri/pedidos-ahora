import React from 'react';

const GraciasPage = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <span style={styles.icon}>👋</span>
                <h1 style={styles.title}>¡Gracias por su visita!</h1>
                <p style={styles.subtitle}>Un mozo se acercará a la mesa para traerte la cuenta y procesar el pago.</p>
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
    }
};

export default GraciasPage;