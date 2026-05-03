import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStorage = localStorage.getItem('user');
        if (userStorage) {
            try {
                const datos = JSON.parse(userStorage);
                setUsuario(datos);
                setUsuarioAutenticado(true);
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (usuario) => {
        setUsuarioAutenticado(true);
        setUsuario(usuario);
    };

    const logout = () => {
        setUsuarioAutenticado(false);
        setUsuario(null);
    };

    return (
        <UserContext.Provider value={{ usuarioAutenticado, usuario, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
};