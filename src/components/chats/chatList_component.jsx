/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Search, ChevronLeftCircle, ChevronRightCircle, Loader, Check, Clock, AlertTriangle } from "lucide-react";
import { ChatInterfaceClick, StateFilter, TagFilter, AgentFilter, WebSocketMessage, TempNewMessage } from "@/contexts/chats.js";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { getChatList, updateChat } from "@/services/chats.js";
import { getContact, getContactChatsByName, getContactChatsByPhone } from "@/services/contacts.js";
import { getAgents } from "@/services/agents.js";
import { getTags } from "@/services/tags.js";
import Resize from "@/hooks/responsiveHook.jsx";
import { getUserData } from "@/services/authService.js";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard';
import { useAuth } from '@/contexts/authContext';
import { useTheme } from "@/contexts/themeContext";

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
            className={`w-full bg-[rgb(var(--color-bg-${theme}))] rounded-lg pl-8 pr-2 py-1 
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

  return (
    <AbilityGuard abilities={[ABILITIES.CHATS.FILTER_BY_TAG, ABILITIES.CHATS.FILTER_BY_STATUS]} fallback={null}>
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
            <li
              className={`flex items-center gap-2 cursor-pointer rounded-full p-2 text-xs ${tagSelected === 0 ? "bg-gray-700 text-white" : "hover:text-gray-300"
                }`}
              onClick={() => setTagSelected(0)}
            >
              Todos
            </li>
            {Array.isArray(tags) ? (
              tags.map((tag) => (
                <li
                  key={tag.id}
                  className={`flex items-center gap-2 cursor-pointer rounded-full p-2 text-xs ${tagSelected === tag.id ? "bg-gray-700 text-white" : "hover:text-gray-300"
                    }`}
                  onClick={() => { setTagSelected(tag.id); console.log("TAG", tagSelected) }}
                >
                  {tag.name}
                </li>
              ))
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

  return (
    <AbilityGuard abilities={[ABILITIES.CHATS.FILTER_BY_AGENT]} fallback={null}>
      <div className={`cursor-pointer p-4 border-b border-[rgb(var(--color-text-secondary-${theme}))] 
        bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
        <select
          className={`w-full bg-[rgb(var(--color-bg-${theme}-secondary))] outline-none 
            ${agentSelected ? `text-[rgb(var(--color-text-primary-${theme}))]` :
              `text-[rgb(var(--color-text-secondary-${theme}))]`}
            hover:bg-[rgb(var(--input-hover-bg-${theme}))]
            focus:border-[rgb(var(--input-focus-border-${theme}))]`}
          value={agentSelected || ""}
          onChange={(e) => {
            const agentId = e.target.value ? parseInt(e.target.value) : null;
            setAgentSelected(agentId);
          }}
          disabled={loading}
        >
          <option value="">
            {loading ? "Cargando agentes..." : "Todos los agentes"}
          </option>
          {agents.length > 0 ? (
            agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))
          ) : (
            <option disabled>No hay agentes</option>
          )}
        </select>
      </div>
    </AbilityGuard>
  );
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

      // Actualiza también el estado local de los chats
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

  // El useEffect para manejar los mensajes entrantes
  useEffect(() => {
    console.log("Incoming messages:", incomingMessages);
    if (incomingMessages && incomingMessages.chat_id) {
      setReadChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(incomingMessages.chat_id);
        return newSet;
      });
    }
  }, [incomingMessages]);

  // useEffect para mantener actualizado el contador en chats leídos
  useEffect(() => {
    // Verificar y actualizar todos los chats que estén en readChats
    chats.forEach(chat => {
      if (readChats.has(chat.id) && (chat.unread_message > 0 || chat.unreadCount > 0)) {
        handleUpdateChat(chat.id, { unread_message: 0 });
        console.log(`Actualizando contador de mensajes no leídos a 0 para chat ${chat.id}`);
      }
    });
  }, [chats, readChats]);

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

  // Helper function to check if a chat is currently selected
  const isChatSelected = (chatId) => {
    // Check if selected through selectedChatId
    if (selectedChatId && selectedChatId.id === chatId) {
      return true;
    }
    
    // Check if selected through tempIdChat
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
      <div className={`flex justify-center items-center py-10 
        text-[rgb(var(--color-text-secondary-${theme}))]`}>
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
        {chats.map((item, index) => (
          <div
            key={item.id}
            data-chat-id={item.id}
            ref={index === chats.length - 1 ? lastChatRef : null}
            className={`w-full flex items-center space-x-3 p-4 
              ${theme === 'light'
                ? isChatSelected(item.id)
                  ? 'bg-[#e9e6e6]'  // seleccionado claro
                  : 'bg-[#f9f9f9]'  // no seleccionado claro
                : isChatSelected(item.id)
                  ? 'bg-[#2e2f2f]'  // seleccionado oscuro
                  : 'bg-[#161717]'  // no seleccionado oscuro
              }
              hover:bg-[rgb(var(--input-hover-bg-${theme}))] cursor-pointer`}
            onClick={() => {
               setTempIdChat(null);
              // Verificar si el chat está en estado pendiente y actualizarlo
              if (item.state === "PENDING" && item.state !== "CLOSED") {
                handleUpdateChat(item.id, { unread_message: 0, state: "OPEN" });
                setReadChats(prev => new Set(prev).add(item.id));
              } 
              // Marcar como leído si tiene mensajes no leídos
              else if (item.unread_message > 0) {
                handleUpdateChat(item.id, { unread_message: 0 });
                setReadChats(prev => new Set(prev).add(item.id));
              }
                setSelectedChatId({
                  id: item.isContact? item.chat_id: item.id,
                  tag_id: item.tag_id,
                  status: item.state,
                  idContact: item.idContact,
                  name: item.name,
                  photo: item.avatar,
                  number: item.number,
                });
            }}
          >
            <div className="relative w-10 h-10 flex-shrink-0">
              <img
                src={item.avatar || "@/assets/images/default-avatar.jpg"}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover object-center"
              />
              {item.online && (
                <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                  border-2 border-[rgb(var(--color-bg-${theme}-secondary))] rounded-full`}>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className={`font-medium text-sm md:text-base 
                text-[rgb(var(--color-text-primary-${theme}))]`}>
                {item.name}
              </div>
              <div className="flex items-center gap-1 overflow-hidden">
                {item.from_me === "true" && (
                  <span className="shrink-0">{renderAckStatus(item.ack)}</span>
                )}
                <span className={`overflow-hidden text-ellipsis whitespace-nowrap 
                  text-[rgb(var(--color-text-secondary-${theme}))]`}>
                  {item.last_message || item.lastMessage}
                </span>
              </div>
            </div>

            <div className={`text-xs text-[rgb(var(--color-text-secondary-${theme}))] 
              flex flex-col items-end`}>
              <div>{item.timestamp || new Date(item.updated_at).toLocaleDateString()}</div>
              {(item.unread_message > 0 || item.unreadCount > 0) && !readChats.has(item.id) && !isChatSelected(item.id) && (
                <div className={`bg-[rgb(var(--color-primary-${theme}))] 
                  text-[rgb(var(--color-text-primary-${theme}))] 
                  rounded-full w-5 h-5 flex items-center justify-center mt-1`}>
                  {item.unread_message || item.unreadCount}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && chats.length > 0 && (
          <div className={`flex justify-center items-center py-4 
            bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
            <Loader className="animate-spin" size={20} />
          </div>
        )}
      </div>
    </AbilityGuard>
  );
};

// Updated ChatList component with proper handling of tempIdChat
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
  const [isSearching, setIsSearching] = useState(false);
  const [tags, setTags] = useState([]);
  const { hasAbility } = useAuth();

  useEffect(() => {
    const initialParams = {
      page: 1,
      state: "PENDING"
    };

    loadChats(initialParams, false);
  }, [stateSelected]);

useEffect(() => {
  if (!selectedChatId && !tempIdChat && chats.length > 0) {
    setPage(1);
    setHasMoreChats(true);
    loadChats({ page: 1 }, false);
  }
}, [selectedChatId, tempIdChat]);

  useEffect(() => {
    if (messageData && messageData.body) {
      console.log("Mensaje recibido:", messageData);
      const userData = getUserData();
      const currentUserId = userData?.id;

      if (!currentUserId || messageData.user_id !== currentUserId) {
        console.log("Mensaje ignorado - user_id no coincide:",
          "id en mensaje:", messageData.user_id,
          "id en localStorage:", currentUserId);
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

        // Actualizar último mensaje y contador
        chatToUpdate.last_message = messageData.body;
        chatToUpdate.timestamp = new Date().toLocaleString();

        // Comprobar si el chat está seleccionado por ID normal o por ID temporal
        const isChatCurrentlySelected = 
          (selectedChatId && selectedChatId.id === chatToUpdate.id) || 
          (tempIdChat && tempIdChat === chatToUpdate.id);

        // Incrementar contador solo si no es el chat seleccionado actualmente
        if (!isChatCurrentlySelected) {
          chatToUpdate.unread_message = (chatToUpdate.unread_message || 0) + 1;
        }

        // Si hay archivos adjuntos
        if (messageData.media_path) {
          chatToUpdate.last_message = messageData.media_type === 'image'
            ? '📷 Imagen'
            : messageData.media_type === 'video'
              ? '🎥 Video'
              : messageData.media_type === 'audio'
                ? '🎵 Audio'
                : '📎 Archivo';
        }

        // Mover el chat actualizado al principio de la lista
        updatedChats.splice(existingChatIndex, 1);
        updatedChats.unshift(chatToUpdate);

        setChats(updatedChats);
      } else {
        // Crear nuevo chat
        const newChat = {
          id: messageData.chat_id,
          number: messageData.number,
          name: messageData.sender_name || messageData.number,
          last_message: messageData.body,
          timestamp: new Date().toLocaleString(),
          // Solo incrementar contador si no es el chat seleccionado
          unread_message: (selectedChatId?.id === messageData.chat_id || 
                         tempIdChat === messageData.chat_id) ? 0 : 1,
          state: (tempIdChat && tempIdChat === messageData.chat_id) ? "OPEN" : "PENDING",
          avatar: "https://th.bing.com/th/id/OIP.hmLglIuAaL31MXNFuTGBgAHaHa?rs=1&pid=ImgDetMain"
        };

        // Si hay archivos adjuntos
        if (messageData.media_path) {
          newChat.last_message = messageData.media_type === 'image'
            ? '📷 Imagen'
            : messageData.media_type === 'video'
              ? '🎥 Video'
              : messageData.media_type === 'audio'
                ? '🎵 Audio'
                : '📎 Archivo';
        }

        // Agregar nuevo chat al principio de la lista
        setChats(prevChats => [newChat, ...prevChats]);
      }

      // Notificar al componente padre sobre el nuevo mensaje
      if (messageData != null) {
        setMessageDataLocal(messageData);
        setMessageData(null);

        // Opcional: Mostrar notificación del navegador si la ventana no está activa
        if (document.hidden && "Notification" in window && Notification.permission === "granted") {
          new Notification("Nuevo mensaje", {
            body: messageData.body,
            icon: "./images/logoCRM.png"
          });
        }
      }
    }
  }, [messageData, chats, selectedChatId, tempIdChat]);

  const loadTags = async () => {
    try {
      const response = await callEndpoint(getTags({ page: 1 }));
      setTags(response.data || []);
    } catch (error) {
      console.error("Error obteniendo Tags:", error);
      setTags([]);
    }
  };

  const loadChats = async (params = {}, append = false) => {
    try {
      let endpoint;
      let endpointKey = 'chatList';
      let isContact = false;

      // Verifica si hay una consulta de búsqueda
      if (searchQuery) {
        setIsSearching(true);

        // Determina si es búsqueda por teléfono o por nombre
        if (/^\d+$/.test(searchQuery)) {
          endpoint = getContactChatsByPhone(searchQuery);
          endpointKey = 'contactChatsByPhone';
          isContact = true;
        } else {
          endpoint = getContactChatsByName(searchQuery);
          endpointKey = 'contactChatsByName';
          isContact = true;
        }
      } else {
        setIsSearching(false);

        const filterParams = { ...params };
        console.log(filterParams)

        if (stateSelected !== "ALL") {
          filterParams.state = stateSelected;
          console.log(filterParams)
        }

        if (agentSelected) {
          filterParams.agent_id = agentSelected;
        }

        if (tagSelected !== 0) {
          filterParams.id_tag = tagSelected;
          console.log("filterParams.tag_id", filterParams)
        }

        endpoint = getChatList(filterParams);
      }

      const response = await callEndpoint(endpoint, endpointKey);
      setPaginationInfo({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total
      });

      setHasMoreChats(response.current_page < response.last_page);

      const chatData = response.data || [];
      console.log("Datos de chats:", chatData);
      const enrichedChats = await Promise.all(
        chatData.map(async (chat, index) => {
          let chatIsContact = isContact;

          if (chat.contact_id) {
            try {
              const contactKey = `contact_${chat.contact_id}_${index}`;
              const contactResponse = await callEndpoint(getContact(chat.contact_id), contactKey);
              if (!contactResponse) {
                return {
                  ...chat,
                  name: "Unknown Contact",
                  avatar: "@/assets/images/default-avatar.jpg",
                  isContact: chatIsContact
                };
              } else {
                return {
                  ...chat,
                  idContact: contactResponse.id,
                  name: contactResponse.name,
                  number: contactResponse.phone_number,
                  avatar: contactResponse.profile_picture || "https://th.bing.com/th/id/OIP.hmLglIuAaL31MXNFuTGBgAHaHa?rs=1&pid=ImgDetMain",
                  isContact: chatIsContact
                };
              }
            } catch (error) {
              console.error("Error fetching contact details for ID:", chat.contact_id, error);
              return {
                ...chat,
                isContact: chatIsContact,
                profile_picture: chat.profile_picture || "https://th.bing.com/th/id/OIP.hmLglIuAaL31MXNFuTGBgAHaHa?rs=1&pid=ImgDetMain",
              };
            }
          }
          return {
            ...chat,
            isContact: chatIsContact,
            profile_picture: chat.profile_picture || "https://th.bing.com/th/id/OIP.hmLglIuAaL31MXNFuTGBgAHaHa?rs=1&pid=ImgDetMain",
          };
        })
      );

      if (append) {
        setChats(prev => [...prev, ...enrichedChats]);
      } else {
        setChats(enrichedChats);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
      if (!append) {
        setChats([]);
      }
      setHasMoreChats(false);
    }
  };

  const loadMoreChats = useCallback(() => {
    if (!hasMoreChats || loading) return;

    const nextPage = page + 1;
    setPage(nextPage);
    const params = isSearching ? {} : { page: nextPage };

    loadChats(params, true);
  }, [page, hasMoreChats, loading, searchQuery, isSearching]);

  useEffect(() => {
    loadTags();
  }, []);

  // Efecto para cargar chats cuando cambian los criterios
  useEffect(() => {
    setPage(1);
    setHasMoreChats(true);

    // Solo incluimos parámetro de página para getChatList, no para búsquedas
    const params = searchQuery ? {} : { page: 1 };

    loadChats(params, false);
  }, [searchQuery]);

  // NOTA: Este efecto está comentado porque los filtros no afectan la búsqueda actualmente

  useEffect(() => {
    if (!isSearching) {
      setPage(1);
      setHasMoreChats(true);
      loadChats({ page: 1 }, false);
    }
  }, [stateSelected, tagSelected, agentSelected]);

  useEffect(() => {
    const handleChatStateChange = async (event) => {
      const { chatId, newState, previousState } = event.detail;
      console.log(`Chat ${chatId} changed from ${previousState} to ${newState}`);

      // Si el estado actual filtrado es diferente al nuevo estado del chat
      if (stateSelected !== newState) {
        const chatElement = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (chatElement) {
          // Aplicar animación de salida
          chatElement.classList.add('fade-out');

          // Esperar a que termine la animación
          await new Promise(resolve => setTimeout(resolve, 300));

          // Remover el chat de la lista actual
          setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        }
      }
      // Si el chat cambió al estado que estamos filtrando actualmente
      else if (previousState !== newState && stateSelected === newState) {
        // Recargar la lista para incluir el nuevo chat
        loadChats({ page: 1, state: stateSelected }, false);
      }
    };

    window.addEventListener('chatStateChanged', handleChatStateChange);
    return () => window.removeEventListener('chatStateChanged', handleChatStateChange);
  }, [stateSelected]);

  // Efecto para manejar el debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setHasMoreChats(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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