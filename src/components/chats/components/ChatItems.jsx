import { useContext, useEffect } from "react";
import { Check, Clock, AlertTriangle, Eye, Loader } from "lucide-react";
import { ChatInterfaceClick, TempNewMessage } from "@/contexts/chats.js";
import { updateChat } from "@/services/chats.js";
import { useTheme } from "@/contexts/themeContext";
import { getUserLabelColors } from "@/utils/getUserLabelColors";
import { formatTimestamp, isChatSelected } from "../utils/chatUtils";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard';
import { useAuth } from '@/contexts/authContext';

/**
 * Componente que renderiza la lista de chats
 * @param {Object} props - Props del componente
 * @param {Array} props.chats - Lista de chats
 * @param {Function} props.setChats - Función para actualizar la lista de chats
 * @param {boolean} props.loading - Estado de carga
 * @param {Function} props.loadMoreChats - Función para cargar más chats
 * @param {boolean} props.hasMoreChats - Indica si hay más chats para cargar
 * @param {Object} props.incomingMessages - Mensajes entrantes
 */
const ChatItems = ({ 
  chats, 
  setChats, 
  loading, 
  loadMoreChats, 
  hasMoreChats, 
  incomingMessages 
}) => {
  const { theme } = useTheme();
  const { hasAbility } = useAuth();
  const { selectedChatId, setSelectedChatId } = useContext(ChatInterfaceClick);
  const { tempIdChat } = useContext(TempNewMessage);

  /**
   * Renderiza el estado de ACK del mensaje
   */
  const renderAckStatus = (ackStatus) => {
    const iconProps = { size: 12 };
    
    switch (ackStatus) {
      case 1:
        return <Clock {...iconProps} className="text-gray-400" title="Enviado" />;
      case 2:
        return <Check {...iconProps} className="text-gray-400" title="Entregado" />;
      case 3:
        return <Check {...iconProps} className="text-blue-400" title="Leído" />;
      case 4:
        return <AlertTriangle {...iconProps} className="text-red-400" title="Error" />;
      default:
        return <Clock {...iconProps} className="text-gray-400" title="Pendiente" />;
    }
  };

  /**
   * Actualiza un chat específico
   */
  const handleUpdateChat = async (idChat, dataChat) => {
    try {
      await updateChat(idChat, dataChat);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === idChat ? { ...chat, ...dataChat } : chat
        )
      );
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  };

  /**
   * Marca un chat como leído
   */
  const markChatAsRead = async (chatId) => {
    try {
      await handleUpdateChat(chatId, { unread_message: 0 });
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  /**
   * Maneja el click normal del chat (marca como leído)
   */
  const handleChatClick = (item) => {
    if (!hasAbility(ABILITIES.CHATS.VIEW)) return;

    setSelectedChatId({
      id: item.id,
      idContact: item.contact_id,
      name: item.name,
      photo: item.avatar || "/avatar.jpg",
      number: item.number
    });

    // Marcar como leído si tiene mensajes no leídos
    if (item.unread_message > 0) {
      markChatAsRead(item.id);
    }
  };

  /**
   * Maneja el click del ojo (solo visualizar, no marca como leído)
   */
  const handleEyeClick = (e, item) => {
    e.stopPropagation();
    
    if (!hasAbility(ABILITIES.CHATS.VIEW)) return;

    setSelectedChatId({
      id: item.id,
      idContact: item.contact_id,
      name: item.name,
      photo: item.avatar || "/avatar.jpg",
      number: item.number
    });
  };

  /**
   * Sincroniza el estado de lectura cuando se selecciona un chat
   */
  const syncReadStatus = () => {
    if (selectedChatId) {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChatId.id
            ? { ...chat, unread_message: 0 }
            : chat
        )
      );
    }
  };

  // Efecto para sincronizar estado de lectura
  useEffect(() => {
    syncReadStatus();
  }, [selectedChatId]);

  if (!chats || chats.length === 0) {
    return (
      <div className={`p-8 text-center text-[rgb(var(--color-text-secondary-${theme}))]`}>
        <div className="mb-4">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-lg font-medium">No hay chats disponibles</p>
          <p className="text-sm mt-2">Los chats aparecerán aquí cuando recibas mensajes.</p>
        </div>
      </div>
    );
  }

  return (
    <AbilityGuard abilities={[ABILITIES.CHATS.VIEW]}>
      <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
        {chats.map((item, index) => {
          const isSelected = isChatSelected(item.id, selectedChatId, tempIdChat);
          const colors = getUserLabelColors(item.by_user?.id);

          return (
            <div
              key={`${item.id}-${index}`}
              className={`w-full flex items-center p-4 cursor-pointer transition-colors duration-200 ${
                isSelected
                  ? `bg-[rgb(var(--color-primary-${theme}))] text-white`
                  : `hover:bg-[rgb(var(--color-bg-${theme}))] text-[rgb(var(--color-text-primary-${theme}))]`
              }`}
              onClick={() => handleChatClick(item)}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-3">
                <img
                  src={item.avatar || "/avatar.jpg"}
                  alt={item.name || 'Chat'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/avatar.jpg";
                  }}
                />
              </div>

              {/* Contenido del chat */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm truncate flex-1">
                    {item.name || 'Sin nombre'}
                  </h3>
                  <div className="flex items-center space-x-1 ml-2">
                    {/* Timestamp */}
                    <span className="text-xs opacity-75">
                      {formatTimestamp(item.updated_at)}
                    </span>
                    {/* ACK Status para mensajes enviados */}
                    {item.from_me === "true" && renderAckStatus(item.ack)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs opacity-75 truncate flex-1">
                    {item.last_message || 'Sin mensajes'}
                  </p>
                  
                  <div className="flex items-center space-x-2 ml-2">
                    {/* Indicador de agente asignado */}
                    {item.by_user && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.bg }}
                        title={`Asignado a: ${item.by_user.name}`}
                      />
                    )}

                    {/* Contador de mensajes no leídos */}
                    {item.unread_message > 0 && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium
                        ${isSelected 
                          ? 'bg-white text-gray-800' 
                          : `bg-[rgb(var(--color-primary-${theme}))] text-white`
                        }`}>
                        {item.unread_message}
                      </span>
                    )}

                    {/* Botón de ojo para ver sin marcar como leído */}
                    {item.unread_message > 0 && (
                      <AbilityGuard abilities={[ABILITIES.CHATS.VIEW]}>
                        <button
                          onClick={(e) => handleEyeClick(e, item)}
                          className={`p-1 rounded-full transition-colors duration-200
                            ${isSelected
                              ? 'hover:bg-white hover:bg-opacity-20'
                              : `hover:bg-[rgb(var(--color-bg-${theme}))]`
                            }`}
                          title="Ver sin marcar como leído"
                        >
                          <Eye size={14} />
                        </button>
                      </AbilityGuard>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Botón para cargar más chats */}
        {hasMoreChats && (
          <div className="p-4 text-center">
            <button
              onClick={loadMoreChats}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors duration-200
                ${loading
                  ? 'opacity-50 cursor-not-allowed'
                  : `bg-[rgb(var(--color-primary-${theme}))] hover:bg-[rgb(var(--color-secondary-${theme}))] text-white`
                }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader className="animate-spin" size={16} />
                  <span>Cargando...</span>
                </div>
              ) : (
                'Cargar más chats'
              )}
            </button>
          </div>
        )}

        {/* Indicador de carga general */}
        {loading && chats.length === 0 && (
          <div className={`flex justify-center items-center py-4 bg-transparent`}>
            <Loader className="animate-spin" size={20} />
          </div>
        )}
      </div>
    </AbilityGuard>
  );
};

export default ChatItems;
