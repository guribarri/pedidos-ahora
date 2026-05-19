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
    const [hasChanges, setHasChanges] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const isFormValid =
        nombre.trim().length > 0 &&
        descripcion.trim().length > 0 &&
        precio !== '' &&
        Number(precio) > 0;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre);
            setDescripcion(initialData.descripcion);
            setPrecio(initialData.precio);
        }
    }, [initialData]);

    useEffect(() => {
        if (initialData) {
            const isChanged =
                nombre !== (initialData.nombre || '') ||
                descripcion !== (initialData.descripcion || '') ||
                Number(precio) !== Number(initialData.precio);

            setHasChanges(isChanged);
        } else {
            setHasChanges(nombre.trim().length > 0);
        }
    }, [nombre, descripcion, precio, initialData]);

    useEffect(() => {
        if (error || success) {
            const duration = error ? 4000 : 1200; // errores muestran más tiempo
            const timer = setTimeout(() => {
                if (error) setError(null);
                if (success) {
                    setSuccess(false);
                    if (onSuccess) onSuccess();
                    if (!isModal) navigate('/admin');
                }
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [error, success, navigate, isModal, onSuccess]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoadingForm(true);
        const cleanNombre = nombre.trim();
        const cleanDesc = descripcion.trim();
        const precioNumerico = precio === '' ? undefined : Number(precio);

        if (!isFormValid) {
            setError("Por favor, completá todos los campos correctamente.");
            setLoadingForm(false);
            return;
        }
        if (initialData && initialData.id) {
            MenuService.updateMenu(initialData.id, nombre, descripcion, precioNumerico, usuario.email)
                .then(() => setSuccess(true))
                .catch((err) => {
                    const serverMsg = err?.response?.data?.error || err?.message || 'Hubo un error al actualizar el menú';
                    setError(serverMsg);
                })
                .finally(() => setLoadingForm(false));
        } else {
            MenuService.createMenu(cleanNombre, cleanDesc, precioNumerico, usuario.email)
                .then(() => setSuccess(true))
                .catch((err) => {
                    const serverMsg = err?.response?.data?.error || err?.message || 'Hubo un error al crear el menú';
                    setError(serverMsg);
                })
                .finally(() => setLoadingForm(false));
        }
    };

    if (loading) return <div style={styles.centered}>Cargando...</div>;
    if (!usuario) return <div style={styles.centered}>Sesión no válida</div>;

    const formContent = (
        <div style={isModal ? { width: '100%' } : { ...styles.container, maxWidth: isMobile ? '100%' : '450px', padding: isMobile ? '15px' : '0' }}>
            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>✅ ¡Menú {initialData ? 'actualizado' : 'creado'} con éxito!</div>}

            <form style={isModal ? { padding: isMobile ? '20px' : '0' } : { ...styles.card, padding: isMobile ? '25px 15px' : '35px' }} onSubmit={handleSubmit}>
                <h2 style={{ ...styles.title, fontSize: isMobile ? '22px' : '24px' }}>{initialData ? 'Editar Menú' : 'Agregar Nuevo Menú'}</h2>
                <p style={{ ...styles.subtitle, fontSize: isMobile ? '13px' : '14px' }}>{initialData ? 'Modificá los datos del plato' : 'Ingresá los datos del plato para tus clientes'}</p>

                <div style={styles.field}>
                    <label style={styles.label}>Nombre</label>
                    <input
                        style={{ ...styles.input, padding: isMobile ? '14px' : '12px', fontSize: isMobile ? '16px' : '15px' }}
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
                        style={{ ...styles.input, height: '90px', resize: 'none', padding: isMobile ? '14px' : '12px', fontSize: isMobile ? '16px' : '15px' }}
                        placeholder="Detalles del plato..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Precio</label>
                    <input
                        style={{ ...styles.input, padding: isMobile ? '14px' : '12px', fontSize: isMobile ? '16px' : '15px' }}
                        type="number"
                        placeholder="0.00"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: isMobile ? '8px' : '10px', marginTop: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                    {isModal && (
                        <button type="button" onClick={onCancel} style={{ ...styles.secBtn, flex: isMobile ? 1 : 'unset', backgroundColor: '#f1f2f6', color: '#333', padding: isMobile ? '14px' : '10px', fontSize: isMobile ? '15px' : '14px' }}>
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loadingForm || !hasChanges || !isFormValid}
                        style={{
                            ...styles.mainBtn,
                            flex: isMobile ? 1 : '2',
                            marginTop: 0,
                            opacity: (loadingForm || !hasChanges || !isFormValid) ? 0.6 : 1,
                            cursor: (loadingForm || !hasChanges || !isFormValid) ? 'not-allowed' : 'pointer',
                            padding: isMobile ? '14px' : '14px',
                            fontSize: isMobile ? '15px' : '16px',
                        }}
                    >
                        {loadingForm ? 'Cargando...' : (initialData ? 'Guardar Cambios' : 'Guardar Menú')}
                    </button>
                </div>

                {!isModal && (
                    <button type="button" onClick={() => navigate('/admin')} style={{ ...styles.secBtn, padding: isMobile ? '14px' : '10px', fontSize: isMobile ? '15px' : '14px', marginTop: isMobile ? '10px' : '0' }}>
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
    container: { width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '15px', margin: '0 auto' },
    card: { backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    title: { margin: '0 0 8px 0', fontSize: '24px', color: '#2d3436', fontWeight: '600' },
    subtitle: { margin: '0 0 25px 0', fontSize: '14px', color: '#636e72' },
    field: { marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#2d3436' },
    input: { borderRadius: '8px', border: '1px solid #ddd', transition: '0.2s ease, box-shadow 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit' },
    mainBtn: { backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', transition: '0.2s ease' },
    secBtn: { backgroundColor: 'transparent', color: '#636e72', border: 'none', cursor: 'pointer', borderRadius: '8px', transition: '0.2s ease' },
    errorBox: { backgroundColor: '#ff4757', color: '#fff', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500', marginBottom: '15px' },
    successBox: { backgroundColor: '#2ed573', color: '#fff', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500', marginBottom: '15px' }
};

export default MenuForm;