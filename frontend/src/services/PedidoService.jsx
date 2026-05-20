import axios from 'axios';
import { API_URL } from '../constants/url';

const baseURL = API_URL;

const createPedido = async (menusOrId, cantidad, precio_unitario) => {
    let menusPayload = [];
    if (Array.isArray(menusOrId)) {
        menusPayload = menusOrId;
    } else {
        menusPayload = [{ menu_id: menusOrId, cantidad, precio_unitario }];
    }

    try {
        const response = await axios.post(`${baseURL}pedidos`, { menus: menusPayload });
        return response.data;   
    }
    catch (error) {
        console.error('Error creating pedido:', error);
        const serverMsg = error?.response?.data?.message;
        if (serverMsg) throw Error(serverMsg);
        throw Error("Hubo un error al crear el pedido, revise los campos ingresados");
    }
};

const getAllPedidos = async (userEmail) => {
    try {
        const response = await axios.get(`${baseURL}pedidos`, { headers: { 'x-user-email': userEmail } });
        return response.data;
    }
    catch (error) {
        console.error('Error fetching pedidos:', error);
        const serverMsg = error?.response?.data?.message || error?.response?.data?.error;
        if (serverMsg) throw Error(serverMsg);
        throw Error("Hubo un error al obtener los pedidos");
    }
};

const updatePedidoEstado = async (pedidoId, direction) => {
    try {
        const userStorage = localStorage.getItem('user');
        const user = userStorage ? JSON.parse(userStorage) : null;
        const userEmail = user?.email;

        const response = await axios.patch(`${baseURL}pedidos/${pedidoId}/estado`, { direction }, {
            headers: { 'x-user-email': userEmail }
        });
        return response.data;
    }
    catch (error) {
        console.error('Error updating pedido estado:', error);
        const serverMsg = error?.response?.data?.message;
        if (serverMsg) throw Error(serverMsg);
        throw Error("Hubo un error al actualizar el estado del pedido");
    }
};


export default { createPedido, getAllPedidos, updatePedidoEstado };