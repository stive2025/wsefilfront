import React from "react";
import { useTheme } from "@/contexts/themeContext";
import clsx from "clsx";

const MessageList = ({ isLoading, isNewChat, hasMessages, renderMessagesWithDateSeparators, selectedChatId }) => {
  const { theme } = useTheme();
  
  // Obtener la ruta del SVG basado en el tema
  const getBackgroundSVG = () => {
    return theme === 'dark' ? '/bg-dark.jpg' : '/bg-light.jpg';
  };
  
  return (
    <div
      className={clsx(
        "flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide",
        theme === 'dark'
          ? "bg-[rgb(var(--color-bg-dark))]"
          : "bg-[rgb(var(--color-bg-light))]"
      )}
      style={{
        backgroundImage: `url('${getBackgroundSVG()}')`,
        // backgroundSize: '1024px 1024px',
        // backgroundSize: '850px 1804px',
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
