// Configuración de la API
// Detecta automáticamente la IP del computador que corre Expo,
// así no hace falta cambiar la IP manualmente en cada máquina.
import Constants from 'expo-constants';

const getApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0]; // Extrae solo la IP (sin puerto de Expo)
        return `http://${ip}:8000`;
    }
    return 'http://localhost:8000'; // Fallback para web o emulador local
};

export const API_URL = getApiUrl();

const ENDPOINTS = {
    FORMATS: '/formats/',
    SUBMIT_FORM: '/formats/submit/',
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

export const submitForm = (formatoId, datos) => {
    const request = {
        formato: formatoId,
        estado: "BORRADOR",
        datos: datos,
    };
    return httpServicePost(ENDPOINTS.SUBMIT_FORM, request);
};
