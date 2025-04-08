/* eslint-disable react/prop-types */
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { Search, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { NewContactForm, ChatInterfaceClick, NewMessage, UpdateContactForm, ContactHandle } from "/src/contexts/chats.js";
import { useNavigate, useLocation } from "react-router-dom";
import { getContacts, deleteContact, getContact } from "/src/services/contacts.js";

// Componentes reutilizables
const SearchInput = ({ searchTerm, onSearchChange }) => (
  <div className="p-2 bg-gray-900">
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-gray-800 rounded-lg pl-8 pr-2 py-1 text-white placeholder-gray-400"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Search className="absolute left-1 text-gray-400" size={18} />
    </div>
  </div>
);

const ContactItems = ({ contacts, onDeleteContact, isDeleting, onFindContact, loadingMore, lastContactRef, setSelectedChatId, setNewMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si contacts existe y contiene un array antes de mapear
  if (!contacts || !contacts.length) {
    return <div className="p-4 text-gray-400">No hay contactos disponibles</div>;
  }

  return (
    <div className="bg-gray-900">
      {contacts.map((item, index) => (
        <div
          key={item.id}
          className="w-full flex items-center p-4"
          // Solo aplicar la referencia al último elemento
          ref={index === contacts.length - 1 ? lastContactRef : null}
        >
          <div
            className="w-full flex items-center space-x-3 hover:bg-gray-800 cursor-pointer active:bg-gray-700"
            onClick={() => {
              if (location.pathname === "/contacts") {
                navigate("/chatList");
              }
              setSelectedChatId(item.id);
              setNewMessage(false);
            }}
          >
            {/* Aquí puedes poner un avatar si tu API devuelve uno, si no, usar una imagen por defecto */}
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
              {item.name ? item.name.charAt(0).toUpperCase() : '?'}
            </div>

            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">{item.name || 'Sin nombre'}</div>
              <div className="text-xs md:text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] sm:max-w-[200px]">
                {item.phone_number || 'Sin número'}
                {item.id || 'Sin id'}
              </div>
            </div>
          </div>
          {location.pathname === "/contacts" && (
            <div className="flex">
              <button
                className="mr-2 text-gray-400 hover:text-white"
                onClick={() => onFindContact(item.id)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => onDeleteContact(item.id)}
                disabled={isDeleting}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      ))}
      {loadingMore && (
        <div className="p-4 text-gray-400 text-center">Cargando más contactos...</div>
      )}
    </div>
  );
};

const ListContacts = () => {
  const { setNewMessage } = useContext(NewMessage);
  const { setContactNew } = useContext(NewContactForm);
  const { setContactFind } = useContext(UpdateContactForm);
  const { contactHandle } = useContext(ContactHandle);
  const { setSelectedChatId } = useContext(ChatInterfaceClick);

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
    //setContactHandle(false); // Resetear el estado de contacto al cargar la lista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactHandle]);

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(setTimeout(() => {
      // Si el término de búsqueda está vacío, volvemos al modo de paginación normal
      if (!searchTerm) {
        setIsSearchMode(false);
        fetchContacts(1, true);
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
      // Evitar múltiples solicitudes simultáneas
      if ((loading && !reset) || (loadingMore && !reset)) return;

      // Si estamos reseteando, activamos el estado de carga principal
      // Si estamos cargando más, activamos loadingMore
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
      setContacts([]);

      // Construir parámetros para la llamada API - solo búsqueda por nombre
      const params = {
        name: name
      };

      // Llamar a getContacts() con los parámetros
      const contactsCall = getContacts(params);
      const response = await callEndpoint(contactsCall);

      // Procesar la respuesta
      handleContactsResponse(response, true, 1);

    } catch (error) {
      handleApiError(error);
    }
  };

  // Función auxiliar para manejar las respuestas de contactos
  const handleContactsResponse = (response, reset, page) => {
    const newContacts = response.data || [];
    setTotalItems(response.total || 0);

    if (reset) {
      setContacts(newContacts);
    } else {
      // Verificar duplicados antes de añadir
      const existingIds = contacts.map(contact => contact.id);
      const uniqueNewContacts = newContacts.filter(contact => !existingIds.includes(contact.id));
      setContacts(prev => [...prev, ...uniqueNewContacts]);
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
      console.error("Error cargando contactos:", error);
      setError("No se pudieron cargar los contactos");
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
      console.log("Contacto encontrado:", response);

      // Ajustar visualización según el dispositivo
      isMobile ? setContactNew(true) : setContactNew(false);
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

  return isMobile ? (
    <div className="w-full sm:w-80 mt-10 flex flex-col bg-transparent text-white">
      <div className="flex flex-row flex-shrink-0">
        {location.pathname === "/chatList" && (
          <button className="text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black p-1"
            onClick={() => setNewMessage(null)}>
            <ArrowLeft size={15} />
          </button>
        )}
        <label className="p-1">CONTACTOS</label>
      </div>
      {/* Contenedor fijo para header, search */}
      <div className="flex flex-col flex-shrink-0">
        <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
      </div>

      {/* Lista de contactos con scroll */}
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
        <button
          className="absolute bottom-4 right-4 mb-15 rounded-full p-3 shadow-lg text-white cursor-pointer bg-naranja-base hover:bg-naranja-medio"
          onClick={() => setContactNew((prev) => !prev)}
        >
          <Plus size={18} />
        </button>
      )}
    </div>
  ) : (
    <div className="flex-1 border-r border-gray-700 flex flex-col bg-transparent text-white pt-10 ml-10 overflow-y-auto">
      {location.pathname === "/chatList" && (
        <div className="flex flex-row items-center flex-shrink-0 p-2">
          <button className="text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black p-1"
            onClick={() => setNewMessage(null)}>
            <ArrowLeft size={15} />
          </button>
          <label className="p-1">CONTACTOS</label>
        </div>
      )}
      {/* Fijamos el header y search */}
      {location.pathname === "/contacts" && (
        <div className="flex flex-col flex-shrink-0">
          <label className="p-1">CONTACTOS</label>
          <SearchInput searchTerm={searchTerm} onSearchChange={handleSearch} />
        </div>
      )}
      {/* Lista de contactos con scroll */}
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
    </div>
  );
};

export default ListContacts;