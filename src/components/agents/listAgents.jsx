/* eslint-disable react/prop-types */
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { NewAgentForm, UpdateAgentForm, AgentHandle } from "/src/contexts/chats.js";
import { getAgents, deleteAgents, getAgent } from "/src/services/agents.js";
import { ABILITIES } from '/src/constants/abilities';
import AbilityGuard from '/src/components/common/AbilityGuard.jsx';
import { useTheme } from "/src/contexts/themeContext";

// Componentes reutilizables
const SearchInput = ({ searchTerm, onSearchChange }) => {
  const { theme } = useTheme();
  
  return (
    <AbilityGuard abilities={[ABILITIES.AGENTS.SEARCH]} fallback={
      <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))]`}></div>
    }>
      <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className={`w-full bg-[rgb(var(--color-bg-${theme}))] rounded-lg pl-8 pr-2 py-1 
              text-[rgb(var(--color-text-primary-${theme}))] placeholder-[rgb(var(--color-text-secondary-${theme}))]`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search className={`absolute left-1 text-[rgb(var(--color-text-secondary-${theme}))]`} size={18} />
        </div>
      </div>
    </AbilityGuard>
  );
};

const AgentsItems = ({ agents, onDeleteAgent, isDeleting, onFindAgent, loadingMore, lastAgentRef }) => {
  const { theme } = useTheme();

  if (!agents || !agents.length) {
    return <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>No hay agentes disponibles</div>;
  }

  return (
    <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
      {agents.map((item, index) => (
        <div
          key={item.id}
          className="w-full flex items-center p-4"
          ref={index === agents.length - 1 ? lastAgentRef : null}
        >
          <div className={`w-full flex items-center space-x-3 hover:bg-[rgb(var(--color-bg-${theme}))] 
            cursor-pointer active:bg-[rgb(var(--color-primary-${theme}))]`}>
            <div className="flex-1">
              <div className={`font-medium text-sm md:text-base text-[rgb(var(--color-text-primary-${theme}))]`}>
                {item.name}
              </div>
              <div className={`text-xs md:text-sm text-[rgb(var(--color-text-secondary-${theme}))] 
                overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] sm:max-w-[200px]`}>
                {item.email || "No email"}
              </div>
            </div>
          </div>
          <div className="flex">
            <AbilityGuard abilities={[ABILITIES.AGENTS.EDIT]}>
              <button 
                className={`mr-2 text-[rgb(var(--color-text-secondary-${theme}))] 
                  hover:text-[rgb(var(--color-primary-${theme}))]`}
                onClick={() => onFindAgent(item.id)}
              >
                <Pencil size={16} />
              </button>
            </AbilityGuard>
            <AbilityGuard abilities={[ABILITIES.AGENTS.DELETE]}>
              <button
                className={`text-[rgb(var(--color-text-secondary-${theme}))] 
                  hover:text-[rgb(var(--color-primary-${theme}))]`}
                onClick={() => onDeleteAgent(item.id)}
                disabled={isDeleting}
              >
                <Trash2 size={16} />
              </button>
            </AbilityGuard>
          </div>
        </div>
      ))}
      {loadingMore && (
        <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))] text-center`}>
          Cargando más agentes...
        </div>
      )}
    </div>
  );
};

const ListAgents = () => {
  const { setAgentNew } = useContext(NewAgentForm);
  const { setAgentFind } = useContext(UpdateAgentForm);
  const { agentHandle, setAgentHandle } = useContext(AgentHandle);
  const { theme } = useTheme();

  const isMobile = Resize();
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { loading, callEndpoint } = useFetchAndLoad();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [, setTotalItems] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Referencia al último elemento para implementar intersección
  const observer = useRef();
  const lastAgentRef = useCallback(node => {
    if (loading || loadingMore) return;

    // Desconectar el observador anterior
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // Si el elemento es visible y hay más datos para cargar
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreAgents();
      }
    }, { threshold: 0.5 }); // Activar cuando el 50% del elemento sea visible

    if (node) observer.current.observe(node);
  }, [hasMore, loadingMore, loading]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchAgents(1, true);
    setAgentHandle(false); // Resetear el estado de agente al cargar la lista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentHandle]);

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(setTimeout(() => {
      // Si el término de búsqueda está vacío, volvemos al modo de paginación normal
      if (!searchTerm) {
        setIsSearchMode(false);
        fetchAgents(1, true);
      } else {
        setIsSearchMode(true);
        fetchAgentsByName(searchTerm);
      }
    }, 500)); // Reducido a 500ms para mejor respuesta

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTerm]);

  // Función para obtener agentes por paginación
  const fetchAgents = async (page = 1, reset = false) => {
    try {
      // Evitar múltiples solicitudes simultáneas
      if ((loading && !reset) || (loadingMore && !reset)) return;

      // Si estamos reseteando, activamos el estado de carga principal
      // Si estamos cargando más, activamos loadingMore
      if (reset) {
        setAgents([]);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      // Construir parámetros para la llamada API - solo paginación
      const params = {
        page: page
      };

      // Llamar a getAgents() con los parámetros
      const agentsCall = getAgents(params);
      const response = await callEndpoint(agentsCall);

      // Procesar la respuesta paginada
      handleAgentsResponse(response, reset, page);

    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Función para buscar agentes por nombre
  const fetchAgentsByName = async (name) => {
    try {
      setAgents([]);

      // Construir parámetros para la llamada API - solo búsqueda por nombre
      const params = {
        name: name
      };

      // Llamar a getAgents() con los parámetros
      const agentsCall = getAgents(params);
      const response = await callEndpoint(agentsCall);

      // Procesar la respuesta
      handleAgentsResponse(response, true, 1);

    } catch (error) {
      handleApiError(error);
    }
  };

  // Función auxiliar para manejar las respuestas de agentes
  const handleAgentsResponse = (response, reset, page) => {
    const newAgents = response.data || [];
    setTotalItems(response.total || 0);

    if (reset) {
      setAgents(newAgents);
    } else {
      // Verificar duplicados antes de añadir
      const existingIds = agents.map(agent => agent.id);
      const uniqueNewAgents = newAgents.filter(agent => !existingIds.includes(agent.id));
      setAgents(prev => [...prev, ...uniqueNewAgents]);
    }

    // Actualizar estado de paginación
    setCurrentPage(page);

    // Verificar si hay más páginas disponibles
    setHasMore(response.next_page_url !== null);
  };

  // Función auxiliar para manejar errores de API
  const handleApiError = (error) => {
    // Solo actualizar el estado de error si no es un error de abort
    if (error.name !== 'AbortError') {
      console.error("Error cargando agentes:", error);
      setError("No se pudieron cargar los agentes");
    }
  };

  const loadMoreAgents = () => {
    if (!hasMore || loadingMore || loading || isSearchMode) return;

    fetchAgents(currentPage + 1, false);
  };

  const handleDeleteAgent = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este agente?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const deleteCall = deleteAgents(id);
      await callEndpoint(deleteCall);
      if (isSearchMode && searchTerm) {
        fetchAgentsByName(searchTerm);
      } else {
        fetchAgents(1, true);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error eliminando agente:", error);
        setError("No se pudo eliminar el agente");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  //función para obtener el agente a editar
  const handleFindAgent = async (id) => {
    try {
      setIsDeleting(true);
      const agentCall = getAgent(id);
      const response = await callEndpoint(agentCall);
      setAgentFind(response.data);

      // Always set agentNew to true when editing, regardless of device type
      setAgentNew(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error buscando agente:", error);
        setError("No se pudo cargar la información del agente");
      }
    } finally {
      setIsDeleting(false);
    }
  };
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <AbilityGuard abilities={[ABILITIES.AGENTS.VIEW]} fallback={
      <div className={`w-full flex items-center justify-center h-full text-[rgb(var(--color-text-secondary-${theme}))]`}>
        No tienes permisos para ver la lista de agentes
      </div>
    }>
      {isMobile ? (

        <div className={`w-full sm:w-80 flex flex-col bg-[rgb(var(--color-bg-${theme}-secondary))] 
          text-[rgb(var(--color-text-primary-${theme}))]`}>
          <div className="flex flex-col flex-shrink-0 mt-14">
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && agents.length === 0 ? (
              <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>Cargando agentes...</div>
            ) : error ? (
              <div className="p-4 text-red-400">{error}</div>
            ) : (
              <AgentsItems
                agents={agents}
                onDeleteAgent={handleDeleteAgent}
                isDeleting={isDeleting}
                onFindAgent={handleFindAgent}
                loadingMore={loadingMore}
                lastAgentRef={lastAgentRef}
              />
            )}
          </div>

          <AbilityGuard abilities={[ABILITIES.AGENTS.CREATE]}>
            <button
              className={`absolute bottom-4 right-4 mb-15 rounded-full p-3 shadow-lg 
                text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer 
                bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))]`}
              onClick={() => setAgentNew((prev) => !prev)}
            >
              <Plus size={18} />
            </button>
          </AbilityGuard>
        </div>
      ) : (
        <div className={`flex-1 border-r border-[rgb(var(--color-text-secondary-${theme}))] flex flex-col 
          bg-[rgb(var(--color-bg-${theme}-secondary))] text-[rgb(var(--color-text-primary-${theme}))] 
          pt-10 ml-10 overflow-y-auto`}>
          <div className="flex flex-col flex-shrink-0">
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading && agents.length === 0 ? (
              <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>Cargando agentes...</div>
            ) : error ? (
              <div className="p-4 text-red-400">{error}</div>
            ) : (
              <AgentsItems
                agents={agents}
                onDeleteAgent={handleDeleteAgent}
                isDeleting={isDeleting}
                onFindAgent={handleFindAgent}
                loadingMore={loadingMore}
                lastAgentRef={lastAgentRef}
              />
            )}
          </div>

          <AbilityGuard abilities={[ABILITIES.AGENTS.CREATE]}>
            <button
              className={`fixed bottom-4 right-4 mb-4 rounded-full p-3 shadow-lg 
                text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer 
                bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))]`}
              onClick={() => setAgentNew((prev) => !prev)}
            >
              <Plus size={18} />
            </button>
          </AbilityGuard>
        </div>
      )}
    </AbilityGuard>
  );
};

export default ListAgents;
