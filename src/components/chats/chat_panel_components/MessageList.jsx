import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { useTheme } from "@/contexts/themeContext";
import { ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const MessageList = forwardRef(({ 
  isLoading, 
  isNewChat, 
  hasMessages, 
  renderMessagesWithDateSeparators, 
  selectedChatId,
  // Nuevas props para paginación
  isLoadingMore = false,
  hasMoreMessages = false,
  onLoadMore = () => {}
}, ref) => {
  const { theme } = useTheme();
  const messageListRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const previousChatIdRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  
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

  // Detectar si el usuario está cerca del top para cargar más mensajes
  const isNearTop = useCallback(() => {
    if (!messageListRef.current) return false;
    const { scrollTop } = messageListRef.current;
    return scrollTop <= 100; // 100px de margen desde el top
  }, []);

  // Manejar el evento de scroll
  const handleScroll = useCallback(() => {
    if (!messageListRef.current || !hasMessages) return;
    
    const nearBottom = isNearBottom();
    const nearTop = isNearTop();
    
    // Mostrar/ocultar botón de scroll al final
    setShowScrollButton(!nearBottom);
    
    // Cargar más mensajes si está cerca del top
    if (nearTop && !isLoadingMore && hasMoreMessages) {
      onLoadMore();
    }
  }, [hasMessages, isNearBottom, isNearTop, isLoadingMore, hasMoreMessages, onLoadMore]);

  // Detectar cambio de chat y marcar para scroll automático
  useEffect(() => {
    const currentChatId = selectedChatId?.id;
    const previousChatId = previousChatIdRef.current;
    
    // Si cambió el chat ID, marcar para hacer scroll al final
    if (currentChatId && currentChatId !== previousChatId) {
      setShouldScrollToBottom(true);
      previousChatIdRef.current = currentChatId;
    }
  }, [selectedChatId?.id]);
  
  // Hacer scroll al final solo cuando sea necesario (cambio de chat)
  useEffect(() => {
    if (shouldScrollToBottom && hasMessages && !isLoading) {
      // Usar setTimeout para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        scrollToBottom();
        setShowScrollButton(false); // Ocultar botón al cambiar de chat
        setShouldScrollToBottom(false); // Reset flag
      }, 100);
    }
  }, [shouldScrollToBottom, hasMessages, isLoading]);

  // Agregar listener de scroll
  useEffect(() => {
    const scrollContainer = messageListRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
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
      {/* Indicador de carga para más mensajes (parte superior) */}
      <AnimatePresence>
        {isLoadingMore && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center py-3 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Cargando mensajes anteriores...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Indicador de carga inicial */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2">
            <Loader2 size={20} className="animate-spin" />
            <span>Cargando mensajes...</span>
          </div>
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
