// Configuración de la API
export const API_URL = "http://192.168.40.12:8000";

const ENDPOINTS = {
    FORMATS: '/formats',
};


export const httpService = async (endpoint, method, body = null) => {
    const url = `${API_URL}${endpoint}`;

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

export const getForms = () => httpServiceGet(ENDPOINTS.FORMS);
export const submitForm = (formatData) => {

    request = {
        formato: 1,
        datos: formatData,
    }
    httpServicePost(ENDPOINTS.FORMS, request)
}
