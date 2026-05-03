import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './hooks/useUserContext';
import Login from './components/Login';
import Home from './components/Home';
import MenuForm from './components/MenuForm';

function App() {
    const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
    const [usuario, setUsuario] = useState(null);

    const handleLoginExitoso = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUsuario(JSON.parse(userData));
        }
        setUsuarioAutenticado(true);
    };

    const handleLogout = () => {
        setUsuarioAutenticado(false);
        setUsuario(null);
        localStorage.removeItem('user');
    };

    return (
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route 
                      path="/" 
                      element={usuarioAutenticado ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />} 
                    />
                    <Route 
                      path="/login" 
                      element={!usuarioAutenticado ? <Login onLoginExitoso={handleLoginExitoso} /> : <Navigate to="/" />} 
                    />
                    <Route 
                      path="/menu-form" 
                      element={usuarioAutenticado ? <MenuForm /> : <Navigate to="/login" />} 
                    />
                </Routes>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;
