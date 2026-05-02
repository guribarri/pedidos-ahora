import { useState } from 'react';
import './MenuForm.css';

const MenuForm = () => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form data submitted:', { nombre, descripcion, precio });
        // falta funcionalidad con api
    };

    return (
        <div className="menu-form-container">
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
                <button type="submit">Agregar</button>
            </form>
        </div>
    );
};

export default MenuForm;