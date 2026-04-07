export const fetchEndpoint = async (
    endpoint: string,
    method = 'GET',
    token?: string | null,
    body?: any
) => {
    try {
        const API_URL = 'http://localhost:3000';
        const headers: HeadersInit = {};

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData - browser will set it correctly with boundary
        if (body && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const options: RequestInit = {
            method,
            headers,
            credentials: 'include',
        };

        if (body) {
            // Don't stringify FormData objects
            options.body = body instanceof FormData ? body : JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);

        // Check if response is ok
        if (!response.ok) {
            // Try to parse error as JSON
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error ${response.status}`);
            } catch (jsonError) {
                // If response isn't JSON, use status text
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
        }

        // For 204 No Content, don't try to parse JSON
        if (response.status === 204) {
            return null;
        }

        // For all other successful responses, try to parse JSON
        try {
            return await response.json();
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            throw new Error('Invalid JSON response from server');
        }
    } catch (error) {
        console.error(`Error in fetchEndpoint for ${method} ${endpoint}:`, error);
        throw error;
    }
};