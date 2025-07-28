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

  // Referencias
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const lastSearchRef = useRef('');

  /**
   * Cancelar petición anterior si existe
   */
  const cancelPreviousRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

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
      cancelPreviousRequest();
      
      const { signal, controller } = useAbortController();
      abortControllerRef.current = controller;

      if (!append) {
        setLoading(true);
        setError(null);
      }

      const response = await ContactsService.getAll(page, pageSize, signal);

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
  }, [pageSize, cancelPreviousRequest]);

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
      cancelPreviousRequest();
      
      const { signal, controller } = useAbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);
      setIsSearchMode(true);

      const response = await ContactsService.search(validation.query, signal);

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
      abortControllerRef.current = null;
    }
  }, [loadContacts, cancelPreviousRequest]);

  /**
   * Manejar cambio en el término de búsqueda con debounce
   */
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);

    if (!autoSearch) return;

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Configurar nuevo timer
    debounceTimerRef.current = setTimeout(() => {
      searchContacts(newSearchTerm);
    }, debounceDelay);
  }, [searchContacts, autoSearch, debounceDelay]);

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
      const { signal, controller } = useAbortController();
      const response = await ContactsService.delete(contactId, signal);

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
      const { signal, controller } = useAbortController();
      const response = await ContactsService.getById(contactId, signal);

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

  // Efecto para cargar contactos iniciales
  useEffect(() => {
    loadContacts(1, false);
    
    // Cleanup al desmontar
    return () => {
      cancelPreviousRequest();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [loadContacts, cancelPreviousRequest]);

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
