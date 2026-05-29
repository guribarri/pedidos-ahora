import axios from 'axios';
import { API_URL } from '../constants/url';

const baseURL = API_URL;

const getUserEmail = () => {
    try {
        const userStorage = localStorage.getItem('user');
        const user = userStorage ? JSON.parse(userStorage) : null;
        return user?.email || null;
    } catch {
        return null;
    }
};

const getTableHeaders = () => {
    const headers = {};
    const mesaId = localStorage.getItem('mesaId');
    const sesionMesaId = localStorage.getItem('sesionMesaId');
    
    if (mesaId) headers['x-mesa-id'] = mesaId;
    if (sesionMesaId) headers['x-sesion-mesa-id'] = sesionMesaId;
    
    return headers;
};

const createPedido = async (menusPayload, userEmail) => {
    try {
        const headers = { ...getTableHeaders() };
        const email = userEmail || getUserEmail();
        if (email) {
            headers['x-user-email'] = email;
        }

        const response = await axios.post(`${baseURL}pedidos`, { menus: menusPayload }, { headers });
        return response.data;
    } catch (error) {
        console.error('Error creating pedido:', error);
        const serverMsg = error?.response?.data?.message;
        if (serverMsg) throw Error(serverMsg);
        throw Error('Hubo un error al crear el pedido, revise los campos ingresados');
    }
};

const addMenusToPedido = async (pedidoId, menusPayload, userEmail) => {
    try {
        const headers = { ...getTableHeaders() };
        const email = userEmail || getUserEmail();
        if (email) {
            headers['x-user-email'] = email;
        }

        const response = await axios.patch(`${baseURL}pedidos/${pedidoId}/menus`, { menus: menusPayload }, { headers });
        return response.data;
    } catch (error) {
        console.error('Error adding menus to pedido:', error);
        const serverMsg = error?.response?.data?.message;
        if (serverMsg) throw Error(serverMsg);
        throw Error('Hubo un error al actualizar el pedido');
    }
};

const getPedidoById = async (pedidoId, userEmail) => {
    try {
        const headers = { ...getTableHeaders() };
        const email = userEmail || getUserEmail();
        if (email) {
            headers['x-user-email'] = email;
        }

        const response = await axios.get(`${baseURL}pedidos/${pedidoId}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching pedido by id:', error);
        const serverMsg = error?.response?.data?.message || error?.response?.data?.error;
        if (serverMsg) throw Error(serverMsg);
        throw Error('Hubo un error al obtener el pedido');
    }
};

const getUserPedidos = async (userEmail) => {
    try {
        const headers = {};
        const email = userEmail || getUserEmail();
        if (email) {
            headers['x-user-email'] = email;
        }

        const response = await axios.get(`${baseURL}pedidos/usuario`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching user pedidos:', error);
        const serverMsg = error?.response?.data?.message || error?.response?.data?.error;
        if (serverMsg) throw Error(serverMsg);
        throw Error('Hubo un error al obtener los pedidos del usuario');
    }
};

const getAllPedidos = async (userEmail) => {
    try {
        const headers = {};
        const email = userEmail || getUserEmail();
        if (email) {
            headers['x-user-email'] = email;
        }

        const response = await axios.get(`${baseURL}pedidos`, { headers });
        return response.data;
    }
    catch (error) {
        console.error('Error fetching pedidos:', error);
        const serverMsg = error?.response?.data?.message || error?.response?.data?.error;
        if (serverMsg) throw Error(serverMsg);
        throw Error('Hubo un error al obtener los pedidos');
    }
};

const updatePedidoEstado = async (pedidoId, direction) => {
    try {
        const userEmail = getUserEmail();
        const response = await axios.patch(`${baseURL}pedidos/${pedidoId}/estado`, { direction }, {
            headers: { 'x-user-email': userEmail }
        });
        return response.data;
    }
    catch (error) {
        console.error('Error updating pedido estado:', error);
        const serverMsg = error?.response?.data?.message;
        if (serverMsg) throw Error(serverMsg);
        throw Error('Hubo un error al actualizar el estado del pedido');
    }
};

const accederMesa = async (numero, token) => {
    try {
        const response = await axios.post(`${baseURL}mesas/${numero}/acceder?token=${token}`);
        return response.data;
    } catch (error) {
        console.error('Error al acceder a la mesa:', error);
        const serverMsg = error?.response?.data?.message;
        if (serverMsg) throw Error(serverMsg);
        throw Error('Error al acceder a la mesa');
    }
};

export default { createPedido, addMenusToPedido, getPedidoById, getUserPedidos, getAllPedidos, updatePedidoEstado, accederMesa };
