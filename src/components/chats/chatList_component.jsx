/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Search, ChevronLeftCircle, ChevronRightCircle, Loader, Check, Clock, AlertTriangle, Eye } from "lucide-react";
import { ChatInterfaceClick, StateFilter, TagFilter, AgentFilter, WebSocketMessage, TempNewMessage } from "@/contexts/chats.js";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { getChatList, updateChat } from "@/services/chats.js";
import { getAgents } from "@/services/agents.js";
import { getTags } from "@/services/tags.js";
import Resize from "@/hooks/responsiveHook.jsx";
import { getUserData } from "@/services/authService.js";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard';
import { useAuth } from '@/contexts/authContext';
import { useTheme } from "@/contexts/themeContext";
import { getUserLabelColors } from "@/utils/getUserLabelColors";
//import { GetCookieItem } from "@/utilities/cookies";

const formatTimestamp = (timestamp) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Resetear horas para comparación de fechas
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

  if (messageDateOnly.getTime() === todayDateOnly.getTime()) {
    // Hoy - mostrar solo hora
    return messageDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else if (messageDateOnly.getTime() === yesterdayDateOnly.getTime()) {
    // Ayer - mostrar "Ayer"
    return 'Ayer';
  } else {
    // Días anteriores - mostrar fecha
    return messageDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  }
};
// ChatHeader component remains the same
const ChatHeader = () => {
  const { theme } = useTheme();

  return (
    <div className={`p-1 flex items-center justify-between bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
      <div className="flex items-center space-x-2">
        <img src="./images/logoCRM.png" alt="Logo" className="w-22 h-9" />
      </div>
    </div>
  );
};

// SearchInput component remains the same
const SearchInput = ({ searchQuery, setSearchQuery }) => {
  const { theme } = useTheme();

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <AbilityGuard
      abilities={[ABILITIES.CHATS.SEARCH]}
      fallback={
        <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))] 
          text-[rgb(var(--color-text-secondary-${theme}))] text-sm`}>
          No tienes permiso para buscar chats
        </div>
      }
    >
      <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-[rgb(var(--color-bg-${theme}))] rounded-lg pl-8 pr-8 py-1 
              text-[rgb(var(--color-text-primary-${theme}))] 
              placeholder-[rgb(var(--color-text-secondary-${theme}))]
              hover:border-[rgb(var(--input-hover-border-${theme}))]
              focus:border-[rgb(var(--input-focus-border-${theme}))]
              focus:ring-1 focus:ring-[rgb(var(--input-focus-border-${theme}))]
              outline-none`}
          />
          <Search
            className={`absolute left-1 text-[rgb(var(--color-text-secondary-${theme}))]`}
            size={18}
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className={`absolute right-2 p-1 rounded-full
                text-[rgb(var(--color-text-secondary-${theme}))]
                hover:bg-[rgb(var(--input-hover-bg-${theme}))]
                hover:text-[rgb(var(--color-primary-${theme}))]
                transition-colors duration-200`}
              title="Limpiar búsqueda"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
          )}
        </div>
      </div>
    </AbilityGuard>
  );
};

// TagsBar component remains the same
const TagsBar = ({ tags }) => {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const { tagSelected, setTagSelected } = useContext(TagFilter);

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const handleTagClick = (tagId) => {
    console.log('Tag seleccionado:', tagId);
    setTagSelected(tagId);
  };

  return (
    <AbilityGuard abilities={[ABILITIES.CHATS.FILTER_BY_TAG]} fallback={null}>
      <div className={`relative flex items-center bg-[rgb(var(--color-bg-${theme}-secondary))] p-2`}>
        <button
          onClick={scrollLeft}
          className={`absolute left-0 h-5 w-5 ml-2 flex items-center justify-center 
            bg-transparent hover:bg-[rgb(var(--input-hover-bg-${theme}))] 
            active:bg-[rgb(var(--color-primary-${theme}))] rounded-full
            text-[rgb(var(--color-text-secondary-${theme}))]
            hover:text-[rgb(var(--color-primary-${theme}))]`}
        >
          <ChevronLeftCircle size={15} />
        </button>

        <div
          ref={containerRef}
          className={`bg-transparent text-[rgb(var(--color-text-primary-${theme}))] h-8 w-full 
            overflow-hidden shadow-md flex items-center p-1 overflow-x-auto scrollbar-hide mx-8`}
        >
          <ul className="flex whitespace-nowrap">
            {Array.isArray(tags) && tags.length > 0 ? (
              <>
                <li
                  className={`flex items-center gap-2 cursor-pointer rounded-full p-2 text-xs 
                    ${!tagSelected ? "bg-gray-700 text-white" : "hover:text-gray-300"}`}
                  onClick={() => handleTagClick(null)}
                >
                  Todo
                </li>
                {tags.map((tag) => (
                  <li
                    key={tag.id}
                    className={`flex items-center gap-2 cursor-pointer rounded-full p-2 text-xs 
                      ${tagSelected === tag.id ? "bg-gray-700 text-white" : "hover:text-gray-300"}`}
                    onClick={() => handleTagClick(tag.id)}
                  >
                    {tag.name}
                  </li>
                ))}
              </>
            ) : (
              <li className="text-xs text-gray-400">No hay etiquetas disponibles</li>
            )}
          </ul>
        </div>

        <button
          onClick={scrollRight}
          className={`absolute right-0 h-5 w-5 mr-2 flex items-center justify-center 
            bg-transparent hover:bg-[rgb(var(--input-hover-bg-${theme}))] 
            active:bg-[rgb(var(--color-primary-${theme}))] rounded-full
            text-[rgb(var(--color-text-secondary-${theme}))]
            hover:text-[rgb(var(--color-primary-${theme}))]`}
        >
          <ChevronRightCircle size={15} />
        </button>
      </div>
    </AbilityGuard>
  );
};

// AgentSelect component remains the same
const AgentSelect = ({ role }) => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [agents, setAgents] = useState([]);
  const { agentSelected, setAgentSelected } = useContext(AgentFilter);
  const { theme } = useTheme();

  // Obtener los colores para el agente seleccionado

  useEffect(() => {
    const loadAgents = async () => {
      if (role == "admin") {
        try {
          const response = await callEndpoint(getAgents({ page: 1 }));
          setAgents(response.data || []);
        } catch (error) {
          console.error("Error obteniendo agentes:", error);
          setAgents([]);
        }
      }
    };

    loadAgents();
  }, [role]);

  if (role !== "admin") return null;

  const { bg, text } = agentSelected && agents.length
    ? getUserLabelColors(agents.find(a => a.id === agentSelected)?.name || '')
    : { bg: '', text: '' };

  return (
    <AbilityGuard abilities={[ABILITIES.CHATS.FILTER_BY_AGENT]} fallback={null}>
      <div className={`cursor-pointer p-4 border-b border-[rgb(var(--color-text-secondary-${theme}))] 
        bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
        <select
          className={`w-full outline-none px-2 py-1 rounded-md
            ${agentSelected
              ? `${bg} ${text} font-semibold`
              : `bg-[rgb(var(--color-bg-${theme}-secondary))] 
                 text-[rgb(var(--color-text-secondary-${theme}))]`}
            hover:bg-[rgb(var(--input-hover-bg-${theme}))]
            focus:border-[rgb(var(--input-focus-border-${theme}))]`}
          value={agentSelected || ""}
          onChange={(e) => {
            const agentId = e.target.value ? parseInt(e.target.value) : null;
            setAgentSelected(agentId);
          }}
          disabled={loading}
        >
          <option value="" className={`bg-[rgb(var(--color-bg-${theme}-secondary))] 
            text-[rgb(var(--color-text-secondary-${theme}))]`}>
            {loading ? "Cargando agentes..." : "Todos los agentes"}
          </option>
          {agents.length > 0 ? (
            agents.map((agent) => {
              const { bg: optionBg, text: optionText } = getUserLabelColors(agent.name);
              return (
                <option
                  key={agent.id}
                  value={agent.id}
                  className={`${optionBg} ${optionText} font-semibold`}
                >
                  {agent.name}
                </option>
              );
            })
          ) : (
            <option disabled>No hay agentes</option>
          )}
        </select>
      </div>
    </AbilityGuard>
  );
};

// Helper function to get message preview
const getMessagePreview = (message) => {
  if (message.media_type === 'chat') {
    return message.body;
  }
  switch (message.media_type) {
    case 'image':
      return '📷 Imagen';
    case 'video':
      return '🎥 Video';
    case 'audio':
    case 'ptt':
      return '🎵 Audio';
    case 'document':
      return '📎 Documento';
    default:
      return message.body;
  }
};

// ChatItems component with updated logic to handle tempIdChat
const ChatItems = ({ chats, loading, loadMoreChats, hasMoreChats, incomingMessages, setChats }) => {
  const { selectedChatId, setSelectedChatId } = useContext(ChatInterfaceClick);
  const { tempIdChat, setTempIdChat } = useContext(TempNewMessage);
  const observerRef = useRef(null);
  const lastChatRef = useRef(null);
  const { callEndpoint } = useFetchAndLoad();
  const [readChats, setReadChats] = useState(new Set());
  const { theme } = useTheme();
  //const userId = GetCookieItem("userData") ? JSON.parse(GetCookieItem("userData")).id : null;

  const renderAckStatus = (ackStatus) => {
    switch (ackStatus) {
      case -1: // ACK_ERROR
        return <AlertTriangle size={14} className="text-yellow-500" />;
      case 0: // ACK_PENDING
        return <Clock size={14} className="text-gray-400" />;
      case 1: // ACK_SERVER
        return <Check size={14} className="text-gray-400" />;
      case 2: // ACK_DEVICE
        return (
          <div className="relative">
            <Check size={14} className="text-gray-400" />
            <Check size={14} className="text-gray-400 absolute top-0 left-1" />
          </div>
        );
      case 3: // ACK_READ
        return (
          <div className="relative">
            <Check size={14} className="text-blue-500" />
            <Check size={14} className="text-blue-500 absolute top-0 left-1" />
          </div>
        );
      default:
        return null;
    }
  };

  const handleUpdateChat = async (idChat, dataChat) => {
    try {
      await callEndpoint(updateChat(idChat, dataChat), `update_chat_${idChat}`);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === idChat
            ? { ...chat, ...dataChat }
            : chat
        )
      );
    } catch (error) {
      console.error("Error actualizando chat ", error);
    }
  };

  // Función para marcar chat como leído
  const markChatAsRead = async (chatId) => {
    try {
      await handleUpdateChat(chatId, { unread_message: 0 });
      setReadChats(prev => new Set(prev).add(chatId));
    } catch (error) {
      console.error("Error marcando chat como leído", error);
    }
  };

  // Función para manejar el click normal del chat (marca como leído)
  const handleChatClick = (item) => {
    setTempIdChat(null);
    const updates = {};

    if (item.state === "PENDING" && item.state !== "CLOSED") {
      updates.state = "OPEN";
    }

    if (item.unread_message > 0) {
      markChatAsRead(item.id);
    }

    if (Object.keys(updates).length > 0) {
      handleUpdateChat(item.id, updates);
    }

    setSelectedChatId({
      id: item.id,
      tag_id: item.tag_id,
      status: item.state,
      idContact: item.contact_id,
      name: item.contact_name,
      photo: item.avatar,
      number: item.contact_phone,
    });
  };

  // Función para manejar el click del ojo (solo visualizar, no marca como leído)
  const handleEyeClick = (e, item) => {
    e.stopPropagation();
    setTempIdChat(null);
    setSelectedChatId({
      id: item.id,
      tag_id: item.tag_id,
      status: item.state,
      idContact: item.contact_id,
      name: item.contact_name,
      photo: item.avatar,
      number: item.contact_phone,
    });
  };

  // Manejar mensajes entrantes
  useEffect(() => {
    if (incomingMessages && incomingMessages.chat_id) {
      setReadChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(incomingMessages.chat_id);
        return newSet;
      });
    }
  }, [incomingMessages]);

  // Sincronizar estado de lectura con el backend
  useEffect(() => {
    const syncReadStatus = async () => {
      const chatsToUpdate = chats.filter(chat =>
        readChats.has(chat.id) &&
        (chat.unread_message > 0 || chat.unreadCount > 0) &&
        !isChatSelected(chat.id)
      );

      for (const chat of chatsToUpdate) {
        await handleUpdateChat(chat.id, { unread_message: 0 });
      }
    };

    if (readChats.size > 0) {
      syncReadStatus();
    }
  }, [readChats]);

  // Infinity scroll logic
  useEffect(() => {
    if (loading || !hasMoreChats) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreChats();
        }
      },
      { threshold: 0.5 }
    );

    if (lastChatRef.current) {
      observer.observe(lastChatRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMoreChats, loadMoreChats, chats.length]);

  const isChatSelected = (chatId) => {
    if (selectedChatId && selectedChatId.id === chatId) {
      return true;
    }
    if (tempIdChat && tempIdChat === chatId) {
      return true;
    }
    return false;
  };

  if (loading && chats.length === 0) {
    return (
      <div className={`flex justify-center items-center py-10`}>
        <Loader className="animate-spin" size={24} />
      </div>
    );
  } else if (chats.length === 0) {
    return (
      <div className={`flex justify-center items-center py-4 bg-transparent`}>
        No hay chats disponibles
      </div>
    );
  }

  return (
    <AbilityGuard
      abilities={[ABILITIES.CHATS.VIEW]}
      fallback={
        <div className={`flex justify-center items-center py-10 
        bg-[rgb(var(--color-bg-${theme}-secondary))] 
        text-[rgb(var(--color-text-secondary-${theme}))]`}>
          No tienes permisos para ver la lista de chats
        </div>
      }
    >
      <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
        {chats.map((item, index) => {
          const { bg, text } = getUserLabelColors(item.by_user);

          return (
            <div
              key={item.id}
              data-chat-id={item.id}
              ref={index === chats.length - 1 ? lastChatRef : null}
              className={`relative w-full flex items-center justify-between p-4 
                ${theme === 'light'
                  ? isChatSelected(item.id)
                    ? 'bg-[#e9e6e6]'
                    : 'bg-[#f9f9f9]'
                  : isChatSelected(item.id)
                    ? 'bg-[#2e2f2f]'
                    : 'bg-[#161717]'
                }
                hover:bg-[rgb(var(--input-hover-bg-${theme}))] cursor-pointer`}
              onClick={() => handleChatClick(item)}
            >
              {/* Etiqueta de agente */}
              <AbilityGuard abilities={[ABILITIES.CHATS.FILTER_BY_AGENT]}>
                {item.by_user && (
                  <div className={`absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded-full 
                    ${bg} ${text} font-semibold whitespace-nowrap`}>
                    {item.by_user}
                  </div>
                )}
              </AbilityGuard>

              {/* Tag del chat */}
              {item.tag_name && (
                <div 
                  className="absolute top-1 left-1 text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: item.tag_color || '#666',
                    color: item.tag_color ? '#fff' : '#fff'
                  }}
                >
                  {item.tag_name}
                </div>
              )}

              {/* Info del chat (resto del contenido) */}
              <div className="relative w-10 h-10 flex-shrink-0 mr-3">
                <img
                  src={item.avatar || "@/assets/images/default-avatar.jpg"}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover object-center"
                />
              </div>

              <div className="flex-1 min-w-0 m-2">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium text-sm md:text-base text-[rgb(var(--color-text-primary-${theme}))] truncate 
                    ${item.tag_name ? 'mt-4' : ''}`}>
                    {item.contact_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs text-[rgb(var(--color-text-secondary-${theme}))] flex-shrink-0`}>
                      {formatTimestamp(item.updated_at || item.timestamp)}
                    </span>

                    {/* Botón Eye - Solo visible para usuarios con permiso FILTER_BY_AGENT */}
                    <AbilityGuard abilities={[ABILITIES.CHATS.FILTER_BY_AGENT]} fallback={null}>
                      <button
                        onClick={(e) => handleEyeClick(e, item)}
                        className={`p-1 rounded-full hover:bg-[rgb(var(--input-hover-bg-${theme}))] 
                          text-[rgb(var(--color-text-secondary-${theme}))]
                          hover:text-[rgb(var(--color-primary-${theme}))]
                          transition-colors duration-200`}
                        title="Ver chat sin marcar como leído"
                      >
                        <Eye size={16} />
                      </button>
                    </AbilityGuard>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1 overflow-hidden min-w-0">
                    {item.from_me === "true" && (
                      <span className="shrink-0">{renderAckStatus(item.ack)}</span>
                    )}
                    <span className={`text-sm truncate text-[rgb(var(--color-text-secondary-${theme}))]`}>
                      {item.last_message || getMessagePreview(item)}
                    </span>
                  </div>

                  {/* Burbuja de mensajes no leídos */}
                  {(item.unread_message > 0 || item.unreadCount > 0) &&
                    !readChats.has(item.id) &&
                    (selectedChatId?.id !== item.id || tempIdChat !== item.id) && (
                      <div className={`flex-shrink-0 bg-[rgb(var(--color-primary-${theme}))] 
      text-[rgb(var(--color-text-primary-${theme}))] rounded-full w-5 h-5 
      flex items-center justify-center text-xs`}>
                        {item.unread_message || item.unreadCount}
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && chats.length > 0 && (
          <div className={`flex justify-center items-center py-4 bg-transparent`}>
            <Loader className="animate-spin" size={20} />
          </div>
        )}
      </div>
    </AbilityGuard>
  );
};
// Updated ChatList component with proper handling of filters and search
const ChatList = ({ role = "admin" }) => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [, setPaginationInfo] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  const chatListRef = useRef(null);
  const { messageData, setMessageData } = useContext(WebSocketMessage);
  const [messageDataLocal, setMessageDataLocal] = useState(null);
  const { selectedChatId } = useContext(ChatInterfaceClick);
  const { tempIdChat } = useContext(TempNewMessage);
  const { stateSelected } = useContext(StateFilter);
  const { tagSelected } = useContext(TagFilter);
  const { agentSelected } = useContext(AgentFilter);
  const [tags, setTags] = useState([]);
  const { hasAbility } = useAuth();

  // Estado para controlar qué tipo de carga estamos haciendo
  const [loadingState, setLoadingState] = useState({
    type: null, // 'filter' | 'search' | 'pagination'
    isActive: false
  });

  // Debounce para la búsqueda
  const [searchDebounce, setSearchDebounce] = useState(null);

  // Función para limpiar el estado cuando cambiamos el tipo de carga
  const resetChatState = () => {
    setPage(1);
    setHasMoreChats(true);
    setChats([]);
  };

  // Cargar tags al inicio
  const loadTags = async () => {
    try {
      const response = await callEndpoint(getTags({ page: 1 }));
      setTags(response.data || []);
    } catch (error) {
      console.error("Error obteniendo Tags:", error);
      setTags([]);
    }
  };

  // Función principal para cargar chats
  const loadChats = async (params = {}, append = false) => {
    if (loadingState.isActive) return;

    try {
      setLoadingState({ type: params.type || 'filter', isActive: true });

      const trimmedQuery = searchQuery.trim();
      const isPhone = /^\+?\d+$/.test(trimmedQuery);

      // Siempre incluir parámetros base
      const filterParams = {
        page: params.page || 1,
        state: params.state || stateSelected || 'OPEN'
      };

      // Agregar filtros opcionales
      if (tagSelected) filterParams.id_tag = tagSelected;
      if (agentSelected) filterParams.agent_id = agentSelected;

      // Manejar búsqueda por nombre o teléfono
      if (trimmedQuery) {
        if (isPhone) {
          filterParams.phone = trimmedQuery.replace(/^0+/, '');
        } else {
          filterParams.name = trimmedQuery;
        }

        // Cuando hay búsqueda, ignoramos la paginación
        delete filterParams.page;
      }

      console.log('API Parameters:', filterParams);
      const response = await callEndpoint(getChatList(filterParams), 'chatList');;
      console.log("Respuesta de la API:", response);
      setPaginationInfo({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        total: response.total || 0
      });

      setHasMoreChats((response.current_page || 1) < (response.last_page || 1));

      const chatData = response.data || [];
      console.log("Datos de chats recibidos:", chatData);

      const enrichedChats = await Promise.all(
        chatData.map(async (chat) => {
          return {
            ...chat,
            avatar: chat.profile_picture || "https://th.bing.com/th/id/OIP.hmLglIuAaL31MXNFuTGBgAHaHa?rs=1&pid=ImgDetMain",
          };
        })
      );

      // Actualizar el estado de chats
      if (append) {
        setChats(prev => {
          // Evitar duplicados al hacer append
          const existingIds = new Set(prev.map(chat => chat.id));
          const newChats = enrichedChats.filter(chat => !existingIds.has(chat.id));
          return [...prev, ...newChats];
        });
        console.log("Chats añadidos:", enrichedChats);
      } else {
        setChats(enrichedChats);
        console.log("Chats cargados:", enrichedChats);
      }

    } catch (error) {
      console.error("Error loading chats:", error);
      if (!append) {
        setChats([]);
      }
      setHasMoreChats(false);
    } finally {
      setLoadingState({ type: null, isActive: false });
    }
  };

  // Función para cargar más chats (paginación)
  const loadMoreChats = useCallback(() => {
    if (!hasMoreChats || loadingState.isActive) return;

    const nextPage = page + 1;
    setPage(nextPage);

    loadChats({
      page: nextPage,
      type: 'pagination',
      state: stateSelected
    }, true);
  }, [page, hasMoreChats, loadingState.isActive, stateSelected, searchQuery, tagSelected, agentSelected]);

  // Efecto para cargar tags iniciales
  useEffect(() => {
    loadTags();
  }, []);

  // Efecto para manejar cambios en filtros (no búsqueda)
  useEffect(() => {
    // Solo ejecutar si no hay búsqueda activa
    if (!searchQuery.trim()) {
      console.log('Aplicando filtros:', { stateSelected, tagSelected, agentSelected });
      resetChatState();
      loadChats({
        page: 1,
        state: stateSelected || 'OPEN',
        type: 'filter'
      }, false);
    }
  }, [stateSelected, tagSelected, agentSelected]);

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    // Si hay texto de búsqueda, configurar debounce
    if (searchQuery.trim()) {
      const timeout = setTimeout(() => {
        console.log('Ejecutando búsqueda:', searchQuery);
        resetChatState();
        loadChats({
          page: 1,
          type: 'search'
        }, false);
      }, 500);

      setSearchDebounce(timeout);
    } else {
      // Si no hay búsqueda, volver a los filtros
      resetChatState();
      loadChats({
        page: 1,
        state: stateSelected || 'OPEN',
        type: 'filter'
      }, false);
    }

    // Cleanup
    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  }, [searchQuery]);

  // Cargar chats iniciales
  useEffect(() => {
    const initialParams = {
      page: 1,
      state: stateSelected || "OPEN",
      type: 'initial'
    };
    loadChats(initialParams, false);
  }, []); // Solo al montar el componente

  // Efecto para manejar mensajes WebSocket
  useEffect(() => {
    if (messageData) {
      const userData = getUserData();
      const currentUserId = userData?.id;
      const canProcessMessage = 
          hasAbility(ABILITIES.CHATS.FILTER_BY_AGENT) || 
          messageData.user_id?.toString() === currentUserId?.toString();

      if (!canProcessMessage) {
          console.log("Mensaje ignorado en ChatList - no tiene permisos o no es propietario");
          return;
      }

      console.log("Procesando mensaje para el usuario actual:", currentUserId);

      const existingChatIndex = chats.findIndex(chat =>
        chat.id === messageData.chat_id ||
        (chat.number && chat.number === messageData.number)
      );

      if (existingChatIndex >= 0) {
        // Actualizar chat existente
        const updatedChats = [...chats];
        const chatToUpdate = { ...updatedChats[existingChatIndex] };

        // Verificar si es una actualización de mensaje o solo de ack
        const isNewMessage = messageData.type === 'message' || messageData.body || messageData.media_type;

        // Actualizar propiedades del chat
        if (isNewMessage) {
          chatToUpdate.last_message = getMessagePreview(messageData);
          chatToUpdate.timestamp = new Date(messageData.timestamp).toLocaleDateString();
          chatToUpdate.updated_at = messageData.timestamp;
        }
        chatToUpdate.ack = messageData.ack;
        chatToUpdate.from_me = messageData.from_me?.toString();

        // Incrementar contador solo si es un nuevo mensaje y no es del usuario actual
        if (isNewMessage && (messageData.from_me === false || messageData.from_me === "false")) {
          const currentUnread = chatToUpdate.unread_message || 0;
          chatToUpdate.unread_message = currentUnread + 1;
        }

        // Mover el chat al principio solo si es un nuevo mensaje
        if (isNewMessage) {
          console.log("Nuevo mensaje - Moviendo chat al inicio:", chatToUpdate);
          updatedChats.splice(existingChatIndex, 1);
          updatedChats.unshift(chatToUpdate);
        } else {
          console.log("Solo actualización de ACK - Manteniendo posición del chat");
          updatedChats[existingChatIndex] = chatToUpdate;
        }

        setChats(updatedChats);
      } else if (messageData.type === 'message') {
        // Crear nuevo chat solo si es un mensaje nuevo
        console.log("Creando nuevo chat para el mensaje");
        const newChat = {
          id: messageData.chat_id,
          contact_id: messageData.contact_id,
          name: messageData.contact_name || messageData.number || "Desconocido",
          number: messageData.number,
          last_message: getMessagePreview(messageData),
          timestamp: new Date(messageData.timestamp).toLocaleDateString(),
          updated_at: messageData.timestamp,
          avatar: messageData.profile_picture || "https://th.bing.com/th/id/OIP.hmLglIuAaL31MXNFuTGBgAHaHa?rs=1&pid=ImgDetMain",
          unread_message: messageData.from_me === false || messageData.from_me === "false" ? 1 : 0,
          state: "PENDING",
          ack: messageData.ack,
          from_me: messageData.from_me?.toString(),
          tag_id: null,
          by_user: null
        };

        setChats(prev => [newChat, ...prev]);
      }

      setMessageDataLocal(messageData);
      setMessageData(null);
    }
  }, [messageData, chats, hasAbility]);

  // Scroll al inicio cuando se selecciona un chat
  useEffect(() => {
    if ((selectedChatId || tempIdChat) && chatListRef.current) {
      chatListRef.current.scrollTop = 0;
    }
  }, [selectedChatId, tempIdChat]);
  useEffect(() => {
    const handleChatStateChange = (event) => {
      const { chatId, shouldRemove } = event.detail;

      if (shouldRemove) {
        // La animación ya se habrá aplicado en el componente que disparó el evento
        // Solo necesitamos actualizar el estado después de que termine la animación
        setTimeout(() => {
          setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        }, 300);
      }
    };

    window.addEventListener('chatStateChanged', handleChatStateChange);
    return () => window.removeEventListener('chatStateChanged', handleChatStateChange);
  }, [setChats]);
  // Verificar permisos al inicio
  if (!hasAbility(ABILITIES.CHATS.VIEW)) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-900 text-gray-400">
        No tienes permisos para acceder a esta sección
      </div>
    );
  }



  return isMobile ? (
    <div className="w-full  sm:w-80 border-r border-gray-700 flex flex-col text-white h-screen">
      <div className="flex flex-col flex-shrink-0 mt-14">
        <ChatHeader />
        <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <AgentSelect role={role} />
        <TagsBar tags={tags} />
      </div>
      <div className="flex-1 overflow-y-auto" ref={chatListRef}>
        <ChatItems
          chats={chats}
          setChats={setChats}
          loading={loading}
          loadMoreChats={loadMoreChats}
          hasMoreChats={hasMoreChats}
          incomingMessages={messageDataLocal}
        />
      </div>
    </div>
  ) : (
    <div className="flex-1 border-r border-gray-700 flex flex-col text-white pt-10 ml-10 overflow-y-auto">
      <div className="flex flex-col flex-shrink-0">
        <ChatHeader />
        <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <AgentSelect role={role} />
        <TagsBar tags={tags} />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide" ref={chatListRef}>
        <ChatItems
          chats={chats}
          setChats={setChats}
          loading={loading}
          loadMoreChats={loadMoreChats}
          hasMoreChats={hasMoreChats}
          incomingMessages={messageDataLocal}
        />
      </div>
    </div>
  );
};

export default ChatList;