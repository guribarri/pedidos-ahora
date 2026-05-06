import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUserContext } from './hooks/useUserContext';
import Login from './components/Login';
import Home from './components/Home';
import MenuForm from './components/MenuForm';

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
        return <div style={{padding:20}}>Cargando...</div>;
    }

    return (
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
