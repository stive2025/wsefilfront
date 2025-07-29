import axios from 'axios';
import { GetCookieItem } from '@/utilities/cookies';

// Configurar axios con la base URL y headers por defecto
const api = axios.create({
  baseURL: import.meta.env.VITE_API_PROD,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autorización
api.interceptors.request.use(
  (config) => {
    const token = GetCookieItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.error('Token expirado o inválido');
      // Limpiar cookies y redirigir al login
      import('@/utilities/cookies').then(({ RemoveCookieItem }) => {
        RemoveCookieItem('authToken');
        RemoveCookieItem('userData');
        // Redirigir al login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      });
    }
    return Promise.reject(error);
  }
);

/**
 * Obtener mensajes de un chat con paginación
 * @param {number} chatId - ID del chat
 * @param {number} page - Número de página (default: 1)
 * @returns {Promise} - Promesa con los datos del chat y mensajes
 */
export const getChatMessages = async (chatId, page = 1) => {
  try {
    const response = await api.get(`/chats/${chatId}?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener mensajes del chat:', error);
    throw error;
  }
};

/**
 * Verificar si hay más páginas disponibles
 * @param {Object} paginationData - Datos de paginación de la respuesta
 * @returns {boolean} - true si hay más páginas
 */
export const hasMorePages = (paginationData) => {
  if (!paginationData || !paginationData.messages) return false;
  
  const { current_page, last_page } = paginationData.messages;
  return current_page < last_page;
};

/**
 * Formatear mensajes para el componente
 * @param {Array} messages - Array de mensajes de la API
 * @returns {Array} - Array de mensajes formateados
 */
export const formatMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  
  return messages.map(message => ({
    ...message,
    // Asegurar que los campos necesarios existan
    id: message.id,
    body: message.body || '',
    from_me: message.from_me || 'false',
    created_at: message.created_at,
    media_type: message.media_type || 'chat',
    media_path: message.media_path || '',
    ack: message.ack || 0,
    is_private: message.is_private || 0,
    created_by: message.created_by || '',
    temp_signature: message.temp_signature || null,
  }));
};

/**
 * Obtener información de paginación
 * @param {Object} chatData - Datos del chat de la API
 * @returns {Object} - Información de paginación
 */
export const getPaginationInfo = (chatData) => {
  if (!chatData || !chatData.messages) {
    return {
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 10,
      hasMore: false,
    };
  }

  const { messages } = chatData;
  return {
    currentPage: messages.current_page || 1,
    lastPage: messages.last_page || 1,
    total: messages.total || 0,
    perPage: messages.per_page || 10,
    hasMore: messages.current_page < messages.last_page,
    nextPageUrl: messages.next_page_url,
    prevPageUrl: messages.prev_page_url,
  };
};

export default api;
