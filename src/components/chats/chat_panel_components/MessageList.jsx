import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useTheme } from "@/contexts/themeContext";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const MessageList = forwardRef(({ isLoading, isNewChat, hasMessages, renderMessagesWithDateSeparators, selectedChatId }, ref) => {
  const { theme } = useTheme();
  const messageListRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
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

  // Exponer la función scrollToBottom al componente padre
  useImperativeHandle(ref, () => ({
    scrollToBottom
  }), []);

  // Función para detectar si el usuario está cerca del final
  const isNearBottom = () => {
    if (!messageListRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
    return scrollHeight - scrollTop - clientHeight < 100; // 100px de margen
  };

  // Manejar el evento de scroll
  const handleScroll = () => {
    if (messageListRef.current && hasMessages) {
      const nearBottom = isNearBottom();
      setShowScrollButton(!nearBottom);
    }
  };

  // Hacer scroll al final cuando se selecciona un chat diferente
  useEffect(() => {
    if (selectedChatId?.id && hasMessages && !isLoading) {
      // Usar setTimeout para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        scrollToBottom();
        setShowScrollButton(false); // Ocultar botón al cambiar de chat
      }, 100);
    }
  }, [selectedChatId?.id, hasMessages, isLoading]);

  // Agregar listener de scroll
  useEffect(() => {
    const scrollContainer = messageListRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [hasMessages]);
  
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
      
      {/* Botón flotante para ir al final */}
      <AnimatePresence>
        {showScrollButton && hasMessages && (
          <motion.button
            title="Ir al final del chat"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              duration: 0.3
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              scrollToBottom();
              setShowScrollButton(false);
            }}
            className={clsx(
              "absolute bottom-[105px] right-0 transform -translate-x-1/2",
              "w-12 h-12 rounded-full shadow-xl z-20",
              "flex items-center justify-center",
              "shadow-md cursor-pointer",
              theme === 'dark'
                ? "bg-[rgb(var(--color-primary-dark))] text-[rgb(var(--color-text-primary-dark))] border-white"
                : "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-text-primary-light))] border-gray-600"
            )}
          >
            <ChevronDown size={22} className="drop-shadow-sm" color="white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
