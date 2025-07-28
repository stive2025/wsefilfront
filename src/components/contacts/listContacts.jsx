/* eslint-disable react/prop-types */
import Resize from "@/hooks/responsiveHook.jsx";
import { Search, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useContext, useRef, useCallback, useEffect, useState } from "react";
import { NewContactForm, ChatInterfaceClick, NewMessage, UpdateContactForm, ContactHandle } from "@/contexts/chats.js";
import { useNavigate, useLocation } from "react-router-dom";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { useTheme } from "@/contexts/themeContext";
import useContactsSearch from "@/hooks/useContactsSearch.js";

// Componentes reutilizables
const SearchInput = ({ searchTerm, onSearchChange }) => {
  const { theme } = useTheme();
const handleClear = () => {
  onSearchChange('');
};

  return (
    <AbilityGuard abilities={[ABILITIES.CONTACTS.SEARCH]} fallback={
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
         {searchTerm && (
            <button
              onClick={handleClear}
              className={`absolute right-2 p-1 rounded-full
                text-[rgb(var(--color-text-secondary-${theme}))]
                hover:bg-[rgb(var(--input-hover-bg-${theme}))]
                hover:text-[rgb(var(--color-primary-${theme}))]
                transition-colors duration-200`}
              title="Limpiar búsqueda"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
          )}
        </div>
      </div>
    </AbilityGuard>
  );
};

const ContactItems = ({ contacts, onDeleteContact, isDeleting, onFindContact, loadingMore, lastContactRef, setSelectedChatId, setNewMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  if (!contacts || !contacts.length) {
    return <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>No hay contactos disponibles</div>;
  }

  return (
    <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
      {contacts.map((item, index) => (
        <div
          key={item.id}
          className="w-full flex items-center p-4"
          ref={index === contacts.length - 1 ? lastContactRef : null}
        >
          <div
            className={`w-full flex items-center space-x-3 hover:bg-[rgb(var(--color-bg-${theme}))] 
            cursor-pointer active:bg-[rgb(var(--color-primary-${theme}))]`}
            onClick={() => {
              if (location.pathname === "/contacts") {
                navigate("/chatList");
              }
              if (item.chat) {
                setSelectedChatId({
                  id: item.chat.id,
                  idContact: item.id,
                  name: item.name,
                  photo: item.profile_picture || "avatar.jpg",
                  number: item.phone_number
                });
              } else {
                setSelectedChatId({
                  idContact: item.id,
                  name: item.name,
                  photo: item.profile_picture || "avatar.jpg",
                  number: item.phone_number
                });
              }

              setNewMessage(false);
            }}
          >
            {/* Aquí puedes poner un avatar si tu API devuelve uno, si no, usar una imagen por defecto */}
            <div className={`w-10 h-10 rounded-full bg-[rgb(var(--color-bg-${theme}))] 
            flex items-center justify-center text-[rgb(var(--color-text-primary-${theme}))]`}>
              {item.name ? item.name.charAt(0).toUpperCase() : '?'}
            </div>

            <div className="flex-1">
              <div className={`font-medium text-sm md:text-base text-[rgb(var(--color-text-primary-${theme}))]`}>
                {item.name || 'Sin nombre'}
              </div>
              <div className={`text-xs md:text-sm text-[rgb(var(--color-text-secondary-${theme}))] 
              overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] sm:max-w-[200px]`}>
                {item.phone_number || 'Sin número'}
              </div>
            </div>
          </div>
          {location.pathname === "/contacts" && (
            <div className="flex">
              <AbilityGuard abilities={[ABILITIES.CONTACTS.EDIT]}>
                <button
                  className={`mr-2 p-2 rounded-md transition-colors duration-200 
    bg-[rgb(var(--color-primary-${theme}))] 
    hover:bg-[rgb(var(--color-secondary-${theme}))] 
    text-white shadow-sm cursor-pointer`}
                  onClick={() => onFindContact(item.id)}
                >
                  <Pencil size={16} />
                </button>
              </AbilityGuard>

              <AbilityGuard abilities={[ABILITIES.CONTACTS.DELETE]}>
                <button
                  className={`p-2 rounded-md transition-colors duration-200 
    bg-[rgb(var(--color-secondary-${theme}))] 
    hover:bg-[rgb(var(--color-primary-${theme}))] 
    text-white shadow-sm cursor-pointer`}
                  onClick={() => onDeleteContact(item.id)}
                  disabled={isDeleting}
                >
                  <Trash2 size={16} />
                </button>
              </AbilityGuard>
            </div>
          )}
        </div>
      ))}
      {loadingMore && (
        <div className={`p-4 text-[rgb(var(--color-text-secondary-${theme}))] text-center`}>
          Cargando más contactos...
        </div>
      )}
    </div>
  );
};

const ListContacts = () => {
  const { setNewMessage } = useContext(NewMessage);
  const { setContactNew } = useContext(NewContactForm);
  const { setContactFind } = useContext(UpdateContactForm);
  const { contactHandle, setContactHandle } = useContext(ContactHandle);
  const { setSelectedChatId } = useContext(ChatInterfaceClick);
  const { theme } = useTheme();

  const isMobile = Resize();
  const location = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);

  // Usar el hook optimizado para búsqueda de contactos
  const {
    contacts,
    loading,
    error,
    searchTerm,
    hasMore,
    isSearchMode,
    handleSearchChange,
    loadMore,
    clearError,
    deleteContact: deleteContactAPI,
    getContactById,
    refresh
  } = useContactsSearch({
    pageSize: 20,
    debounceDelay: 300,
    autoSearch: true
  });

  // Referencia al último elemento para implementar intersección
  const observer = useRef();
  const lastContactRef = useCallback(node => {
    if (loading) return;

    // Desconectar el observador anterior
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // Si el elemento es visible y hay más datos para cargar
      if (entries[0].isIntersecting && hasMore && !isSearchMode) {
        loadMore();
      }
    }, { threshold: 0.5 }); // Activar cuando el 50% del elemento sea visible

    if (node) observer.current.observe(node);
  }, [hasMore, loading, isSearchMode, loadMore]);

  // Efecto para refrescar cuando cambia contactHandle
  useEffect(() => {
    if (contactHandle) {
      refresh();
      setContactHandle(false);
    }
  }, [contactHandle, refresh, setContactHandle]);

  // Todas las funciones de búsqueda y paginación ahora están manejadas por el hook useContactsSearch

  // Función optimizada para eliminar contacto
  const handleDeleteContact = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este contacto?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteContactAPI(id);
      // El hook se encarga de refrescar la lista automáticamente
    } catch (error) {
      console.error("Error eliminando contacto:", error);
      // El hook maneja el error automáticamente
    } finally {
      setIsDeleting(false);
    }
  };

  // Función optimizada para obtener el contacto a editar
  const handleFindContact = async (id) => {
    try {
      setIsDeleting(true);
      const contact = await getContactById(id);
      setContactFind(contact);
      setContactNew(true);
    } catch (error) {
      console.error("Error buscando contacto:", error);
      // El hook maneja el error automáticamente
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AbilityGuard abilities={[ABILITIES.CONTACTS.VIEW]} fallback={
      <div className={`w-full flex items-center justify-center h-full 
      text-[rgb(var(--color-text-secondary-${theme}))]`}>
        No tienes permisos para ver la lista de contactos
      </div>
    }>
      {isMobile ? (
        <div className={`w-full sm:w-80 flex flex-col bg-[rgb(var(--color-bg-${theme}-secondary))] 
        text-[rgb(var(--color-text-primary-${theme}))]`}>
          <div className="flex flex-col flex-shrink-0 mt-14">
            {location.pathname === "/chatList" && (
              <div className="flex items-center p-2">
                <button
                  className={`text-[rgb(var(--color-text-primary-${theme}))] rounded-full cursor-pointer 
                  hover:bg-[rgb(var(--color-bg-${theme}))] active:bg-[rgb(var(--color-primary-${theme}))] p-1`}
                  onClick={() => setNewMessage(null)}
                >
                  <ArrowLeft size={15} />
                </button>
                <label className="ml-2">CONTACTOS</label>
              </div>
            )}
            {location.pathname === "/contacts" && (
              <div className="p-2">
                <label>CONTACTOS</label>
              </div>
            )}
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearchChange} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && contacts.length === 0 ? (
              <div className="p-4 text-gray-400">Cargando contactos...</div>
            ) : error ? (
              <div className="p-4 text-red-400">{error}</div>
            ) : (
              <ContactItems
                contacts={contacts}
                onDeleteContact={handleDeleteContact}
                isDeleting={isDeleting}
                onFindContact={handleFindContact}
                loadingMore={loadingMore}
                lastContactRef={lastContactRef}
                setSelectedChatId={setSelectedChatId}
                setNewMessage={setNewMessage}
              />
            )}
          </div>

          {location.pathname === "/contacts" && (
            <AbilityGuard abilities={[ABILITIES.CONTACTS.CREATE]}>
              <button
                className={`absolute bottom-4 right-4 mb-15 rounded-full p-3 shadow-lg 
                text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer 
                bg-[rgb(var(--color-secondary-${theme}))] 
                hover:bg-[rgb(var(--color-primary-${theme}))]`}
                onClick={() => setContactNew((prev) => !prev)}
              >
                <Plus size={18} />
              </button>
            </AbilityGuard>
          )}
        </div>
      ) : (
        <div className={`flex-1 border-r border-[rgb(var(--color-text-secondary-${theme}))] flex flex-col 
        bg-[rgb(var(--color-bg-${theme}-secondary))] text-[rgb(var(--color-text-primary-${theme}))] 
        pt-2   ml-10 overflow-y-auto`}>
          <div className="flex flex-col flex-shrink-0">
            {location.pathname === "/chatList" && (
              <div className="flex items-center p-2">
                <button
                  className={`text-[rgb(var(--color-text-primary-${theme}))] rounded-full cursor-pointer 
                  hover:bg-[rgb(var(--color-bg-${theme}))] active:bg-[rgb(var(--color-primary-${theme}))] p-1`}
                  onClick={() => setNewMessage(null)}
                >
                  <ArrowLeft size={15} />
                </button>
                <label className="ml-2">CONTACTOS</label>
              </div>
            )}
            {location.pathname === "/contacts" && (
              <div className="p-2">
                <label>CONTACTOS</label>
              </div>
            )}
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearchChange} />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading && contacts.length === 0 ? (
              <div className="p-4 text-gray-400">Cargando contactos...</div>
            ) : error ? (
              <div className="p-4 text-red-400">{error}</div>
            ) : (
              <ContactItems
                contacts={contacts}
                onDeleteContact={handleDeleteContact}
                isDeleting={isDeleting}
                onFindContact={handleFindContact}
                loadingMore={loadingMore}
                lastContactRef={lastContactRef}
                setSelectedChatId={setSelectedChatId}
                setNewMessage={setNewMessage}
              />
            )}
          </div>

          {location.pathname === "/contacts" && (
            <AbilityGuard abilities={[ABILITIES.CONTACTS.CREATE]}>
              <button
                className={`fixed bottom-4 right-4 mb-4 rounded-full p-3 shadow-lg 
                text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer 
                bg-[rgb(var(--color-secondary-${theme}))] 
                hover:bg-[rgb(var(--color-primary-${theme}))]`}
                onClick={() => setContactNew((prev) => !prev)}
              >
                <Plus size={18} />
              </button>
            </AbilityGuard>
          )}
        </div>
      )}
    </AbilityGuard>
  );
};

export default ListContacts;