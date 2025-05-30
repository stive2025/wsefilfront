/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useContext } from "react";
import { ChatInterfaceClick } from "@/contexts/chats.js";
import { updateChat } from "@/services/chats.js";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { useTheme } from "@/contexts/themeContext.jsx";
import toast from "react-hot-toast";

const ChatResolved = ({ isOpen, onClose }) => {
  const { selectedChatId, setSelectedChatId } = useContext(ChatInterfaceClick);
  const { callEndpoint } = useFetchAndLoad();
  const { theme } = useTheme();

  const variants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };

  // Añadir esta función
  const handleUpdateChat = async (idChat, dataChat) => {
    try {
      const response = await callEndpoint(updateChat(idChat, dataChat), `update_chat_${idChat}`);
      console.log("Chat actualizado ", response);
      return response;
    } catch (error) {
      console.error("Error actualizando chat ", error);
      throw error;
    }
  };

  if (!isOpen) return null;

  const handleClose = async () => {
    try {
        // 1. Primero hacer la actualización en el servidor
        await handleUpdateChat(selectedChatId.id, { state: "CLOSED" });

        // 2. Encontrar y animar el elemento del chat
        const chatElement = document.querySelector(`[data-chat-id="${selectedChatId.id}"]`);
        if (chatElement) {
            chatElement.style.animation = 'slideOutAndFade 0.3s ease-out forwards';
            
            // 3. Esperar a que termine la animación antes de ocultarlo
            await new Promise(resolve => setTimeout(resolve, 300));
            chatElement.style.display = 'none';
        }

        setSelectedChatId(null);
        onClose();
        toast.success("Chat finalizado exitosamente");
    } catch (error) {
        toast.error("Error al finalizar el chat");
        console.error("Error:", error);
    }
  };

  return (
    <form className="fixed inset-0 flex items-center justify-center z-20" 
          style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}>
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        className={`
          p-5 rounded-lg shadow-lg w-96 relative z-10
          ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light))]' : 'bg-[rgb(var(--color-bg-dark))]'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className={`
          text-lg mb-2
          ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
        `}>
          Finalizar Chat
        </h1>
        <label className={`
          text-sm block mb-2
          ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
        `}>
          El chat que va a finalizar es: {selectedChatId.name}
        </label>
        <div className="mb-2">
          <label className={`
            text-sm
            ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
          `}>
            ¿Desea dar el chat por resuelto?
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={`
              px-4 py-1 rounded transition-colors duration-200
              ${theme === 'light' 
                ? 'bg-[rgb(var(--color-secondary-light))]' 
                : 'bg-[rgb(var(--color-secondary-dark))]'}
              ${theme === 'light' 
                ? 'text-[rgb(var(--color-text-primary-light))]' 
                : 'text-[rgb(var(--color-text-primary-dark))]'}
              hover:opacity-80
            `}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`
              px-4 py-1 rounded transition-colors duration-200
              ${theme === 'light' 
                ? 'bg-[rgb(var(--color-primary-light))]' 
                : 'bg-[rgb(var(--color-primary-dark))]'}
              ${theme === 'light' 
                ? 'text-[rgb(var(--color-text-primary-light))]' 
                : 'text-[rgb(var(--color-text-primary-dark))]'}
              hover:opacity-80
            `}
            onClick={handleClose}
          >
            Finalizar Chat
          </button>
        </div>
      </motion.div>
    </form>
  );
};

export default ChatResolved;
