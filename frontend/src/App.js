import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { UserProvider, useUserContext } from './hooks/useUserContext';
import ClientHome from './components/ClientHome';
import Home from './components/Home';
import MenuForm from './components/MenuForm';
import PedidosConfirmados from './components/PedidosConfirmados';
import Login from './components/Login';

function AppRoutes() {
    const { usuario, logout, loading } = useUserContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLoginExitoso = () => {
        navigate('/admin');
    };

    if (loading) return null;

    return (
        <Routes>
            <Route
                path="/"
                element={<ClientHome />}
            />

            <Route
                path="/login"
                element={usuario?.email === 'admin@pedidiosahora.com' ? <Navigate to="/admin" /> : <Login onLoginExitoso={handleLoginExitoso} />}
            />

            <Route
                path="/admin"
                element={usuario?.email === 'admin@pedidiosahora.com' ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />}
            />

            <Route
                path="/admin/menu-form"
                element={usuario?.email === 'admin@pedidiosahora.com' ? <MenuForm onLogout={handleLogout} /> : <Navigate to="/login" />}
            />
            <Route
                path="/admin/pedidos-confirmados"
                element={usuario?.email === 'admin@pedidiosahora.com' ? <PedidosConfirmados onLogout={handleLogout} /> : <Navigate to="/login" />}
            />
        </Routes>
    );
}

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;