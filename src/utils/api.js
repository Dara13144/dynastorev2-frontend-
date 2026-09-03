import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dynastorev2-backend-111.onrender.com/api',
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dynastore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages & filter out raw payloads/database errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.message || error.message || 'Something went wrong';

    if (typeof message === 'object') {
      message = 'An unexpected error occurred. Please try again.';
    } else if (typeof message === 'string') {
      const lower = message.toLowerCase();
      if (
        lower.includes('invalid input syntax') ||
        lower.includes('22p02') ||
        lower.includes('syntax error') ||
        lower.includes('violates') ||
        lower.includes('null value in column') ||
        lower.includes('payload') ||
        message.includes('{"') ||
        message.includes('at Function') ||
        message.includes('SQL')
      ) {
        message = 'Invalid input format. Please check the entered data and try again.';
      }
    }

    error.formattedMessage = message;
    return Promise.reject(error);
  }
);

export default API;
