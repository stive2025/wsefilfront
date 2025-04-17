/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Search, MessageSquarePlus, ChevronLeftCircle, ChevronRightCircle, Loader } from "lucide-react";
import { ChatInterfaceClick, NewMessage, StateFilter, TagFilter, AgentFilter } from "/src/contexts/chats.js";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { getChatList, updateChat } from "/src/services/chats.js";
import { getContact, getContactChatsByName, getContactChatsByPhone } from "/src/services/contacts.js";
import { getAgents } from "/src/services/agents.js";
import Resize from "/src/hooks/responsiveHook.jsx";
//import { GetCookieItem } from "/src/utilities/cookies.js" // Asumiendo que existe esta función
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
          {Object.entries(tags).map(([key, value]) => (
            <li
              key={key}
              className={`flex items-center gap-2 cursor-pointer rounded-full p-2 text-xs ${tagSelected === parseInt(key) ? "bg-gray-700 text-white" : "hover:text-gray-300"
                }`}
              onClick={() => setTagSelected(parseInt(key))}
            >
              {value}
            </li>
          ))}
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

const ChatItems = ({ chats, loading, loadMoreChats, hasMoreChats }) => {
  const { selectedChatId, setSelectedChatId } = useContext(ChatInterfaceClick);
  const observerRef = useRef(null);
  const lastChatRef = useRef(null);
  const { callEndpoint } = useFetchAndLoad();
  const [readChats, setReadChats] = useState(new Set());

  const handleUpdateChat = async (idChat, dataChat) => {
    try {
      const response = await callEndpoint(updateChat(idChat, dataChat), `update_chat_${idChat}`);
      console.log("Chat actualizado ", response);
    } catch (error) {
      console.error("Error actualizando chat ", error);
    }
  };

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
  }

  if (chats.length === 0) {
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
            if (item.state === "PENDING" && item.state !=="CLOSED") {
              handleUpdateChat(item.id, { unread_message: 0, state: "OPEN" });
              // Marca este chat como leído
              setReadChats(prev => new Set(prev).add(item.id));
            } else if (item.unread_message > 0) {
              handleUpdateChat(item.id, { unread_message: 0 });
              // Marca este chat como leído
              setReadChats(prev => new Set(prev).add(item.id));
            }

            setSelectedChatId({
              id: item.id,
              status: item.state,
              idContact: item.idContact,
              name: item.name,
              photo: item.avatar,
              number: item.number,
            });
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
            <div className="text-xs md:text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] sm:max-w-[200px]">
              {item.last_message || item.lastMessage}
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

  // Contextos para filtros (UI solamente por ahora)
  const { stateSelected } = useContext(StateFilter);
  const { tagSelected } = useContext(TagFilter);
  const { agentSelected } = useContext(AgentFilter);

  // Estado para indicar si se está realizando una búsqueda
  const [isSearching, setIsSearching] = useState(false);

  // Ejemplo de tags (ahora manejados como objetos con id)
  const tags = {
    1: "Revisión",
    2: "Confirmar Pago",
    3: "Pago pendiente",
    4: "Llamar mas tarde",
  };

  // Obtener el id del usuario logueado desde las cookies
  // const userId = GetCookieItem("userData") ? JSON.parse(GetCookieItem("userData")).id : null;

  const loadChats = async (params = {}, append = false) => {
    try {
      let endpoint;
      let endpointKey = 'chatList';

      // Verifica si hay una consulta de búsqueda
      if (searchQuery) {
        setIsSearching(true);

        // Determina si es búsqueda por teléfono o por nombre
        if (/^\d+$/.test(searchQuery)) {
          endpoint = getContactChatsByPhone(searchQuery);
          endpointKey = 'contactChatsByPhone';
        } else {
          endpoint = getContactChatsByName(searchQuery);
          endpointKey = 'contactChatsByName';
        }
      } else {
        setIsSearching(false);

        // Sin búsqueda, usa el endpoint normal de chats
        // NOTA: Actualmente getChatList no admite filtros, pero la UI está preparada

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

        endpoint = getChatList(filterParams);
        /* 
        // CÓDIGO COMENTADO: Para cuando el backend implemente los filtros        
        // Aplica filtro por etiqueta
        if (tagSelected !== 0) {
          filterParams.id_tag = tagSelected;
        }
        
        // Aplica filtro por agente
      
        
       
        */
      }

      const response = await callEndpoint(endpoint, endpointKey);
      console.log("AQUI:", endpoint, "-", endpointKey);
      console.log(response);

      setPaginationInfo({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total
      });

      setHasMoreChats(response.current_page < response.last_page);

      const chatData = response.data || [];

      const enrichedChats = await Promise.all(
        chatData.map(async (chat, index) => {
          if (chat.contact_id) {
            try {
              const contactKey = `contact_${chat.contact_id}_${index}`;
              const contactResponse = await callEndpoint(getContact(chat.contact_id), contactKey);
              if (!contactResponse) {
                return {
                  ...chat,
                  name: "Unknown Contact",
                  avatar: "/src/assets/images/default-avatar.jpg",
                };
              } else {
                return {
                  ...chat,
                  idContact: contactResponse.id,
                  name: contactResponse.name,
                  number: contactResponse.phone_number,
                  avatar: contactResponse.profile_picture || "https://th.bing.com/th/id/OIP.hmLglIuAaL31MXNFuTGBgAHaHa?rs=1&pid=ImgDetMain",
                };
              }
            } catch (error) {
              console.error("Error fetching contact details for ID:", chat.contact_id, error);
            }
          }
          return chat;
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

    // Si estamos buscando, no incluimos parámetro de página ya que 
    // los endpoints de búsqueda podrían no soportarlo
    const params = isSearching ? {} : { page: nextPage };

    loadChats(params, true);
  }, [page, hasMoreChats, loading, searchQuery, isSearching]);

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
    // Solo recargamos si no estamos en modo búsqueda
    // porque los endpoints de búsqueda no soportan estos filtros
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
        {isSearching && (
          <div className="p-2 bg-gray-800 text-xs text-amber-400 text-center">
            Modo búsqueda activo. Los filtros se aplicarán cuando esté disponible en el backend.
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto" ref={chatListRef}>
        <ChatItems
          chats={chats}
          loading={loading}
          loadMoreChats={loadMoreChats}
          hasMoreChats={hasMoreChats}
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
        {isSearching && (
          <div className="p-2 bg-gray-800 text-xs text-amber-400 text-center">
            Modo búsqueda activo. Los filtros se aplicarán cuando esté disponible en el backend.
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide" ref={chatListRef}>
        <ChatItems
          chats={chats}
          loading={loading}
          loadMoreChats={loadMoreChats}
          hasMoreChats={hasMoreChats}
        />
      </div>
    </div>
  );
};

export default ChatList;