/* eslint-disable react/prop-types */
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { TagsCreateForm, UpdateTagForm, TagHandle } from "/src/contexts/chats.js";
import { getTags, deleteTag, getTag } from "/src/services/tags.js";

// Reusable Search Input Component
const SearchInput = ({ searchTerm, onSearchChange }) => (
  <div className="p-2 bg-gray-800">
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder="Buscar etiquetas..."
        className="w-full bg-gray-700 rounded-lg pl-8 pr-2 py-1 text-white placeholder-gray-400"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Search className="absolute left-1 text-gray-400" size={18} />
    </div>
  </div>
);

// Tags Items Component
const TagsItems = ({ tags, onDeleteTag, isDeleting, onFindTag, loadingMore, lastTagRef }) => {
  // Check if tags exist and contain an array before mapping
  if (!tags || !tags.length) {
    return <div className="p-4 text-gray-400">No hay etiquetas disponibles</div>;
  }

  return (
    <div className="bg-gray-800">
      {tags.map((tag, index) => (
        <div
          key={tag.id}
          className="w-full flex items-center p-4"
          ref={index === tags.length - 1 ? lastTagRef : null}
        >
          <div className="w-full flex items-center space-x-3 hover:bg-gray-700 cursor-pointer active:bg-gray-600">
            {/* Tag Details */}
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">{tag.name}</div>
              <div className="text-xs md:text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                {tag.description || "Sin descripción"}
              </div>
            </div>
          </div>
          <div className="flex">
            <button 
              className="mr-2 text-gray-400 hover:text-white"
              onClick={() => onFindTag(tag.id)}
            >
              <Pencil size={16} />
            </button>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => onDeleteTag(tag.id)}
              disabled={isDeleting}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      {loadingMore && (
        <div className="p-4 text-gray-400 text-center">Cargando más etiquetas...</div>
      )}
    </div>
  );
};

const TagsList = () => {
  const { setTagsClick } = useContext(TagsCreateForm);
  const { setTagFind } = useContext(UpdateTagForm);
  const { tagHandle, setTagHandle } = useContext(TagHandle);

  const isMobile = Resize();
  const [tags, setTags] = useState([]);
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
  const lastTagRef = useCallback(node => {
    if (loading || loadingMore) return;

    // Disconnect previous observer
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // If the element is visible and there are more data to load
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreTags();
      }
    }, { threshold: 0.5 }); // Activate when 50% of the element is visible

    if (node) observer.current.observe(node);
  }, [hasMore, loadingMore, loading]);

  // Load initial data
  useEffect(() => {
    fetchTags(1, true);
    setTagHandle(false); // Reset tag handle state when loading the list
  }, [tagHandle]);

  // Effect to handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(setTimeout(() => {
      // If search term is empty, return to normal pagination
      if (!searchTerm) {
        setIsSearchMode(false);
        fetchTags(1, true);
      } else {
        setIsSearchMode(true);
        fetchTagsByName(searchTerm);
      }
    }, 500)); // Reduced to 500ms for better response

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTerm]);

  // Function to get tags by pagination
  const fetchTags = async (page = 1, reset = false) => {
    try {
      // Prevent multiple simultaneous requests
      if ((loading && !reset) || (loadingMore && !reset)) return;

      // If resetting, activate main loading state
      // If loading more, activate loadingMore
      if (reset) {
        setTags([]);
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
      const tagsCall = getTags(params);
      const response = await callEndpoint(tagsCall);

      // Process paginated response
      handleTagsResponse(response, reset, page);

    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Function to search tags by name
  const fetchTagsByName = async (name) => {
    try {
      setTags([]);

      // Build parameters for API call - search by name
      const params = {
        name: name
      };

      // Call getTags() with parameters
      const tagsCall = getTags(params);
      const response = await callEndpoint(tagsCall);

      // Process the response
      handleTagsResponse(response, true, 1);

    } catch (error) {
      handleApiError(error);
    }
  };

  // Helper function to handle tags responses
  const handleTagsResponse = (response, reset, page) => {
    const newTags = response.data || [];
    setTotalItems(response.total || 0);

    if (reset) {
      setTags(newTags);
    } else {
      // Check for duplicates before adding
      const existingIds = tags.map(tag => tag.id);
      const uniqueNewTags = newTags.filter(tag => !existingIds.includes(tag.id));
      setTags(prev => [...prev, ...uniqueNewTags]);
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
      console.error("Error loading tags:", error);
      setError("No se pudieron cargar las etiquetas");
    }
  };

  const loadMoreTags = () => {
    if (!hasMore || loadingMore || loading || isSearchMode) return;

    fetchTags(currentPage + 1, false);
  };

  const handleDeleteTag = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta etiqueta?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const deleteCall = deleteTag(id);
      await callEndpoint(deleteCall);
      if (isSearchMode && searchTerm) {
        fetchTagsByName(searchTerm);
      } else {
        fetchTags(1, true);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error eliminando etiqueta:", error);
        setError("No se pudo eliminar la etiqueta");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to get tag to edit
  const handleFindTag = async (id) => {
    try {
      setIsDeleting(true);
      const tagCall = getTag(id);
      const response = await callEndpoint(tagCall);
      setTagFind(response.data);
      
      // Always set tagsClick to true when editing
      setTagsClick(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error buscando etiqueta:", error);
        setError("No se pudo cargar la información de la etiqueta");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return isMobile ? (
    <div className="w-full sm:w-80 flex flex-col bg-gray-800 text-white h-screen">
      {/* Fixed container for header, search */}
      <div className="flex flex-col flex-shrink-0 mt-14">
        <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
      </div>

      {/* Tags list with scroll */}
      <div className="flex-1 overflow-y-auto">
        {loading && tags.length === 0 ? (
          <div className="p-4 text-gray-400">Cargando etiquetas...</div>
        ) : error ? (
          <div className="p-4 text-red-400">{error}</div>
        ) : (
          <TagsItems
            tags={tags}
            onDeleteTag={handleDeleteTag}
            isDeleting={isDeleting}
            onFindTag={handleFindTag}
            loadingMore={loadingMore}
            lastTagRef={lastTagRef}
          />
        )}
      </div>

      {/* Button to add new tag in mobile */}
      <button
        className="absolute bottom-4 right-4 mb-15 rounded-full p-3 shadow-lg text-white cursor-pointer bg-naranja-base hover:bg-naranja-medio"
        onClick={() => setTagsClick((prev) => !prev)}
      >
        <Plus size={18} />
      </button>
    </div>
  ) : (
    <div className="flex-1 border-r border-gray-700 flex flex-col bg-gray-800 text-white pt-10 ml-10 overflow-y-auto">
      {/* Fixed header and search */}
      <div className="flex flex-col flex-shrink-0">
        <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
      </div>

      {/* Tags list with scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading && tags.length === 0 ? (
          <div className="p-4 text-gray-400">Cargando etiquetas...</div>
        ) : error ? (
          <div className="p-4 text-red-400">{error}</div>
        ) : (
          <TagsItems
            tags={tags}
            onDeleteTag={handleDeleteTag}
            isDeleting={isDeleting}
            onFindTag={handleFindTag}
            loadingMore={loadingMore}
            lastTagRef={lastTagRef}
          />
        )}
      </div>
    </div>
  );
};

export default TagsList;