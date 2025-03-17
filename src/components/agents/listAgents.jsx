/* eslint-disable react/prop-types */
import Resize from "/src/hooks/responsiveHook.jsx";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useContext, useEffect, useState, useCallback } from "react";
import { NewAgentForm } from "/src/contexts/chats.js";
import CustomFetch from "/src/services/apiService.js";

// Componentes reutilizables
const SearchInput = () => (
  <div className="p-2 bg-gray-900">
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-gray-800 rounded-lg pl-8 pr-2 py-1 text-white placeholder-gray-400"
      />
      <Search className="absolute left-1 text-gray-400" size={18} />
    </div>
  </div>
);

const AgentsItems = ({ agents }) => {
  // Verificar si agents existe y contiene un array antes de mapear
  if (!agents || !agents.length) {
    return <div className="p-4 text-gray-400">No hay agentes disponibles</div>;
  }

  return (
    <div className="bg-gray-900">
      {agents.map((item) => (
        <div key={item.id} className="w-full flex items-center space-x-3 p-4">
          <div className="w-full flex items-center space-x-3 p-4 hover:bg-gray-800 cursor-pointer active:bg-gray-700">
            {/* Avatar */}
            {/* <img
              src={item.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            /> */}
            {/* Chat Details */}
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">{item.name}</div>
              <div className="text-xs md:text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] sm:max-w-[200px]">
                {item.role}
              </div>
            </div>
          </div>
          <div className="flex">
            <button className="mr-2 text-gray-400 hover:text-white">
              <Pencil size={16} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// FIN Componentes reutilizables
const ListAgents = () => {
  const { setAgentNew } = useContext(NewAgentForm);
  const isMobile = Resize();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usar useEffect para llamar a la API
  useEffect(() => {
    const getAgents = async () => {
      try {
        setLoading(true);

        const response = await CustomFetch("users");
        console.log("Agentes obtenidos:", response);
    
        setAgents(response);
      } catch (error) {
        console.error("Error buscando agentes:", error);
        setError("No se pudieron cargar los agentes");
      } finally {
        setLoading(false);
      }
    };

    getAgents();
  }, []); 

  return isMobile ? (
    <div className="w-full sm:w-80 flex flex-col bg-gray-900 text-white h-screen">
      {/* Contenedor fijo para header, search, agent select y tags */}
      <div className="flex flex-col flex-shrink-0 mt-14">
        <SearchInput />
      </div>
      {/* ChatItems ocupa el resto del espacio y tiene scroll */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-gray-400">Cargando agentes...</div>
        ) : error ? (
          <div className="p-4 text-red-400">{error}</div>
        ) : (
          <AgentsItems agents={agents} />
        )}
      </div>
      <button
        className={`absolute bottom-4 right-4 mb-15 rounded-full p-3 shadow-lg text-white cursor-pointer bg-naranja-base hover:bg-naranja-medio ${
          isMobile ? "" : "hidden"
        }`}
        onClick={() => setAgentNew((prev) => !prev)}
      >
        <Plus size={18} />
      </button>
    </div>
  ) : (
    <div className="flex-1 border-r border-gray-700 flex flex-col bg-gray-900 text-white pt-10 ml-10 overflow-y-auto">
      {/* Fijamos el header, search, agent select y tags */}
      <div className="flex flex-col flex-shrink-0">
        <SearchInput />
      </div>
      {/* ChatItems ocupará el espacio restante y tendrá scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="p-4 text-gray-400">Cargando agentes...</div>
        ) : error ? (
          <div className="p-4 text-red-400">{error}</div>
        ) : (
          <AgentsItems agents={agents} />
        )}
      </div>
    </div>
  );
};

export default ListAgents;