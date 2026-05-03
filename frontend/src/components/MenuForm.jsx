import { useState, useEffect } from 'react';
import './MenuForm.css';
import MenuService from '../services/MenuService';
import { useUserContext } from '../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';

const MenuForm = () => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { usuario, loading } = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(false);
                navigate('/');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoadingForm(true);
        const precioNumerico = precio === '' ? undefined : Number(precio);
        console.log('Form data submitted:', { nombre, descripcion, precio: precioNumerico, email: usuario.email });
        MenuService.createMenu(nombre, descripcion, precioNumerico, usuario.email)
            .then((data) => {
                console.log('Menu created:', data);
                setSuccess(true);
            })
            .catch((error) => {
                console.error('Error creating menu:', error);
                setError(error.message);
            })
            .finally(() => {
                setLoadingForm(false);
            });
    };

    if (loading) return <div className="menu-form-container">Cargando sesión...</div>;
    if (!usuario) return <div className="menu-form-container">No hay sesión activa</div>;

    return (
        <div className="menu-form-container">
            {error && (
                <div className="error-modal">
                    {error}
                </div>
            )}
            {success && (
                <div className="success-modal">
                    Menú registrado con éxito
                </div>
            )}
            <form className="menu-form" onSubmit={handleSubmit}>
                <h2>Agregar Nuevo Menú</h2>
                <div className="form-group">
                    <label htmlFor="nombre">Nombre del menú:</label>
                    <input
                        type="text"
                        id="nombre"
                        value={nombre}
                        placeholder="Nombre del menú, ej: Pizza Margherita"
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea
                        id="descripcion"
                        value={descripcion}
                        placeholder="Descripción, ej: Una deliciosa pizza con ingredientes frescos"
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="precio">Precio:</label>
                    <input
                        type="number"
                        id="precio"
                        value={precio}
                        placeholder="Precio, ej: 12.99"
                        onChange={(e) => setPrecio(e.target.value)}
                    />
                </div>
                <button type="submit" disabled={loadingForm}>
                    {loadingForm ? 'Agregando...' : 'Agregar'}
                </button>
            </form>
        </div>
    );
};

export default MenuForm;