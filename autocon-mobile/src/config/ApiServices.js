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
    DASHBOARD: '/formats/dashboard/',
    RECENT: '/formats/recent/',
    SUBMISSIONS: '/formats/submissions/',
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

    // Si es un 204 No Content (como en DELETE), no intentamos parsear JSON
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const httpServiceGet = (endpoint) => httpService(endpoint, 'GET');
export const httpServicePost = (endpoint, body) => httpService(endpoint, 'POST', body);

export const getFormats = () => httpServiceGet(ENDPOINTS.FORMATS);

// Guardar nueva instancia
export const submitForm = (formatoId, datos, estado = "BORRADOR") => {
    const request = {
        formato: formatoId,
        estado: estado,
        datos: datos,
    };
    return httpServicePost(ENDPOINTS.SUBMIT_FORM, request);
};

// Obtener detalle de un submission existente
export const getSubmissionDetail = (instanciaId) => {
    return httpServiceGet(`${ENDPOINTS.SUBMISSIONS}${instanciaId}/`);
};

// Actualizar un submission existente
export const updateSubmission = (instanciaId, datos, estado) => {
    const request = {
        estado: estado,
        datos: datos,
    };
    return httpService(`${ENDPOINTS.SUBMISSIONS}${instanciaId}/`, 'PUT', request);
};

// Eliminar un submission existente
export const deleteSubmission = (instanciaId) => {
    return httpService(`${ENDPOINTS.SUBMISSIONS}${instanciaId}/`, 'DELETE');
};

export const getDashboardStats = () => httpServiceGet(ENDPOINTS.DASHBOARD);
export const getRecentSubmissions = () => httpServiceGet(ENDPOINTS.RECENT);
export const getSubmissions = () => httpServiceGet(ENDPOINTS.SUBMISSIONS);
