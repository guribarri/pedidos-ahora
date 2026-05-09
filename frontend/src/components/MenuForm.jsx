import { useState, useEffect } from 'react';
import MenuService from '../services/MenuService';
import { useUserContext } from '../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout.jsx';

const MenuForm = ({ onLogout, isModal = false, initialData = null, onSuccess, onCancel }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { usuario, loading } = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre);
            setDescripcion(initialData.descripcion);
            setPrecio(initialData.precio);
        }
    }, [initialData]);

    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                if (success) {
                    setSuccess(false);
                    if (onSuccess) onSuccess();
                    if (!isModal) navigate('/');
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [error, success, navigate, isModal, onSuccess]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoadingForm(true);
        const precioNumerico = precio === '' ? undefined : Number(precio);

        if (initialData && initialData.id) {
            MenuService.updateMenu(initialData.id, nombre, descripcion, precioNumerico, usuario.email)
                .then(() => setSuccess(true))
                .catch((err) => setError(err.message))
                .finally(() => setLoadingForm(false));
        } else {
            MenuService.createMenu(nombre, descripcion, precioNumerico, usuario.email)
                .then(() => setSuccess(true))
                .catch((err) => setError(err.message))
                .finally(() => setLoadingForm(false));
        }
    };

    if (loading) return <div style={styles.centered}>Cargando...</div>;
    if (!usuario) return <div style={styles.centered}>Sesión no válida</div>;

    const formContent = (
        <div style={isModal ? { width: '100%' } : styles.container}>
            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>✅ ¡Menú {initialData ? 'actualizado' : 'creado'} con éxito!</div>}

            <form style={isModal ? {} : styles.card} onSubmit={handleSubmit}>
                <h2 style={styles.title}>{initialData ? 'Editar Menú' : 'Agregar Nuevo Menú'}</h2>
                <p style={styles.subtitle}>{initialData ? 'Modificá los datos del plato' : 'Ingresá los datos del plato para tus clientes'}</p>

                <div style={styles.field}>
                    <label style={styles.label}>Nombre</label>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Ej: Milanesa con papas"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Descripción</label>
                    <textarea
                        style={{ ...styles.input, height: '90px', resize: 'none' }}
                        placeholder="Detalles del plato..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Precio</label>
                    <input
                        style={styles.input}
                        type="number"
                        placeholder="0.00"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {isModal && (
                        <button type="button" onClick={onCancel} style={{ ...styles.secBtn, flex: 1, backgroundColor: '#f1f2f6', color: '#333' }}>
                            Cancelar
                        </button>
                    )}
                    <button type="submit" disabled={loadingForm} style={{ ...styles.mainBtn, flex: 2, marginTop: 0 }}>
                        {loadingForm ? 'Cargando...' : (initialData ? 'Guardar Cambios' : 'Guardar Menú')}
                    </button>
                </div>

                {!isModal && (
                    <button type="button" onClick={() => navigate('/')} style={styles.secBtn}>
                        Volver al inicio
                    </button>
                )}
            </form>
        </div>
    );

    if (isModal) return formContent;

    return (
        <Layout onLogout={onLogout} mostrarBotonAgregar={false}>
            {formContent}
        </Layout>
    );
};

const styles = {
    centered: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' },
    container: { width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '15px' },
    card: { backgroundColor: '#fff', padding: '35px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    title: { margin: '0 0 8px 0', fontSize: '24px', color: '#2d3436' },
    subtitle: { margin: '0 0 25px 0', fontSize: '14px', color: '#636e72' },
    field: { marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#2d3436' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', transition: '0.2s', boxSizing: 'border-box' },
    mainBtn: { backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
    secBtn: { backgroundColor: 'transparent', color: '#636e72', border: 'none', padding: '10px', fontSize: '14px', cursor: 'pointer', borderRadius: '8px' },
    errorBox: { backgroundColor: '#ff4757', color: '#fff', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' },
    successBox: { backgroundColor: '#2ed573', color: '#fff', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }
};

export default MenuForm;