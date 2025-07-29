import { useState, useEffect, useCallback, useRef } from 'react';
import ContactsService, { useAbortController, ContactUtils } from '@/services/contactsAPI.js';

/**
 * Hook personalizado para manejar búsqueda y gestión de contactos
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para manejar contactos
 */
export const useContactsSearch = (options = {}) => {
  const {
    initialPage = 1,
    pageSize = 20,
    debounceDelay = 300,
    autoSearch = true
  } = options;

  // Estados
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Estado para loader de búsqueda

  // Referencias
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const lastSearchRef = useRef('');



  /**
   * Limpiar estados de error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cargar contactos con paginación
   */
  const loadContacts = useCallback(async (page = 1, append = false) => {
    try {
      // Solo cancelar si hay una petición previa pendiente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Crear nuevo AbortController
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (!append) {
        setLoading(true);
        setError(null);
      }

      console.log('Cargando contactos, página:', page, 'append:', append);
      const response = await ContactsService.getAll(page, pageSize, controller.signal);

      if (response.success) {
        const formattedContacts = ContactUtils.formatContactsList(response.data);
        
        if (append) {
          setContacts(prev => [...prev, ...formattedContacts]);
        } else {
          setContacts(formattedContacts);
        }

        setCurrentPage(page);
        setHasMore(response.hasMore);
        setTotalItems(response.total);
        setIsSearchMode(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Error al cargar contactos');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [pageSize]);

  /**
   * Buscar contactos
   */
  const searchContacts = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      loadContacts(1, false);
      return;
    }

    const validation = ContactUtils.validateSearchQuery(query);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    try {
      // Solo cancelar si hay una petición previa pendiente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Crear nuevo AbortController
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);
      setIsSearchMode(true);

      const response = await ContactsService.search(validation.query, controller.signal);

      if (response.success) {
        const formattedContacts = ContactUtils.formatContactsList(response.data);
        setContacts(formattedContacts);
        setTotalItems(response.total || formattedContacts.length);
        setHasMore(false); // No hay paginación en búsqueda
        lastSearchRef.current = validation.query;
      } else {
        setError(response.message);
        setContacts([]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Error en la búsqueda');
        setContacts([]);
      }
    } finally {
      setLoading(false);
      setIsSearching(false); // Desactivar loader de búsqueda
      abortControllerRef.current = null;
    }
  }, [loadContacts]);

  /**
   * Manejar cambio en el término de búsqueda con debounce optimizado
   */
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);

    if (!autoSearch) return;

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Si el término está vacío, cargar todos los contactos inmediatamente
    if (!newSearchTerm || newSearchTerm.trim() === '') {
      setIsSearching(false); // Quitar loader
      setIsSearchMode(false);
      loadContacts(1, false);
      return;
    }

    // Activar loader inmediatamente cuando se empieza a tipear
    setIsSearching(true);

    // Configurar nuevo timer con delay optimizado para mejor UX
    debounceTimerRef.current = setTimeout(() => {
      searchContacts(newSearchTerm);
    }, debounceDelay);
  }, [searchContacts, autoSearch, debounceDelay, loadContacts]);

  /**
   * Cargar más contactos (paginación)
   */
  const loadMore = useCallback(() => {
    if (!hasMore || loading || isSearchMode) return;
    loadContacts(currentPage + 1, true);
  }, [hasMore, loading, isSearchMode, currentPage, loadContacts]);

  /**
   * Refrescar lista de contactos
   */
  const refresh = useCallback(() => {
    if (isSearchMode && lastSearchRef.current) {
      searchContacts(lastSearchRef.current);
    } else {
      loadContacts(1, false);
    }
  }, [isSearchMode, searchContacts, loadContacts]);

  /**
   * Limpiar búsqueda y volver a la lista completa
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearchMode(false);
    lastSearchRef.current = '';
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    loadContacts(1, false);
  }, [loadContacts]);

  /**
   * Eliminar contacto
   */
  const deleteContact = useCallback(async (contactId) => {
    try {
      const controller = new AbortController();
      const response = await ContactsService.delete(contactId, controller.signal);

      if (response.success) {
        // Remover contacto de la lista local
        setContacts(prev => prev.filter(contact => contact.id !== contactId));
        setTotalItems(prev => Math.max(0, prev - 1));
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.message || 'Error al eliminar contacto' 
      };
    }
  }, []);

  /**
   * Obtener contacto por ID
   */
  const getContactById = useCallback(async (contactId) => {
    try {
      const controller = new AbortController();
      const response = await ContactsService.getById(contactId, controller.signal);

      if (response.success) {
        return { 
          success: true, 
          data: ContactUtils.formatContact(response.data),
          message: response.message 
        };
      } else {
        return { success: false, data: null, message: response.message };
      }
    } catch (err) {
      return { 
        success: false, 
        data: null, 
        message: err.message || 'Error al obtener contacto' 
      };
    }
  }, []);

  // Función para carga inicial (sin useCallback para evitar dependencias)
  const initialLoad = async () => {
    try {
      console.log('Hook useContactsSearch: Cargando contactos iniciales');
      
      // Crear nuevo AbortController
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      const response = await ContactsService.getAll(1, pageSize, controller.signal);
      console.log('Respuesta de ContactsService.getAll:', response);

      if (response.success) {
        console.log('Respuesta exitosa, datos recibidos:', response.data);
        const formattedContacts = ContactUtils.formatContactsList(response.data);
        console.log('Contactos formateados:', formattedContacts);
        
        setContacts(formattedContacts);
        setCurrentPage(1);
        setHasMore(response.hasMore);
        setTotalItems(response.total);
        setIsSearchMode(false);
        console.log('Estado actualizado - Contactos iniciales cargados:', formattedContacts.length);
      } else {
        console.error('Error en respuesta inicial:', response.message);
        setError(response.message);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error cargando contactos iniciales:', err);
        setError(err.message || 'Error al cargar contactos');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Efecto para cargar contactos iniciales
  useEffect(() => {
    initialLoad();
    
    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []); // Solo ejecutar una vez al montar

  // Cleanup de timers
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    // Estados
    contacts,
    loading,
    error,
    searchTerm,
    currentPage,
    hasMore,
    totalItems,
    isSearchMode,
    isSearching, // Estado del loader de búsqueda

    // Funciones
    handleSearchChange,
    searchContacts,
    loadContacts,
    loadMore,
    refresh,
    clearSearch,
    clearError,
    deleteContact,
    getContactById,

    // Utilidades
    isEmpty: contacts.length === 0,
    isInitialLoad: loading && contacts.length === 0,
    hasResults: contacts.length > 0,
  };
};

export default useContactsSearch;
