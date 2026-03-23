import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth headers
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            // Use civicpath_user from localStorage for admin/MLA authentication
            const storedUser = localStorage.getItem('civicpath_user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    if (userData.email) {
                        config.headers['x-user-email'] = userData.email;
                    }
                } catch (error) {
                    console.error('Error parsing civicpath_user:', error);
                }
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
            // Handle unauthorized - redirect to admin login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('civicpath_user');
                if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/mla')) {
                    window.location.href = '/admin/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
