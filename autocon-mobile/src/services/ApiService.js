const BASE_URL = 'http://192.168.40.11:8080/api';
const ENDPOINTS = {
    FORMS: '/forms',
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

export const getForms = () => httpServiceGet(ENDPOINTS.FORMS);
export const submitForm = (formData) => httpServicePost(ENDPOINTS.FORMS, formData); 
