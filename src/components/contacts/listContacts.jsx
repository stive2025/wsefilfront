/* eslint-disable react/prop-types */
import Resize from "@/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { Search, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { NewContactForm, ChatInterfaceClick, NewMessage, UpdateContactForm, ContactHandle } from "@/contexts/chats.js";
import { useNavigate, useLocation } from "react-router-dom";
import { getContacts, deleteContact, getContact } from "@/services/contacts.js";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { useTheme } from "@/contexts/themeContext";

// Componentes reutilizables
const SearchInput = ({ searchTerm, onSearchChange }) => {
  const { theme } = useTheme();

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
  }else{
    console.log("Contacts:", contacts);
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
              console.log("Contacto seleccionado:", item);
              if (item.chat) {
                setSelectedChatId({
                  id: item.chat.id,
                  idContact: item.id,
                  name: item.name,
                  photo: item.profile_picture || "https://th.bing.com/th/id/OIP.hmLglIuAaL31MXNFuTGBgAHaHa?rs=1&pid=ImgDetMain",
                  number: item.phone_number
                });
              } else {
                setSelectedChatId({
                  idContact: item.id,
                  name: item.name,
                  photo: item.profile_picture || "https://th.bing.com/th/id/OIP.hmLglIuAaL31MXNFuTGBgAHaHa?rs=1&pid=ImgDetMain",
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
                  className={`mr-2 text-[rgb(var(--color-text-secondary-${theme}))] 
                  hover:text-[rgb(var(--color-primary-${theme}))]`}
                  onClick={() => onFindContact(item.id)}
                >
                  <Pencil size={16} />
                </button>
              </AbilityGuard>
              <AbilityGuard abilities={[ABILITIES.CONTACTS.DELETE]}>
                <button
                  className={`text-[rgb(var(--color-text-secondary-${theme}))] 
                  hover:text-[rgb(var(--color-primary-${theme}))]`}
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
  const { loading, callEndpoint } = useFetchAndLoad();

  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [, setTotalItems] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Referencia al último elemento para implementar intersección
  const observer = useRef();
  const lastContactRef = useCallback(node => {
    if (loading || loadingMore) return;

    // Desconectar el observador anterior
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // Si el elemento es visible y hay más datos para cargar
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreContacts();
      }
    }, { threshold: 0.5 }); // Activar cuando el 50% del elemento sea visible

    if (node) observer.current.observe(node);
  }, [hasMore, loadingMore, loading]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchContacts(1, true);
    setContactHandle(false); // Resetear el estado de contacto al cargar la lista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactHandle]);

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(setTimeout(() => {
      const isPhone = /^\+?\d+$/.test(searchTerm);
      const formattedPhone = isPhone
        ? searchTerm.replace(/^0+/, '')
        : undefined;

      if (!searchTerm) {
        setIsSearchMode(false);
        fetchContacts(1, true);
      } else if (isPhone) {
        setIsSearchMode(true);
        fetchContactsByPhone(formattedPhone);
      } else {
        setIsSearchMode(true);
        fetchContactsByName(searchTerm);
      }
    }, 500)); // Reducido a 500ms para mejor respuesta

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTerm]);

  // Función para obtener contactos por paginación
  const fetchContacts = async (page = 1, reset = false) => {
    try {
      if ((loading && !reset) || (loadingMore && !reset)) return;

      if (reset) {
        setContacts([]);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      // Construir parámetros para la llamada API - solo paginación
      const params = {
        page: page
      };

      // Llamar a getContacts() con los parámetros
      const contactsCall = getContacts(params);
      const response = await callEndpoint(contactsCall);

      // Procesar la respuesta paginada
      handleContactsResponse(response, reset, page);

    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Función para buscar contactos por nombre
  const fetchContactsByName = async (name) => {
    try {
      setContacts([]); // Limpiar contactos existentes
      setError(null); // Limpiar error anterior
      
      const params = {
        name: name
      };

      const contactsCall = getContacts(params);
      const response = await callEndpoint(contactsCall);

      if (response && response.data) {
        handleContactsResponse(response, true, 1);
      } else {
        setContacts([]);
        setError("No se encontraron contactos");
      }

    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchContactsByPhone = async (phone) => {
    try {
      setContacts([]); // Limpiar contactos existentes
      setError(null); // Limpiar error anterior

      const params = {
        phone: phone
      };
      
      const contactsCall = getContacts(params);
      const response = await callEndpoint(contactsCall);
      console.log("Response from fetchContactsByPhone:", response);

      if (response && response.data) {
        handleContactsResponse(response, true, 1);
      } else {
        setContacts([]);
        setError("No se encontraron contactos");
      }

    } catch (error) {
      handleApiError(error);
    }
  };

  // Función auxiliar para manejar las respuestas de contactos
  const handleContactsResponse = (response, reset, page) => {
    try {
      console.log("Response from API:", response);
      
      if (!response || !response.data) {
        throw new Error("Respuesta inválida de la API");
      }

      const newContacts = response.data;
      console.log("New Contacts:", newContacts);
      
      setError(null); // Limpiar cualquier error previo
      setTotalItems(response.total || 0);
      console.log("Total Items:", response.total);

      if (reset) {
        console.log("Resetting contacts");
        setContacts(newContacts);
      } else {
        console.log("Appending new contacts");
        const existingIds = contacts.map(contact => contact.id);
        const uniqueNewContacts = newContacts.filter(contact => !existingIds.includes(contact.id));
        setContacts(prev => [...prev, ...uniqueNewContacts]);
      }

      setCurrentPage(page);
      setHasMore(response.next_page_url !== null);

    } catch (error) {
      console.error("Error en handleContactsResponse:", error);
      setError("Error al procesar los datos de contactos");
      setContacts([]);
    }
  };

  // Función auxiliar para manejar errores de API
  const handleApiError = (error) => {
    if (error.name !== 'AbortError') {
      console.error("Error cargando contactos:", error);
      // Mensaje de error más específico
      const errorMessage = error.response?.data?.message || 
                          "No se pudieron cargar los contactos";
      setError(errorMessage);
      setContacts([]); // Asegurarse de limpiar los contactos en caso de error
    }
  };

  const loadMoreContacts = () => {
    if (!hasMore || loadingMore || loading || isSearchMode) return;

    fetchContacts(currentPage + 1, false);
  };

  const handleDeleteContact = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este contacto?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const deleteCall = deleteContact(id);
      await callEndpoint(deleteCall);
      if (isSearchMode && searchTerm) {
        fetchContactsByName(searchTerm);
      } else {
        fetchContacts(1, true);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error eliminando contacto:", error);
        setError("No se pudo eliminar el contacto");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  //función para obtener el contacto a editar
  const handleFindContact = async (id) => {
    try {
      setIsDeleting(true);
      const contactCall = getContact(id);
      const response = await callEndpoint(contactCall);
      setContactFind(response);

      // Always set contactNew to true when editing, regardless of device type
      setContactNew(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error buscando contacto:", error);
        setError("No se pudo cargar la información del contacto");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
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
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
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
            <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
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