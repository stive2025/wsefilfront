import React, { useRef, useEffect } from "react";
import { useTheme } from "@/contexts/themeContext";
import clsx from "clsx";

const MessageList = ({ isLoading, isNewChat, hasMessages, renderMessagesWithDateSeparators, selectedChatId }) => {
  const { theme } = useTheme();
  const messageListRef = useRef(null);
  
  // Obtener la ruta del SVG basado en el tema
  const getBackgroundSVG = () => {
    return theme === 'dark' ? '/bg-dark.jpg' : '/bg-light.jpg';
  };

  // Función para hacer scroll al final
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  // Hacer scroll al final cuando se selecciona un chat diferente
  useEffect(() => {
    if (selectedChatId?.id && hasMessages && !isLoading) {
      // Usar setTimeout para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedChatId?.id, hasMessages, isLoading]);
  
  return (
    <div
      ref={messageListRef}
      className={clsx(
        "flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide",
        theme === 'dark'
          ? "bg-[rgb(var(--color-bg-dark))]"
          : "bg-[rgb(var(--color-bg-light))]"
      )}
      style={{
        backgroundImage: `url('${getBackgroundSVG()}')`,
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'local'
      }}
    >
      {isLoading && (
        <div className="flex justify-center py-4">
          <span className="animate-spin">Cargando...</span>
        </div>
      )}
      {isNewChat && !hasMessages ? (
        <div className="flex flex-col justify-center items-center h-full opacity-50">
          <p>Nuevo chat con {selectedChatId.name || selectedChatId.number}</p>
          <p className="text-sm mt-2">Escribe tu primer mensaje</p>
        </div>
      ) : (
        renderMessagesWithDateSeparators()
      )}
    </div>
  );
};

export default MessageList;
