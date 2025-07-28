import axios from 'axios';

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_PROD;

// Crear instancia de axios con configuración base
const contactsAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar token de autenticación si existe
contactsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
contactsAPI.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Manejo de errores específicos
    if (error.response?.status === 401) {
      // Token expirado o no válido
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Error de conexión con el servidor';
    
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Servicio optimizado para búsqueda de contactos
 */
class ContactsService {
  
  /**
   * Buscar contactos por nombre
   * @param {string} name - Nombre a buscar
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise} Promesa con los resultados
   */
  static async searchByName(name, signal = null) {
    try {
      const params = { name: name.trim() };
      const config = signal ? { signal } : {};
      
      const response = await contactsAPI.get('/contacts', { 
        params, 
        ...config 
      });
      
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0,
        message: 'Búsqueda completada exitosamente'
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return { success: false, data: [], message: 'Búsqueda cancelada' };
      }
      
      return {
        success: false,
        data: [],
        message: error.message || 'Error al buscar contactos por nombre'
      };
    }
  }

  /**
   * Buscar contactos por teléfono
   * @param {string} phone - Número de teléfono a buscar
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise} Promesa con los resultados
   */
  static async searchByPhone(phone, signal = null) {
    try {
      const params = { phone: phone.trim() };
      const config = signal ? { signal } : {};
      
      const response = await contactsAPI.get('/contacts', { 
        params, 
        ...config 
      });
      
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0,
        message: 'Búsqueda completada exitosamente'
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return { success: false, data: [], message: 'Búsqueda cancelada' };
      }
      
      return {
        success: false,
        data: [],
        message: error.message || 'Error al buscar contactos por teléfono'
      };
    }
  }

  /**
   * Búsqueda universal de contactos (nombre o teléfono)
   * @param {string} query - Término de búsqueda
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise} Promesa con los resultados
   */
  static async search(query, signal = null) {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      return {
        success: true,
        data: [],
        message: 'Consulta vacía'
      };
    }

    // Detectar si es un número de teléfono (solo dígitos, espacios, guiones, paréntesis)
    const isPhoneNumber = /^[\d\s\-\(\)\+]+$/.test(trimmedQuery);
    
    if (isPhoneNumber) {
      return this.searchByPhone(trimmedQuery, signal);
    } else {
      return this.searchByName(trimmedQuery, signal);
    }
  }

  /**
   * Obtener todos los contactos con paginación
   * @param {number} page - Número de página
   * @param {number} limit - Límite de resultados por página
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise} Promesa con los resultados
   */
  static async getAll(page = 1, limit = 20, signal = null) {
    try {
      const params = { page, limit };
      const config = signal ? { signal } : {};
      
      const response = await contactsAPI.get('/contacts', { 
        params, 
        ...config 
      });
      
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0,
        currentPage: page,
        hasMore: response.next_page_url !== null,
        message: 'Contactos obtenidos exitosamente'
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return { success: false, data: [], message: 'Petición cancelada' };
      }
      
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener contactos'
      };
    }
  }

  /**
   * Obtener un contacto específico por ID
   * @param {string|number} contactId - ID del contacto
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise} Promesa con el contacto
   */
  static async getById(contactId, signal = null) {
    try {
      const config = signal ? { signal } : {};
      
      const response = await contactsAPI.get(`/contacts/${contactId}`, config);
      
      return {
        success: true,
        data: response,
        message: 'Contacto obtenido exitosamente'
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return { success: false, data: null, message: 'Petición cancelada' };
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Error al obtener el contacto'
      };
    }
  }

  /**
   * Eliminar un contacto
   * @param {string|number} contactId - ID del contacto a eliminar
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise} Promesa con el resultado
   */
  static async delete(contactId, signal = null) {
    try {
      const config = signal ? { signal } : {};
      
      await contactsAPI.delete(`/contacts/${contactId}`, config);
      
      return {
        success: true,
        message: 'Contacto eliminado exitosamente'
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return { success: false, message: 'Eliminación cancelada' };
      }
      
      return {
        success: false,
        message: error.message || 'Error al eliminar el contacto'
      };
    }
  }
}

/**
 * Hook personalizado para cancelar peticiones
 */
export const useAbortController = () => {
  const abortController = new AbortController();
  
  return {
    signal: abortController.signal,
    abort: () => abortController.abort(),
    controller: abortController
  };
};

/**
 * Utilidades para formateo de contactos
 */
export const ContactUtils = {
  /**
   * Formatear datos de contacto para la UI
   * @param {Object} contact - Datos del contacto
   * @returns {Object} Contacto formateado
   */
  formatContact(contact) {
    return {
      id: contact.id,
      name: contact.name || 'Sin nombre',
      phone: contact.phone_number || '',
      phone_number: contact.phone_number || '',
      photo: contact.profile_picture || 'avatar.jpg',
      profile_picture: contact.profile_picture || null,
      chat: contact.chat || null,
      idContact: contact.id,
      number: contact.phone_number,
      is_assign: contact.is_assign,
      user_id: contact.user_id,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
      sync_id: contact.sync_id,
      count_edits: contact.count_edits
    };
  },

  /**
   * Formatear lista de contactos
   * @param {Array} contacts - Lista de contactos
   * @returns {Array} Lista de contactos formateados
   */
  formatContactsList(contacts) {
    if (!Array.isArray(contacts)) return [];
    return contacts.map(this.formatContact);
  },

  /**
   * Validar término de búsqueda
   * @param {string} query - Término de búsqueda
   * @returns {Object} Resultado de validación
   */
  validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
      return { isValid: false, message: 'Término de búsqueda requerido' };
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { isValid: false, message: 'Mínimo 2 caracteres para buscar' };
    }

    if (trimmed.length > 50) {
      return { isValid: false, message: 'Máximo 50 caracteres permitidos' };
    }

    return { isValid: true, query: trimmed };
  }
};

export default ContactsService;
