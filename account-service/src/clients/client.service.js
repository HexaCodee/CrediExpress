const DEFAULT_AUTH_SERVICE_URL = 'http://localhost:5222';

const getAuthServiceBaseUrl = () => {
    return (process.env.AUTH_SERVICE_URL || DEFAULT_AUTH_SERVICE_URL).replace(/\/$/, '');
};

const toFormData = (clientData) => {
    const formData = new FormData();

    Object.entries(clientData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });

    return formData;
};

const parseResponseBody = async (response) => {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
};

export const registerClientViaAuthService = async (clientData) => {
    const authServiceUrl = getAuthServiceBaseUrl();
    const formData = toFormData(clientData);

    const response = await fetch(`${authServiceUrl}/api/v1/auth/register`, {
        method: 'POST',
        body: formData,
    });

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
        const error = new Error(responseBody?.message || 'No fue posible completar el registro del cliente');
        error.statusCode = response.status;
        error.code = responseBody?.errorCode || responseBody?.error || 'AUTH_SERVICE_REGISTRATION_FAILED';
        error.details = responseBody;
        throw error;
    }

    return responseBody;
};