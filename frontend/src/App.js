import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './hooks/useUserContext';
import ClientHome from './components/ClientHome';
import Home from './components/Home';
import MenuForm from './components/MenuForm';
import PedidosConfirmados from './components/PedidosConfirmados';

function AppRoutes() {
    const handleLogout = () => {
        localStorage.removeItem('user');
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<ClientHome />}
                />

                <Route
                    path="/admin"
                    element={<Home onLogout={handleLogout} />}
                />

                <Route
                    path="/admin/menu-form"
                    element={<MenuForm onLogout={handleLogout} />}
                />
                <Route
                    path="/admin/pedidos-confirmados"
                    element={<PedidosConfirmados onLogout={handleLogout} />}
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
