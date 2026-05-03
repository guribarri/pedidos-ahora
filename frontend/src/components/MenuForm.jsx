import { useState, useEffect } from 'react';
import './MenuForm.css';
import MenuService from '../services/MenuService';

const MenuForm = () => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Form data submitted:', { nombre, descripcion, precio });
        MenuService.createMenu(nombre, descripcion, precio)
            .then((data) => {
                console.log('Menu created:', data);
                // Reset form fields
                setNombre('');
                setDescripcion('');
                setPrecio('');
                //ir al home
            })
            .catch((error) => {
                console.error('Error creating menu:', error);
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="menu-form-container">
            {error && (
                <div className="error-modal">
                    {error}
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
                <button type="submit" disabled={loading}>
                    {loading ? 'Agregando...' : 'Agregar'}
                </button>
            </form>
        </div>
    );
};

export default MenuForm;