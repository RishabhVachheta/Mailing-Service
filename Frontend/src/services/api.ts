// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust this URL according to your backend

export const fetchMailServices = () => {
    return axios.get(`${API_BASE_URL}/mail-configs`);
};

export const createMailService = (data: any) => {
    return axios.post(`${API_BASE_URL}/mail-configs`, data);
};

export const runMailService = (id: string) => {
    return axios.post(`${API_BASE_URL}/mail-configs/run/${id}`);
};
