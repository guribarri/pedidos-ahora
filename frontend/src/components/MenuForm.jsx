import { useState, useEffect } from 'react';
import MenuService from '../services/MenuService';
import { useUserContext } from '../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout.jsx';

const MenuForm = ({ onLogout, initialData = null, onClose, embed = false }) => {
    const isEdit = !!initialData;
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
            setNombre(initialData.nombre || '');
            setDescripcion(initialData.descripcion || '');
            setPrecio(initialData.precio != null ? String(initialData.precio) : '');
        }
    }, [initialData]);

    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                if (success && !isEdit) navigate('/');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success, navigate, isEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoadingForm(true);
        const precioNumerico = precio === '' ? undefined : Number(precio);

        if (isEdit) {
            MenuService.editMenu(initialData.id, nombre, descripcion, precioNumerico, usuario.email)
                .then(() => {
                    setSuccess(true);
                    if (onClose) onClose();
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoadingForm(false));
        } else {
            MenuService.createMenu(nombre, descripcion, precioNumerico, usuario.email)
                .then(() => {
                    setSuccess(true);
                    if (embed && onClose) onClose();
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoadingForm(false));
        }
    };

    if (loading) return <div style={styles.centered}>Cargando...</div>;
    if (!usuario) return <div style={styles.centered}>Sesión no válida</div>;

    const content = (
        <div style={styles.container}>
            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>✅ ¡Menú creado con éxito!</div>}

            <form style={styles.card} onSubmit={handleSubmit}>
                    <h2 style={styles.title}>{isEdit ? 'Editar Menú' : 'Agregar Nuevo Menú'}</h2>
                    <p style={styles.subtitle}>{isEdit ? 'Modificá los datos del plato' : 'Ingresá los datos del plato para tus clientes'}</p>

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
                            style={{ ...styles.input, height: '140px', resize: 'vertical' }}
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

                    <button type="submit" disabled={loadingForm} style={styles.mainBtn}>
                        {loadingForm ? 'Cargando...' : (isEdit ? 'Guardar cambios' : 'Guardar Menú')}
                    </button>

                    <button type="button" onClick={() => (embed && onClose ? onClose() : navigate('/'))} style={styles.secBtn}>
                        {embed ? 'Cerrar' : 'Volver al inicio'}
                    </button>
                </form>
            </div>
    );

    if (embed) return content;

    return (
        <Layout onLogout={onLogout} mostrarBotonAgregar={false}>
            {content}
        </Layout>
    );
};

const styles = {
    centered: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' },
    container: { width: '100%', maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' },
    card: { backgroundColor: '#fff', padding: '36px', borderRadius: '18px', boxShadow: '0 12px 40px rgba(15,23,42,0.06)' },
    title: { margin: '0 0 12px 0', fontSize: '26px', color: '#2d3436' },
    subtitle: { margin: '0 0 22px 0', fontSize: '15px', color: '#636e72' },
    field: { marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#2d3436' },
    input: { padding: '14px', borderRadius: '10px', border: '1px solid #e6e9ee', fontSize: '15px', transition: '0.2s' },
    mainBtn: { width: '100%', backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '12px' },
    secBtn: { width: '100%', backgroundColor: 'transparent', color: '#636e72', border: 'none', padding: '12px', fontSize: '14px', cursor: 'pointer' },
    errorBox: { backgroundColor: '#ff4757', color: '#fff', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' },
    successBox: { backgroundColor: '#2ed573', color: '#fff', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }
};

export default MenuForm;