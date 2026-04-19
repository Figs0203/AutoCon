// Configuración de la API
// Prioriza variable de entorno local para evitar subir IPs privadas al repositorio.
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

const getApiUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:8000`;
    }

    return 'http://localhost:8000';
};

export const API_URL = getApiUrl();

const ENDPOINTS = {
    FORMATS: '/formats/',
    SUBMIT_FORM: '/formats/submit/',
    DASHBOARD: '/formats/dashboard/',
    RECENT: '/formats/recent/',
    SUBMISSIONS: '/formats/submissions/',
    REGISTER: '/users/register/',
    LOGIN: '/users/login/',
    LOGOUT: '/users/logout/',
    ME: '/users/me/',
    SOCIOS_DASHBOARD: '/users/socios/dashboard/',
};


const getAuthToken = async () => AsyncStorage.getItem(AUTH_TOKEN_KEY);
const setAuthSession = async (token, user) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};
const clearAuthSession = async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
};


export const httpService = async (endpoint, method, body = null, requiresAuth = false) => {
    const url = `${API_URL}${endpoint}`;
    const token = await getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
    };
    if (requiresAuth && token) {
        headers.Authorization = `Token ${token}`;
    }

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    // Si es un 204 No Content (como en DELETE), no intentamos parsear JSON
    if (response.status === 204) {
        return null;
    }

    const data = await response.json();
    if (!response.ok) {
        const firstError = Object.values(data || {})?.[0];
        const message = Array.isArray(firstError) ? firstError[0] : (firstError || data?.detail || 'Error en la solicitud');
        throw new Error(message);
    }

    return data;
};

export const httpServiceGet = (endpoint) => httpService(endpoint, 'GET');
export const httpServicePost = (endpoint, body) => httpService(endpoint, 'POST', body);
export const httpServiceAuthGet = (endpoint) => httpService(endpoint, 'GET', null, true);
export const httpServiceAuthPost = (endpoint, body) => httpService(endpoint, 'POST', body, true);

export const getFormats = () => httpServiceGet(ENDPOINTS.FORMATS);

// Guardar nueva instancia
export const submitForm = (formatoId, datos, estado = "BORRADOR") => {
    const request = {
        formato: Number(formatoId),
        estado: estado,
        datos: datos,
    };
    return httpServiceAuthPost(ENDPOINTS.SUBMIT_FORM, request);
};

// Obtener detalle de un submission existente
export const getSubmissionDetail = (instanciaId) => {
    return httpServiceAuthGet(`${ENDPOINTS.SUBMISSIONS}${instanciaId}/`);
};

// Actualizar un submission existente
export const updateSubmission = (instanciaId, datos, estado) => {
    const request = {
        estado: estado,
        datos: datos,
    };
    return httpService(`${ENDPOINTS.SUBMISSIONS}${instanciaId}/`, 'PUT', request, true);
};

// Eliminar un submission existente
export const deleteSubmission = (instanciaId) => {
    return httpService(`${ENDPOINTS.SUBMISSIONS}${instanciaId}/`, 'DELETE', null, true);
};

// ── Imágenes ──────────────────────────────────────────────────

export const uploadImages = async (instanciaId, localImages) => {
    const url = `${API_URL}${ENDPOINTS.SUBMISSIONS}${instanciaId}/images/`;
    const token = await getAuthToken();

    const formData = new FormData();
    localImages.forEach((img) => {
        formData.append("imagenes", {
            uri: img.uri,
            type: img.mimeType || "image/jpeg",
            name: img.fileName,
        });
    });

    const headers = {};
    if (token) headers.Authorization = `Token ${token}`;
    // Fetch en React Native configura correctamente el Content-Type multipart/form-data con sus boundaries

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.detail || "Error subiendo la(s) imagen(es)");
    }
    return data;
};

export const deleteAttachedImage = (instanciaId, imagenId) => {
    return httpService(`${ENDPOINTS.SUBMISSIONS}${instanciaId}/images/${imagenId}/`, 'DELETE', null, true);
};

export const getDashboardStats = () => httpServiceAuthGet(ENDPOINTS.DASHBOARD);
export const getRecentSubmissions = () => httpServiceAuthGet(ENDPOINTS.RECENT);
export const getSubmissions = () => httpServiceAuthGet(ENDPOINTS.SUBMISSIONS);

export const register = async (email, password, role) => {
    const data = await httpServicePost(ENDPOINTS.REGISTER, { email, password, role });
    await setAuthSession(data.token, data.user);
    return data.user;
};

export const login = async (email, password) => {
    const data = await httpServicePost(ENDPOINTS.LOGIN, { email, password });
    await setAuthSession(data.token, data.user);
    return data.user;
};

export const logout = async () => {
    try {
        await httpService(ENDPOINTS.LOGOUT, 'POST', {}, true);
    } finally {
        await clearAuthSession();
    }
};

export const getCurrentUser = async () => {
    return httpServiceAuthGet(ENDPOINTS.ME);
};

export const getSociosDashboard = () => httpServiceAuthGet(ENDPOINTS.SOCIOS_DASHBOARD);

export const getCachedUser = async () => {
    const raw = await AsyncStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
};
