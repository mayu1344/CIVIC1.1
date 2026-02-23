import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('civic_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';

        // Only show toast if not a 401 (handled by auth flow)
        if (error.response?.status !== 401) {
            toast.error(message);
        } else {
            // Handle unauthorized - maybe redirect to login or clear store
            if (typeof window !== 'undefined') {
                localStorage.removeItem('civic_token');
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/admin/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
