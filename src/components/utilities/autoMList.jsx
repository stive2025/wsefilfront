/* eslint-disable react/prop-types */
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import Resize from "@/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { AutoCreateForm, UpdateAutoForm, AutoHandle } from "@/contexts/chats.js";
import { getAutoMessages, deleteAutoMessage, getAutoMessage } from "@/services/AutoMessages.js";
import { ABILITIES } from '@/constants/abilities.js';
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { useTheme } from "@/contexts/themeContext";

// Reusable Search Input Component
const SearchInput = ({ searchTerm, onSearchChange }) => {
  const { theme } = useTheme();
  
  return (
    <AbilityGuard abilities={[ABILITIES.UTILITIES.SEARCH]} fallback={
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

// Auto Items Component
const AutoItems = ({ AutoMessages, onDeleteAuto, isDeleting, onFindAuto, loadingMore, lastAutoRef }) => {
  const { theme } = useTheme();

  if (!AutoMessages || !AutoMessages.length) {
    return (
      <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>
        No hay Mensajes Automáticos disponibles
      </div>
    );
  }

  return (
    <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
      {AutoMessages.map((Auto, index) => (
        <div
          key={Auto.id}
          className="w-full flex items-center p-4"
          ref={index === AutoMessages.length - 1 ? lastAutoRef : null}
        >
          <div className={`w-full flex items-center space-x-3 hover:bg-[rgb(var(--color-bg-${theme}))] 
            cursor-pointer active:bg-[rgb(var(--color-primary-${theme}))]`}>
            <div className="flex-1">
              <div className={`font-medium text-sm md:text-base text-[rgb(var(--color-text-primary-${theme}))]`}>
                {Auto.name}
              </div>
              <div className={`text-xs md:text-sm text-[rgb(var(--color-text-secondary-${theme}))] 
                overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]`}>
                {Auto.description || "Sin descripción"}
              </div>
            </div>
          </div>
          <div className="flex">
            <AbilityGuard abilities={[ABILITIES.UTILITIES.EDIT]}>
              <button
                className={`mr-2 text-[rgb(var(--color-text-secondary-${theme}))] 
                  hover:text-[rgb(var(--color-primary-${theme}))]`}
                onClick={() => onFindAuto(Auto.id)}
              >
                <Pencil size={16} />
              </button>
            </AbilityGuard>
            <AbilityGuard abilities={[ABILITIES.UTILITIES.DELETE]}>
              <button
                className={`text-[rgb(var(--color-text-secondary-${theme}))] 
                  hover:text-[rgb(var(--color-primary-${theme}))]`}
                onClick={() => onDeleteAuto(Auto.id)}
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
          Cargando más mensajes...
        </div>
      )}
    </div>
  );
};

const TagsList = () => {
  const { theme } = useTheme();
  const { setAutoClick } = useContext(AutoCreateForm);
  const { setAutoFind } = useContext(UpdateAutoForm);
  const { autoHandle, setAutoHandle } = useContext(AutoHandle);

  const isMobile = Resize();
  const [messages, setMessages] = useState([]);
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

  // Reference to the last element for intersection
  const observer = useRef();
  const lastAutoRef = useCallback(node => {
    if (loading || loadingMore) return;

    // Disconnect previous observer
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // If the element is visible and there are more data to load
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreAuto();
      }
    }, { threshold: 0.5 }); // Activate when 50% of the element is visible

    if (node) observer.current.observe(node);
  }, [hasMore, loadingMore, loading]);

  // Load initial data
  useEffect(() => {
    fetchAuto(1, true);
    setAutoHandle(false); // Reset tag handle state when loading the list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoHandle]);

  // Effect to handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(setTimeout(() => {
      // If search term is empty, return to normal pagination
      if (!searchTerm) {
        setIsSearchMode(false);
        fetchAuto(1, true);
      } else {
        setIsSearchMode(true);
        fetchAutoByName(searchTerm);
      }
    }, 500)); // Reduced to 500ms for better response

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Function to get tags by pagination
  const fetchAuto = async (page = 1, reset = false) => {
    try {
      // Prevent multiple simultaneous requests
      if ((loading && !reset) || (loadingMore && !reset)) return;

      // If resetting, activate main loading state
      // If loading more, activate loadingMore
      if (reset) {
        setMessages([]);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      // Build parameters for API call - only pagination
      const params = {
        page: page
      };

      // Call getTags() with parameters
      const AutoCall = getAutoMessages(params);
      const response = await callEndpoint(AutoCall);

      // Process paginated response
      handleTagsResponse(response, reset, page);

    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Function to search tags by name
  const fetchAutoByName = async (name) => {
    try {
      setMessages([]);

      // Build parameters for API call - search by name
      const params = {
        name: name
      };

      // Call getTags() with parameters
      const AutoCall = getAutoMessages(params);
      const response = await callEndpoint(AutoCall);

      // Process the response
      handleTagsResponse(response, true, 1);

    } catch (error) {
      handleApiError(error);
    }
  };

  // Helper function to handle tags responses
  const handleTagsResponse = (response, reset, page) => {
    const newMessages = response.data || [];
    setTotalItems(response.total || 0);

    if (reset) {
      setMessages(newMessages);
    } else {
      // Check for duplicates before adding
      const existingIds = messages.map(Auto => Auto.id);
      const uniqueNewAuto = newMessages.filter(Auto => !existingIds.includes(Auto.id));
      setMessages(prev => [...prev, ...uniqueNewAuto]);
    }

    // Update pagination state
    setCurrentPage(page);

    // Check if more pages are available
    setHasMore(response.next_page_url !== null);
  };

  // Helper function to handle API errors
  const handleApiError = (error) => {
    // Only update error state if not an abort error
    if (error.name !== 'AbortError') {
      console.error("Error loading messages:", error);
      setError("No se pudieron cargar los mensajes");
    }
  };

  const loadMoreAuto = () => {
    if (!hasMore || loadingMore || loading || isSearchMode) return;

    fetchAuto(currentPage + 1, false);
  };

  const handleDeleteAuto = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este mensaje?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const deleteCall = deleteAutoMessage(id);
      await callEndpoint(deleteCall);
      if (isSearchMode && searchTerm) {
        fetchAutoByName(searchTerm);
      } else {
        fetchAuto(1, true);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error eliminando mensaje:", error);
        setError("No se pudo eliminar el mensaje");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to get tag to edit
  const handleFindAuto = async (id) => {
    try {
      setIsDeleting(true);
      const AutoCall = getAutoMessage(id);
      const response = await callEndpoint(AutoCall);
      setAutoFind(response.data);

      setAutoClick(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error buscando mensaje:", error);
        setError("No se pudo cargar la información del mensaje");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <AbilityGuard abilities={[ABILITIES.UTILITIES.VIEW]} fallback={
      <div className={`w-full flex items-center justify-center h-full text-[rgb(var(--color-text-secondary-${theme}))]`}>
        No tienes permisos para ver la lista de mensajes automáticos
      </div>
    }>
      {isMobile ? (
        <div className={`w-full sm:w-80 mt-10 flex flex-col bg-[rgb(var(--color-bg-${theme}-secondary))] 
          text-[rgb(var(--color-text-primary-${theme}))]`}>
          <div className="flex flex-row flex-shrink-0">
            <label className="p-1">Mensajes Automáticos</label>
          </div>
          <div className="flex flex-col flex-shrink-0">
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && messages.length === 0 ? (
              <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>
                Cargando Mensajes Automáticos...
              </div>
            ) : error ? (
              <div className="p-4 text-red-400">{error}</div>
            ) : (
              <AutoItems
                AutoMessages={messages}
                onDeleteAuto={handleDeleteAuto}
                isDeleting={isDeleting}
                onFindAuto={handleFindAuto}
                loadingMore={loadingMore}
                lastAutoRef={lastAutoRef}
              />
            )}
          </div>

          <AbilityGuard abilities={[ABILITIES.UTILITIES.CREATE]}>
            <button
              className={`absolute bottom-4 right-4 mb-15 rounded-full p-3 shadow-lg 
                text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer 
                bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))]`}
              onClick={() => setAutoClick((prev) => !prev)}
            >
              <Plus size={18} />
            </button>
          </AbilityGuard>
        </div>
      ) : (
        <div className={`flex-1 border-r border-[rgb(var(--color-text-secondary-${theme}))] flex flex-col 
          bg-[rgb(var(--color-bg-${theme}-secondary))] text-[rgb(var(--color-text-primary-${theme}))] 
          pt-2 ml-10 overflow-y-auto`}>
          {/* Fixed header and search */}
          <div className="flex flex-row flex-shrink-0">
            <label className="p-1">Mensajes Automáticos</label>
          </div>
          <div className="flex flex-col flex-shrink-0">
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
          </div>

          {/* Messages list with scroll */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading && messages.length === 0 ? (
              <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>
                Cargando Mensajes Automáticos...
              </div>
            ) : error ? (
              <div className="p-4 text-red-400">{error}</div>
            ) : (
              <AutoItems
                AutoMessages={messages}
                onDeleteAuto={handleDeleteAuto}
                isDeleting={isDeleting}
                onFindAuto={handleFindAuto}
                loadingMore={loadingMore}
                lastAutoRef={lastAutoRef}
              />
            )}
          </div>

          {/* Button to add new auto message in desktop */}
          <AbilityGuard abilities={[ABILITIES.UTILITIES.CREATE]}>
            <button
              className="fixed bottom-4 right-4 mb-4 rounded-full p-3 shadow-lg text-white cursor-pointer bg-naranja-base hover:bg-naranja-medio"
              onClick={() => setAutoClick((prev) => !prev)}
            >
              <Plus size={18} />
            </button>
          </AbilityGuard>
        </div>
      )}
    </AbilityGuard>
  );
};

export default TagsList;