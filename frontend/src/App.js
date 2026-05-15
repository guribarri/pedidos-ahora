import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUserContext } from './hooks/useUserContext';
import Login from './components/Login';
import Home from './components/Home';
import ClientHome from './components/ClientHome';
import MenuForm from './components/MenuForm';
import PedidosConfirmados from './components/PedidosConfirmados';

function AppRoutes() {
    const { usuarioAutenticado, login, logout, loading } = useUserContext();

    const handleLoginExitoso = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                login(user);
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
    };

    const handleLogout = () => {
        logout();
        localStorage.removeItem('user');
    };

    if (loading) {
        return <div style={{ padding: 20 }}>Cargando...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<ClientHome />}
                />

                <Route
                    path="/admin"
                    element={usuarioAutenticado ? <Home onLogout={handleLogout} /> : <Login onLoginExitoso={handleLoginExitoso} />}
                />

                <Route
                    path="/admin/menu-form"
                    element={usuarioAutenticado ? <MenuForm onLogout={handleLogout} /> : <Navigate to="/admin" />}
                />
                <Route
                    path="/admin/pedidos-confirmados"
                    element={usuarioAutenticado ? <PedidosConfirmados onLogout={handleLogout} /> : <Navigate to="/admin" />}
                />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <UserProvider>
            <AppRoutes />
        </UserProvider>
    );
}

export default App;
