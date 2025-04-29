/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Search, MessageSquarePlus, ChevronLeftCircle, ChevronRightCircle, Loader, Check, Clock, AlertTriangle } from "lucide-react";
import { ChatInterfaceClick, NewMessage, StateFilter, TagFilter, AgentFilter, WebSocketMessage } from "/src/contexts/chats.js";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { getChatList, updateChat } from "/src/services/chats.js";
import { getContact, getContactChatsByName, getContactChatsByPhone } from "/src/services/contacts.js";
import { getAgents } from "/src/services/agents.js";
import { getTags } from "/src/services/tags.js";
import Resize from "/src/hooks/responsiveHook.jsx";
import { GetCookieItem } from "/src/utilities/cookies.js" // Asumiendo que existe esta función
//import toast from "react-hot-toast";



const ChatHeader = () => {
  const { setNewMessage } = useContext(NewMessage);
  return (
    <div className="p-1 flex items-center justify-between bg-gray-900">
      <div className="flex items-center space-x-2">
        <img src="/src/assets/images/logoCRM.png" alt="Logo" className="w-22 h-9" />
      </div>
      <div className="flex space-x-2">
        <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full" onClick={() => setNewMessage(true)}>
          <MessageSquarePlus size={15} />
        </button>
      </div>
    </div>
  );
};

const SearchInput = ({ searchQuery, setSearchQuery }) => {
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="p-2 bg-gray-900">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-gray-800 rounded-lg pl-8 pr-2 py-1 text-white placeholder-gray-400"
        />
        <Search className="absolute left-1 text-gray-400" size={18} />
      </div>
    </div>
  );
};


const TagsBar = ({ tags }) => {
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
    <div className="relative flex items-center bg-gray-900 p-2">
      <button
        onClick={scrollLeft}
        className="absolute left-0 h-5 w-5 ml-2 flex items-center justify-center bg-transparent hover:bg-gray-700 active:bg-gray-700 rounded-full z-10"
      >
        <ChevronLeftCircle size={15} />
      </button>

      <div
        ref={containerRef}
        className="bg-transparent text-white h-8 w-full overflow-hidden shadow-md flex items-center p-1 overflow-x-auto scrollbar-hide mx-8"
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
        className="absolute right-0 h-5 w-5 mr-2 flex items-center justify-center bg-transparent hover:bg-gray-700 active:bg-gray-700 rounded-full z-10"
      >
        <ChevronRightCircle size={15} />
      </button>
    </div>
  );
};

const AgentSelect = ({ role }) => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [agents, setAgents] = useState([]);
  const { agentSelected, setAgentSelected } = useContext(AgentFilter);

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
    <div className="cursor-pointer p-4 flex border-b border-gray-700 bg-gray-900">
      <select
        className={`w-full bg-gray-900 outline-none ${agentSelected ? 'text-white' : 'text-gray-400'}`}
        value={agentSelected || ""}
        onChange={(e) => {
          const agentId = e.target.value ? parseInt(e.target.value) : null;
          setAgentSelected(agentId);
          console.log(agentSelected);
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
  );
};

const ChatItems = ({ chats, loading, loadMoreChats, hasMoreChats, incomingMessages, setChats }) => {
  const { selectedChatId, setSelectedChatId } = useContext(ChatInterfaceClick);
  const observerRef = useRef(null);
  const lastChatRef = useRef(null);
  const { callEndpoint } = useFetchAndLoad();
  const [readChats, setReadChats] = useState(new Set());

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


  if (loading && chats.length === 0) {
    return (
      <div className="flex justify-center items-center py-10 bg-gray-900">
        <Loader className="animate-spin" size={24} />
      </div>
    );
  } else if (chats.length === 0) {
    return (
      <div className="flex justify-center items-center py-10 bg-gray-900 text-gray-400">
        No hay chats disponibles
      </div>
    );
  }

  return (
    <div className="bg-gray-900">
      {chats.map((item, index) => (
        <div
          key={item.id}
          ref={index === chats.length - 1 ? lastChatRef : null}
          className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-800 cursor-pointer ${selectedChatId && selectedChatId.id == item.id ? "bg-gray-700" : ""
            }`}
          onClick={() => {
            if (item.state === "PENDING" && item.state !== "CLOSED") {
              // Actualizar en DB y localmente
              handleUpdateChat(item.id, { unread_message: 0, state: "OPEN" });
              // Marca este chat como leído
              setReadChats(prev => new Set(prev).add(item.id));
            } else if (item.unread_message > 0) {
              // Actualizar en DB y localmente
              handleUpdateChat(item.id, { unread_message: 0 });
              // Marca este chat como leído
              setReadChats(prev => new Set(prev).add(item.id));
            }
            if (item.isContact) {
              setSelectedChatId({
                id: item.chat_id,
                tag_id: item.tag_id,
                status: item.state,
                idContact: item.idContact,
                name: item.name,
                photo: item.avatar,
                number: item.number,
              });
            } else {
              setSelectedChatId({
                id: item.id,
                tag_id: item.tag_id,
                status: item.state,
                idContact: item.idContact,
                name: item.name,
                photo: item.avatar,
                number: item.number,
              });
            }
          }}
        >
          <div className="relative">
            <img
              src={item.avatar || "/src/assets/images/default-avatar.jpg"}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
            {item.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            )}
          </div>

          <div className="flex-1">
            <div className="font-medium text-sm md:text-base">{item.name}</div>
            <div className="flex items-center gap-1 overflow-hidden">
              {item.from_me === "true" && (
                <span className="shrink-0">{renderAckStatus(item.ack)}</span>
              )}
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {item.last_message || item.lastMessage}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-400 flex flex-col items-end">
            <div>{item.timestamp || new Date(item.updated_at).toLocaleDateString()}</div>
            {(item.unread_message > 0 || item.unreadCount > 0) && !readChats.has(item.id) && (
              <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-1">
                {item.unread_message || item.unreadCount}
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && chats.length > 0 && (
        <div className="flex justify-center items-center py-4 bg-gray-900">
          <Loader className="animate-spin" size={20} />
        </div>
      )}
    </div>
  );
};

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

  // Contextos para filtros (UI solamente por ahora)
  const { stateSelected } = useContext(StateFilter);
  const { tagSelected } = useContext(TagFilter);
  const { agentSelected } = useContext(AgentFilter);

  // Estado para indicar si se está realizando una búsqueda
  const [isSearching, setIsSearching] = useState(false);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (messageData && messageData.body) {
      // Obtener user_data de las cookies
      const userData = GetCookieItem("user_data");
      const currentUserId = userData ? JSON.parse(userData).id : null;
  
      // Verificar coincidencia de user_id
      if (!currentUserId || messageData.user_id !== currentUserId) {
        console.log("Mensaje ignorado - user_id no coincide:", 
          `Cookie: ${currentUserId}`, 
          `Mensaje: ${messageData.user_id}`);
        return;
      }
  
      console.log("Procesando mensaje para el usuario actual:", currentUserId);
      
      // Resto del código para procesar el mensaje...
      const existingChatIndex = chats.findIndex(chat => 
        chat.id === messageData.chat_id || 
        (chat.number && chat.number === messageData.number)
      );
  
      if (existingChatIndex >= 0) {
        // ... (código existente para actualizar chat)
      } else {
        // ... (código existente para nuevo chat)
      }
  
      if (messageData != null) {
        setMessageDataLocal(messageData);
        setMessageData(null);
      }
    }
  }, [messageData, chats, selectedChatId]);

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

        endpoint = getChatList(params);

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

        // Aplica filtro por etiqueta

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
                  avatar: "/src/assets/images/default-avatar.jpg",
                  isContact: chatIsContact  // Añadir la bandera aquí
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


  // Efecto para manejar el debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setHasMoreChats(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return isMobile ? (
    <div className="w-full sm:w-80 border-r border-gray-700 flex flex-col bg-gray-900 text-white h-screen">
      <div className="flex flex-col flex-shrink-0 mt-14">
        <ChatHeader />
        <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {/* Los filtros se muestran pero no están activos durante la búsqueda */}
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
    <div className="flex-1 border-r border-gray-700 flex flex-col bg-gray-900 text-white pt-10 ml-10 overflow-y-auto">
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