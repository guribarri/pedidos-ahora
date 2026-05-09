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

const editMenu = async(id, nombre, descripcion, precio, userEmail) => {
    try {
        const response = await axios.put(`${baseURL}menus/${id}`, { nombre, descripcion, precio }, { headers: { 'x-user-email': userEmail } });
        return response.data;
    } catch (error) {
        console.error('Error editing menu:', error);
        throw Error("Hubo un error al editar el menú, revise los campos ingresados");
    };
}

const getAllMenus = async () => {
    try {
        const response = await axios.get(`${baseURL}menus`);
        return response.data;
    } catch (error) {
        console.error('Error fetching menus:', error);
        throw Error("Hubo un error al obtener los menús");
    }
};

const deleteMenu = async (id, userEmail) => {
    try {
        const response = await axios.delete(`${baseURL}menus/${id}`, { headers: { 'x-user-email': userEmail } });
        return response.data;
    } catch (error) {
        console.error('Error deleting menu:', error);
        throw Error('Error al eliminar el menú');
    }
};

const toggleVisibility = async (id, visible, userEmail) => {
    try {
        const response = await axios.patch(`${baseURL}menus/${id}/visibility`, { visible }, { headers: { 'x-user-email': userEmail } });
        return response.data;
    } catch (error) {
        console.error('Error toggling visibility:', error);
        throw Error('Error al actualizar la visibilidad');
    }
};

export default { createMenu, getAllMenus, deleteMenu, toggleVisibility, editMenu };