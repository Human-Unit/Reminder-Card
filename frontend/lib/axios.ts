// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Передаём куки для сессионной авторизации
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов - добавляем токен если есть
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage first
      let token = localStorage.getItem('token');
      
      // If not in localStorage, try to get from cookies
      if (!token) {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
        token = cookieValue || null;
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик ответов - обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Нет ответа от сервера - проверяем соединение с бэкендом
      console.error('Network error. Is the backend server running on', process.env.NEXT_PUBLIC_API_URL, '?');
      // Можно показать пользователю уведомление
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Не перенаправляем, просто логируем ошибку
      }
      return Promise.reject(new Error('Server connection failed. Check if backend is running.'));
    }

    // Если сервер вернул 401 (Не авторизован)
    if (error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }

    // Если сервер вернул 403 (Запрещено)
    if (error.response.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Если сервер вернул 500
    if (error.response.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;