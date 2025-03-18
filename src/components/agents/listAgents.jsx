/* eslint-disable react/prop-types */
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { NewAgentForm } from "/src/contexts/chats.js";
import { getAgents, deleteAgents } from "/src/services/agents.js";

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

const AgentsItems = ({ agents, onDeleteAgent, isDeleting }) => {
  // Verificar si agents existe y contiene un array antes de mapear
  if (!agents || !agents.length) {
    return <div className="p-4 text-gray-400">No hay agentes disponibles</div>;
  }

  return (
    <div className="bg-gray-900">
      {agents.map((item) => (
        <div key={item.id} className="w-full flex items-center space-x-3 p-4">
          <div className="w-full flex items-center space-x-3 p-4 hover:bg-gray-800 cursor-pointer active:bg-gray-700">
            {/* Chat Details */}
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">{item.name}</div>
              <div className="text-xs md:text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] sm:max-w-[200px]">
                {item.email || "No email"}
              </div>
            </div>
          </div>
          <div className="flex">
            <button className="mr-2 text-gray-400 hover:text-white">
              <Pencil size={16} />
            </button>
            <button 
              className="text-gray-400 hover:text-white" 
              onClick={() => onDeleteAgent(item.id)}
              disabled={isDeleting}
            >
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
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { loading, callEndpoint } = useFetchAndLoad();

  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAgents = async () => {
    try {
      // Llamar a getAgents() para obtener el objeto con call y abortController
      const agentsCall = getAgents();
      // Pasar el objeto completo a callEndpoint
      console.log("Cargando agentes...");
      const response = await callEndpoint(agentsCall);
      setAgents(response);
    } catch (error) {
      // Solo actualizar el estado de error si no es un error de abort
      if (error.name !== 'AbortError') {
        console.error("Error buscando agentes:", error);
        setError("No se pudieron cargar los agentes");
      }
    }
  };

  const handleDeleteAgent = async (id) => {
    setIsDeleting(true);
    try {
      const deleteCall = deleteAgents(id);
      await callEndpoint(deleteCall);
      // Recargar la lista después de eliminar
      fetchAgents();
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error eliminando agente:", error);
        setError("No se pudo eliminar el agente");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return isMobile ? (
    <div className="w-full sm:w-80 flex flex-col bg-gray-900 text-white h-screen">
      {/* Contenedor fijo para header, search, agent select y tags */}
      <div className="flex flex-col flex-shrink-0 mt-14">
        <SearchInput />
      </div>
      {/* ChatItems ocupa el resto del espacio y tiene scroll */}
      <div className="flex-1 overflow-y-auto">
        {loading && !isDeleting ? (
          <div className="p-4 text-gray-400">Cargando agentes...</div>
        ) : error ? (
          <div className="p-4 text-red-400">{error}</div>
        ) : (
          <AgentsItems 
            agents={agents} 
            onDeleteAgent={handleDeleteAgent} 
            isDeleting={isDeleting}
          />
        )}
      </div>
      <button
        className={`absolute bottom-4 right-4 mb-15 rounded-full p-3 shadow-lg text-white cursor-pointer bg-naranja-base hover:bg-naranja-medio ${isMobile ? "" : "hidden"
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
        {loading && !isDeleting ? (
          <div className="p-4 text-gray-400">Cargando agentes...</div>
        ) : error ? (
          <div className="p-4 text-red-400">{error}</div>
        ) : (
          <AgentsItems 
            agents={agents} 
            onDeleteAgent={handleDeleteAgent}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </div>
  );
};

export default ListAgents;