
/* eslint-disable react/prop-types */
import Resize from "/src/hooks/responsiveHook.jsx";
import { Search, MessageSquareShare, MessageSquarePlus, ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import { useEffect, useState, useRef, useContext } from "react";
import { ChatInterfaceClick } from "/src/contexts/chats.js";  


// Componentes reutilizables

const ChatHeader = () => (
  <div className="p-3 border-b border-gray-700 flex items-center justify-between bg-gray-900">
    <div className="flex items-center space-x-2">
      <img src="/src/assets/images/logoCRM.png" alt="Logo" className="w-30 h-12" />
    </div>
    <div className="flex space-x-2">
      <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full">
        <MessageSquareShare size={20} />
      </button>
      <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full">
        <MessageSquarePlus size={20} />
      </button>
    </div>
  </div>
);

const SearchInput = () => (
  <div className="p-4 border-b border-gray-700 bg-gray-900">
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-gray-800 rounded-lg px-4 py-2 pl-10"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
    </div>
  </div>
);

const TagsBar = ({ tags }) => {
  const containerRef = useRef(null);

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
    <div className="relative flex items-center border-b border-gray-700 bg-gray-900">
      {/* Botón izquierda */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 h-8 w-8 flex items-center justify-center bg-transparent hover:bg-gray-700 active:bg-gray-700 rounded-full z-10"
      >
        <ChevronLeftCircle size={20} />
      </button>

      <div
        ref={containerRef}
        className="bg-transparent text-white h-10 w-full shadow-md flex items-center p-1 overflow-x-auto scrollbar-hide mx-8"
      >
        <ul className="flex whitespace-nowrap">
          {Object.values(tags).map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2 cursor-pointer hover:text-gray-300 active:bg-gray-700 rounded-full p-2 text-xs"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Botón derecha */}
      <button
        onClick={scrollRight}
        className="absolute right-0 h-8 w-8 flex items-center justify-center bg-transparent hover:bg-gray-700 active:bg-gray-700 rounded-full z-10"
      >
        <ChevronRightCircle size={20} />
      </button>
    </div>
  );
};
 

const ChatItems = ({ chats }) => {
  const { setSelectedChatId } = useContext(ChatInterfaceClick);
  return ( 
  <div className="bg-gray-900">
    {chats.chats.map((item) => ( // viene el arreglo de chats
      <div
        key={item.id}
        className="flex items-center space-x-3 p-4 hover:bg-gray-800 cursor-pointer active:bg-gray-700"
        onClick={() => {setSelectedChatId(item.id);}}
      >
        <img
          src={item.avatar}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{item.lastMessage}</div>
        </div>
        <div className="text-xs text-gray-400">{item.timestamp}</div>
        <div className="text-xs text-gray-400">{item.state}</div>
      </div>
    ))}
  </div>
  );
};

const AgentSelect = ({ role, agents, selectedAgent, setSelectedAgent }) => {
  if (role !== "admin") return null;
  return (
    <div className="cursor-pointer p-4 flex border-b border-gray-700 bg-gray-900">
      <select
        className="text-xs border p-1 rounded bg-transparent text-white w-full sm:w-auto sm:p-2"
        value={selectedAgent ? selectedAgent.id : ""}
        onChange={(e) => {
          const agent = agents.find((a) => a.id === parseInt(e.target.value));
          setSelectedAgent(agent);
        }}
      >
        <option value="" disabled>
          Seleccionar agente
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

// FIN Componentes reutilizables

const ChatList = ({ role }) => {
  const isMobile = Resize();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const tags = {
    label_all: "Todos",
    label_rev: "Revisión",
    label_pay: "Confirmar Pago",
    label_pendingPay: "Pago pendiente",
    label_callLater: "Llamar mas tarde",
  };
  const chats = {
    chats: [
      {
        id: "1",
        avatar: "/src/assets/images/agent1.jpg",
        name: "José Sarmiento",
        lastMessage: "Hola, ¿en qué puedo ayudarte?Hola, ¿en qué puedo ayudarte?Hola, ¿en qué puedo ayudarte?Hola, ¿en qué puedo ayudarte?Hola, ¿en qué puedo ayudarte?Hola, ¿en qué puedo ayudarte?",
        timestamp: "10:30",
        state: "En línea",
      },
      {
        id: "2",
        avatar: "/src/assets/images/agent2.jpg",
        name: "María Pérez",
        lastMessage: "¿Cuándo puedo pasar a recoger mi pedido?",
        timestamp: "09:45",
        state: "Ocupado",
      },
      {
        id: "3",
        avatar: "/src/assets/images/agent3.jpg",
        name: "Juan López",
        lastMessage: "¿Cuál es el costo de envío?",
        timestamp: "Ayer",
        state: "Desconectado",
      },
    ],
  };

  useEffect(() => {
    if (role === "admin") {
      fetch("https://listarAgentes") // Reemplaza con tu API real
        .then((response) => response.json())
        .then((data) => setAgents(data))
        .catch((error) => console.error("Error obteniendo agentes:", error));
    }
  }, [role]);

  return isMobile ? (
    <div className="w-full sm:w-80 border-r border-gray-700 flex flex-col bg-gray-900 text-white h-screen">
      {/* Contenedor fijo para header, search, agent select y tags */}
      <div className="flex flex-col flex-shrink-0 mt-14">
        <ChatHeader />
        <SearchInput />
        <AgentSelect
          role={role}
          agents={agents}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
        />
        <TagsBar tags={tags} />
      </div>
      {/* ChatItems ocupa el resto del espacio y tiene scroll */}
      <div className="flex-1 overflow-y-auto">
        <ChatItems chats={chats} />
      </div>
    </div>
  ) : (
    <div className="flex-1 border-r border-gray-700 flex flex-col bg-gray-900 text-white pt-16 pb-16 ml-16">
      {/* Fijamos el header, search, agent select y tags */}
      <div className="flex flex-col flex-shrink-0">
        <ChatHeader />
        <SearchInput />
        <AgentSelect role={role} agents={agents} selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent} />
        <TagsBar tags={tags} />
      </div>
      {/* ChatItems ocupará el espacio restante y tendrá scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <ChatItems chats={chats} />
      </div>
    </div>
  );
};

export default ChatList;
