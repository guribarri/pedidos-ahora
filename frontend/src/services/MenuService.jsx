import axios from "axios";
import { API_URL } from "../constants/url";

const baseURL = API_URL;

const createMenu = async (nombre, descripcion, precio, userEmail) => {
    try {
        const response = await axios.post(`${baseURL}menus`, { nombre, descripcion, precio }, { headers: { 'x-user-email': userEmail } });
        return response.data;
    } catch (error) {
        console.error('Error creating menu:', error);
        throw Error("Hubo un error al registrar el menú, revise los campos ingresados");
    }
};

export default { createMenu };