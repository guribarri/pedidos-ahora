import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let userStorage = localStorage.getItem('user');
        
        if (!userStorage) {
            const email = `usuario_${Date.now()}@local`;
            localStorage.setItem('user', JSON.stringify({ email }));
            setUsuario({ email });
        } else {
            try {
                const datos = JSON.parse(userStorage);
                setUsuario(datos);
            } catch (e) {
                const email = `usuario_${Date.now()}@local`;
                localStorage.setItem('user', JSON.stringify({ email }));
                setUsuario({ email });
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUsuario(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUsuario(null);
    };

    return (
        <UserContext.Provider value={{ usuario, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
};