import { useState, useEffect, useCallback, useRef } from 'react';
import { getChatMessages, formatMessages, getPaginationInfo } from '@/services/messagesAPI';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar la paginación de mensajes de chat
 * @param {number} chatId - ID del chat
 * @returns {Object} - Estado y funciones para manejar la paginación
 */
export const useMessagesPagination = (chatId) => {
  // Estados
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
    hasMore: false,
  });

  // Referencias
  const abortControllerRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const lastChatIdRef = useRef(null);

  /**
   * Cancelar peticiones pendientes
   */
  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Cargar mensajes de una página específica
   * @param {number} page - Número de página
   * @param {boolean} append - Si true, agrega los mensajes al inicio; si false, reemplaza todos
   */
  const loadMessages = useCallback(async (page = 1, append = false) => {
    if (!chatId) return;

    // Cancelar peticiones anteriores
    cancelPendingRequests();

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    try {
      // Establecer estado de carga
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      // Realizar petición
      const chatData = await getChatMessages(chatId, page);
      
      // Verificar si la petición fue cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Formatear mensajes
      const newMessages = formatMessages(chatData.messages?.data || []);
      
      // Obtener información de paginación
      const newPaginationInfo = getPaginationInfo(chatData);
      setPaginationInfo(newPaginationInfo);

      // Actualizar mensajes
      if (append) {
        // Agregar mensajes al principio (mensajes más antiguos)
        setMessages(prevMessages => {
          // Invertir los nuevos mensajes para mantener el orden cronológico
          const reversedNewMessages = [...newMessages].reverse();
          return [...reversedNewMessages, ...prevMessages];
        });
      } else {
        // Reemplazar todos los mensajes (carga inicial)
        // Invertir para que los más recientes estén al final
        setMessages([...newMessages].reverse());
        isInitialLoadRef.current = false;
      }

    } catch (error) {
      // Verificar si la petición fue cancelada
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('Error cargando mensajes:', error);
      setError(error);
      
      if (!append) {
        toast.error('Error al cargar los mensajes del chat');
      } else {
        toast.error('Error al cargar mensajes anteriores');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      abortControllerRef.current = null;
    }
  }, [chatId, cancelPendingRequests]);

  /**
   * Cargar la siguiente página de mensajes (mensajes más antiguos)
   */
  const loadMoreMessages = useCallback(() => {
    if (isLoadingMore || !paginationInfo.hasMore) return;
    
    const nextPage = paginationInfo.currentPage + 1;
    loadMessages(nextPage, true);
  }, [isLoadingMore, paginationInfo.hasMore, paginationInfo.currentPage, loadMessages]);

  /**
   * Recargar mensajes desde el principio
   */
  const refreshMessages = useCallback(() => {
    setMessages([]);
    setPaginationInfo({
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 10,
      hasMore: false,
    });
    isInitialLoadRef.current = true;
    loadMessages(1, false);
  }, [loadMessages]);

  /**
   * Agregar un nuevo mensaje al final de la lista
   * @param {Object} newMessage - Nuevo mensaje a agregar
   */
  const addNewMessage = useCallback((newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);

  /**
   * Actualizar un mensaje existente
   * @param {number} messageId - ID del mensaje a actualizar
   * @param {Object} updates - Campos a actualizar
   */
  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  /**
   * Eliminar un mensaje de la lista
   * @param {number} messageId - ID del mensaje a eliminar
   */
  const removeMessage = useCallback((messageId) => {
    setMessages(prevMessages => 
      prevMessages.filter(msg => msg.id !== messageId)
    );
  }, []);

  // Efecto para cargar mensajes cuando cambia el chatId
  useEffect(() => {
    if (chatId && chatId !== lastChatIdRef.current) {
      lastChatIdRef.current = chatId;
      refreshMessages();
    }
  }, [chatId, refreshMessages]);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      cancelPendingRequests();
    };
  }, [cancelPendingRequests]);

  return {
    // Estados
    messages,
    isLoading,
    isLoadingMore,
    error,
    paginationInfo,
    
    // Funciones
    loadMoreMessages,
    refreshMessages,
    addNewMessage,
    updateMessage,
    removeMessage,
    
    // Información útil
    hasMessages: messages.length > 0,
    hasMoreMessages: paginationInfo.hasMore,
    totalMessages: paginationInfo.total,
    isInitialLoad: isInitialLoadRef.current,
  };
};
