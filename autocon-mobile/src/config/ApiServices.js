// Configuración de la API
export const API_URL = "http://127.0.0.1:8000/api";

//const BASE_URL = 'http://192.168.40.11:8080/api'; aqui no se cual de las dos es
const BASE_URL = "http://127.0.0.1:8000/api";
const ENDPOINTS = {
    FORMATS: '/formats',
};


export const httpService = async (endpoint, method, body = null) => {
    const url = `${BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });

    return response.json();
};

export const httpServiceGet = (endpoint) => httpService(endpoint, 'GET');
export const httpServicePost = (endpoint, body) => httpService(endpoint, 'POST', body);

export const getFormats = () => httpServiceGet(ENDPOINTS.FORMATS);
export const submitFormat = (formatData) => httpServicePost(ENDPOINTS.FORMATS, formatData); 