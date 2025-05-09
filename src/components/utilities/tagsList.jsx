/* eslint-disable react/prop-types */
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import Resize from "@/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { TagsCreateForm, UpdateTagForm, TagHandle } from "@/contexts/chats.js";
import { getTags, deleteTag, getTag } from "@/services/tags.js";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { useTheme } from "@/contexts/themeContext";
import toast from "react-hot-toast";

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

// Tags Items Component
const TagsItems = ({ tags, onDeleteTag, isDeleting, onFindTag, loadingMore, lastTagRef }) => {
  const { theme } = useTheme();

  if (!tags || !tags.length) {
    return (
      <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>
        No hay etiquetas disponibles
      </div>
    );
  }

  return (
    <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
      {tags.map((tag, index) => (
        <div
          key={tag.id}
          className="w-full flex items-center p-4"
          ref={index === tags.length - 1 ? lastTagRef : null}
        >
          <div className={`w-full flex items-center space-x-3 hover:bg-[rgb(var(--color-bg-${theme}))] 
            cursor-pointer active:bg-[rgb(var(--color-primary-${theme}))]`}>
            <div className="flex-1">
              <div className="flex items-center space-x-2 font-medium text-sm md:text-base">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className={`text-[rgb(var(--color-text-primary-${theme}))]`}>
                  {tag.name}
                </span>
              </div>
              <div className={`text-xs md:text-sm text-[rgb(var(--color-text-secondary-${theme}))] 
                overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]`}>
                {tag.description || "Sin descripción"}
              </div>
            </div>
          </div>
          <div className="flex">
            <AbilityGuard abilities={[ABILITIES.UTILITIES.EDIT]}>
              <button
                className={`mr-2 text-[rgb(var(--color-text-secondary-${theme}))] 
                  hover:text-[rgb(var(--color-primary-${theme}))]`}
                onClick={() => onFindTag(tag.id)}
              >
                <Pencil size={16} />
              </button>
            </AbilityGuard>
            <AbilityGuard abilities={[ABILITIES.UTILITIES.DELETE]}>
              <button
                className={`text-[rgb(var(--color-text-secondary-${theme}))] 
                  hover:text-[rgb(var(--color-primary-${theme}))]`}
                onClick={() => onDeleteTag(tag.id)}
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
          Cargando más etiquetas...
        </div>
      )}
    </div>
  );
};

const TagsList = () => {
  const { theme } = useTheme();
  const { setTagsClick } = useContext(TagsCreateForm);
  const { setTagFind } = useContext(UpdateTagForm);
  const { tagHandle, setTagHandle } = useContext(TagHandle);

  const isMobile = Resize();
  const [tags, setTags] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { loading, callEndpoint } = useFetchAndLoad();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [, setTotalItems] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [error, setError] = useState(null);

  const observer = useRef();
  const lastTagRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingMore) {
            loadMoreTags();
          }
        },
        { threshold: 0.5 }
      );

      if (node) observer.current.observe(node);
    },
    [hasMore, loadingMore, loading]
  );

  useEffect(() => {
    fetchTags(1, true);
    setTagHandle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagHandle]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(
      setTimeout(() => {
        if (!searchTerm) {
          setIsSearchMode(false);
          fetchTags(1, true);
        } else {
          setIsSearchMode(true);
          fetchTagsByName(searchTerm);
        }
      }, 500)
    );

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTerm]);

  const fetchTags = async (page = 1, reset = false) => {
    try {
      if ((loading && !reset) || (loadingMore && !reset)) return;

      if (reset) {
        setTags([]);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const params = { page };
      const tagsCall = getTags(params);
      const response = await callEndpoint(tagsCall);

      handleTagsResponse(response, reset, page);
    } catch (error) {
      handleApiError(error, "No se pudieron cargar las etiquetas");
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchTagsByName = async (name) => {
    try {
      setTags([]);
      const params = { name };
      const tagsCall = getTags(params);
      const response = await callEndpoint(tagsCall);
      handleTagsResponse(response, true, 1);
    } catch (error) {
      handleApiError(error, "No se pudieron cargar las etiquetas por nombre");
    }
  };

  const handleTagsResponse = (response, reset, page) => {
    const newTags = response.data || [];
    setTotalItems(response.total || 0);

    if (reset) {
      setTags(newTags);
    } else {
      const existingIds = tags.map((tag) => tag.id);
      const uniqueNewTags = newTags.filter((tag) => !existingIds.includes(tag.id));
      setTags((prev) => [...prev, ...uniqueNewTags]);
    }

    setCurrentPage(page);
    setHasMore(response.next_page_url !== null);
  };

  const handleApiError = (error, userMessage = "Ocurrió un error") => {
    if (error.name !== "AbortError") {
      console.error("API Error:", error);
      setError("No se pudieron cargar las etiquetas");
      toast.error(userMessage);
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
      toast.success("Etiqueta eliminada correctamente");

      if (isSearchMode && searchTerm) {
        fetchTagsByName(searchTerm);
      } else {
        fetchTags(1, true);
      }
    } catch (error) {
      handleApiError(error, "No se pudo eliminar la etiqueta");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFindTag = async (id) => {
    try {
      setIsDeleting(true);
      const tagCall = getTag(id);
      const response = await callEndpoint(tagCall);
      setTagFind(response.data);
      setTagsClick(true);
    } catch (error) {
      handleApiError(error, "No se pudo cargar la información de la etiqueta");
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
        No tienes permisos para ver la lista de etiquetas
      </div>
    }>
      {isMobile ? (
        <div className={`w-full sm:w-80 mt-10 flex flex-col bg-[rgb(var(--color-bg-${theme}-secondary))] 
          text-[rgb(var(--color-text-primary-${theme}))]`}>
          <div className="flex flex-row flex-shrink-0">
            <label className="p-1">Etiquetas</label>
          </div>
          <div className="flex flex-col flex-shrink-0">
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && tags.length === 0 ? (
              <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>
                Cargando etiquetas...
              </div>
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

          <AbilityGuard abilities={[ABILITIES.UTILITIES.CREATE]}>
            <button
              className={`absolute bottom-4 right-4 mb-15 rounded-full p-3 shadow-lg 
                text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer 
                bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))]`}
              onClick={() => setTagsClick((prev) => !prev)}
            >
              <Plus size={18} />
            </button>
          </AbilityGuard>
        </div>
      ) : (
        <div className={`flex-1 border-r border-[rgb(var(--color-text-secondary-${theme}))] flex flex-col 
          bg-[rgb(var(--color-bg-${theme}-secondary))] text-[rgb(var(--color-text-primary-${theme}))] 
          pt-2 ml-10 overflow-y-auto`}>
          <div className="flex flex-row flex-shrink-0">
            <label className="p-1">Etiquetas</label>
          </div>
          <div className="flex flex-col flex-shrink-0">
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading && tags.length === 0 ? (
              <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>
                Cargando etiquetas...
              </div>
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

          <AbilityGuard abilities={[ABILITIES.UTILITIES.CREATE]}>
            <button
              className={`fixed bottom-4 right-4 mb-4 rounded-full p-3 shadow-lg 
                text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer 
                bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))]`}
              onClick={() => setTagsClick((prev) => !prev)}
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