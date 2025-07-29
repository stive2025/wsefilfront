import { useRef, useEffect, useContext } from "react";
import { ChatInterfaceClick, TempNewMessage } from "@/contexts/chats.js";
import Resize from "@/hooks/responsiveHook.jsx";
import { useAuth } from '@/contexts/authContext';
import { ABILITIES } from '@/constants/abilities';

// Componentes modularizados
import ChatHeader from './components/ChatHeader';
import SearchInput from './components/SearchInput';
import TagsBar from './components/TagsBar';
import AgentSelect from './components/AgentSelect';
import ChatItems from './components/ChatItems';

// Hook personalizado
import { useChatList } from './hooks/useChatList';

/**
 * Componente principal de la lista de chats optimizado y modularizado
 * @param {Object} props - Props del componente
 * @param {string} props.role - Rol del usuario actual
 */
const ChatListOptimized = ({ role = "admin" }) => {
  const isMobile = Resize();
  const chatListRef = useRef(null);
  const { hasAbility } = useAuth();
  const { selectedChatId } = useContext(ChatInterfaceClick);
  const { tempIdChat } = useContext(TempNewMessage);

  // Hook personalizado que maneja toda la lógica
  const {
    chats,
    setChats,
    searchQuery,
    setSearchQuery,
    loading,
    hasMoreChats,
    tags,
    loadMoreChats,
  } = useChatList({
    pageSize: 20,
    debounceDelay: 500
  });

  // Scroll al inicio cuando se selecciona un chat
  useEffect(() => {
    if ((selectedChatId || tempIdChat) && chatListRef.current) {
      chatListRef.current.scrollTop = 0;
    }
  }, [selectedChatId, tempIdChat]);

  // Verificar permisos al inicio
  if (!hasAbility(ABILITIES.CHATS.VIEW)) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-900 text-gray-400">
        No tienes permisos para acceder a esta sección
      </div>
    );
  }

  // Layout para móvil
  const MobileLayout = () => (
    <div className="w-full sm:w-80 border-r border-gray-700 flex flex-col text-white h-screen">
      <div className="flex flex-col flex-shrink-0 mt-14">
        <ChatHeader />
        <SearchInput 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        <AgentSelect role={role} />
        <TagsBar tags={tags} />
      </div>
      <div className="flex-1 overflow-y-auto" ref={chatListRef}>
        <ChatItems
          chats={chats}
          setChats={setChats}
          loading={loading}
          loadMoreChats={loadMoreChats}
          hasMoreChats={hasMoreChats}
        />
      </div>
    </div>
  );

  // Layout para desktop
  const DesktopLayout = () => (
    <div className="flex-1 border-r border-gray-700 flex flex-col text-white pt-10 ml-10 overflow-y-auto">
      <div className="flex flex-col flex-shrink-0">
        <ChatHeader />
        <SearchInput 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        <AgentSelect role={role} />
        <TagsBar tags={tags} />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide" ref={chatListRef}>
        <ChatItems
          chats={chats}
          setChats={setChats}
          loading={loading}
          loadMoreChats={loadMoreChats}
          hasMoreChats={hasMoreChats}
        />
      </div>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

export default ChatListOptimized;
