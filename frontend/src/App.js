import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { UserProvider, useUserContext } from './hooks/useUserContext';
import ClientHome from './components/ClientHome';
import NotFound from './components/NotFound';
import Home from './components/Home';
import MenuForm from './components/MenuForm';
import PedidosConfirmados from './components/PedidosConfirmados';
import Login from './components/Login';
import GraciasPage from './components/GraciasPage.jsx';

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
                element={<NotFound message={'Acceso inválido: use el QR para entrar a una mesa.'} />}
            />
            <Route
                path="/mesa/:numero"
                element={<MesaRouteWrapper />}
            />
            <Route path="/gracias" element={<GraciasPage />} />
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

function MesaRouteWrapper() {
    // Wrapper to enforce token presence in query for /mesa/:numero
    const [searchParams] = (() => {
        try {
            const { useSearchParams } = require('react-router-dom');
            return useSearchParams();
        } catch (e) {
            return [new URLSearchParams(window.location.search)];
        }
    })();

    const token = searchParams.get ? searchParams.get('token') : new URLSearchParams(window.location.search).get('token');

    if (!token) {
        return <NotFound message="Acceso inválido: token de mesa requerido" />;
    }

    return <ClientHome />;
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