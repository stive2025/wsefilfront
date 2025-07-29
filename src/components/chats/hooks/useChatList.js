import { useState, useEffect, useCallback, useContext } from "react";
import { StateFilter, TagFilter, AgentFilter, WebSocketMessage } from "@/contexts/chats.js";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { getChatList } from "@/services/chats.js";
import { getTags } from "@/services/tags.js";
import { getUserData } from "@/services/authService.js";
import { createChatFromMessage, getMessagePreview } from "../utils/chatUtils";
import { useAuth } from '@/contexts/authContext';
import { ABILITIES } from '@/constants/abilities';

/**
 * Hook personalizado para manejar la lógica de la lista de chats
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para manejar la lista de chats
 */
export const useChatList = (options = {}) => {
  const { pageSize = 20, debounceDelay = 500 } = options;

  // Estados
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  const [tags, setTags] = useState([]);
  const [loadingState, setLoadingState] = useState({
    type: null, // 'filter' | 'search' | 'pagination'
    isLoading: false
  });

  // Contextos
  const { stateSelected } = useContext(StateFilter);
  const { tagSelected } = useContext(TagFilter);
  const { agentSelected } = useContext(AgentFilter);
  const { messageData, setMessageData } = useContext(WebSocketMessage);
  const { hasAbility } = useAuth();

  // Hooks
  const { loading, callEndpoint } = useFetchAndLoad();

  /**
   * Limpia el estado cuando cambiamos el tipo de carga
   */
  const resetChatState = useCallback(() => {
    setChats([]);
    setPage(1);
    setHasMoreChats(true);
    setPaginationInfo({ current_page: 1, last_page: 1, total: 0 });
  }, []);

  /**
   * Carga los tags disponibles
   */
  const loadTags = useCallback(async () => {
    try {
      const response = await callEndpoint(getTags());
      if (response.data) {
        setTags(response.data);
      }
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  }, [callEndpoint]);

  /**
   * Función principal para cargar chats
   */
  const loadChats = useCallback(async (params = {}, append = false) => {
    try {
      const {
        page: requestPage = 1,
        search = searchQuery,
        state = stateSelected,
        tag = tagSelected,
        agent = agentSelected,
        loadingType = 'filter'
      } = params;

      if (!append) {
        setLoadingState({ type: loadingType, isLoading: true });
      }

      // Obtener datos del usuario para filtros
      const userData = await getUserData();
      const userId = userData?.id;

      // Construir parámetros de la petición
      const requestParams = {
        page: requestPage,
        per_page: pageSize,
        ...(search && { search }),
        ...(state && { state }),
        ...(tag && { tag_id: tag }),
        ...(agent && { user_id: agent })
      };

      const response = await callEndpoint(getChatList(requestParams));

      if (response?.data) {
        const formattedChats = await Promise.all(
          response.data.map(async (chat) => ({
            ...chat,
            avatar: chat.profile_picture || "/avatar.jpg",
          }))
        );

        if (append) {
          setChats(prev => [...prev, ...formattedChats]);
        } else {
          setChats(formattedChats);
        }

        setPage(requestPage);
        setHasMoreChats(response.current_page < response.last_page);
        setPaginationInfo({
          current_page: response.current_page,
          last_page: response.last_page,
          total: response.total
        });
      }
    } catch (error) {
      console.error("Error loading chats:", error);
      if (!append) {
        setChats([]);
      }
    } finally {
      setLoadingState({ type: null, isLoading: false });
    }
  }, [
    searchQuery, 
    stateSelected, 
    tagSelected, 
    agentSelected, 
    pageSize, 
    callEndpoint
  ]);

  /**
   * Carga más chats (paginación)
   */
  const loadMoreChats = useCallback(() => {
    if (hasMoreChats && !loading && !loadingState.isLoading) {
      loadChats({ page: page + 1, loadingType: 'pagination' }, true);
    }
  }, [hasMoreChats, loading, loadingState.isLoading, page, loadChats]);

  /**
   * Maneja la búsqueda con debounce
   */
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    
    // Debounce para la búsqueda
    const timeoutId = setTimeout(() => {
      resetChatState();
      loadChats({ search: query, loadingType: 'search' });
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [resetChatState, loadChats, debounceDelay]);

  /**
   * Maneja los mensajes entrantes del WebSocket
   */
  const handleIncomingMessage = useCallback(() => {
    if (!messageData || !hasAbility(ABILITIES.CHATS.VIEW)) return;

    const existingChatIndex = chats.findIndex(chat => chat.id === messageData.chat_id);

    if (existingChatIndex !== -1) {
      // Actualizar chat existente
      const updatedChats = [...chats];
      const chatToUpdate = { ...updatedChats[existingChatIndex] };
      
      chatToUpdate.last_message = getMessagePreview(messageData);
      chatToUpdate.updated_at = messageData.timestamp;
      
      const isNewMessage = messageData.type === 'message';
      
      if (isNewMessage && (messageData.from_me === false || messageData.from_me === "false")) {
        const currentUnread = chatToUpdate.unread_message || 0;
        chatToUpdate.unread_message = currentUnread + 1;
      }

      if (isNewMessage) {
        updatedChats.splice(existingChatIndex, 1);
        updatedChats.unshift(chatToUpdate);
      } else {
        updatedChats[existingChatIndex] = chatToUpdate;
      }

      setChats(updatedChats);
    } else if (messageData.type === 'message') {
      // Crear nuevo chat
      const newChat = createChatFromMessage(messageData);
      setChats(prev => [newChat, ...prev]);
    }

    setMessageData(null);
  }, [messageData, chats, hasAbility, setMessageData]);

  // Efectos
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    resetChatState();
    loadChats({ loadingType: 'filter' });
  }, [stateSelected, tagSelected, agentSelected]);

  useEffect(() => {
    handleIncomingMessage();
  }, [handleIncomingMessage]);

  // Efecto para manejar cambios de estado de chat
  useEffect(() => {
    const handleChatStateChange = (event) => {
      const { chatId, shouldRemove } = event.detail;

      if (shouldRemove) {
        setTimeout(() => {
          setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        }, 300);
      }
    };

    window.addEventListener('chatStateChanged', handleChatStateChange);
    return () => window.removeEventListener('chatStateChanged', handleChatStateChange);
  }, []);

  return {
    // Estados
    chats,
    setChats,
    searchQuery,
    setSearchQuery: handleSearch,
    loading: loading || loadingState.isLoading,
    hasMoreChats,
    paginationInfo,
    tags,
    loadingState,

    // Funciones
    loadChats,
    loadMoreChats,
    resetChatState,

    // Utilidades
    isEmpty: chats.length === 0,
    isInitialLoad: (loading || loadingState.isLoading) && chats.length === 0,
    hasResults: chats.length > 0,
  };
};
