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

const getAllMesas = async () => {
    try {
        const email = getUserEmail();
        const response = await axios.get(`${baseURL}mesas`, {
            headers: { 'x-user-email': email }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching mesas:', error);
        const serverMsg = error?.response?.data?.message;
        if (serverMsg) throw Error(serverMsg);
        throw Error('Hubo un error al obtener las mesas');
    }
};

export default { getAllMesas };
