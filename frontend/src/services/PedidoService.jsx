import axios from 'axios';
import { API_URL } from '../constants/url';

const baseURL = API_URL;

const createPedido = async (id_menu, cantidad, precio_unitario) => {
    try {
        const response = await axios.post(`${baseURL}pedidos`, { menus: [{ menu_id: id_menu, cantidad, precio_unitario }] });
        return response.data;   
    }
    catch (error) {
        console.error('Error creating pedido:', error);
        const serverMsg = error?.response?.data?.message;
        if (serverMsg) throw Error(serverMsg);
        throw Error("Hubo un error al crear el pedido, revise los campos ingresados");
    }
};

export default { createPedido };