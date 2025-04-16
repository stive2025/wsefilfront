/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useContext } from "react";
import { ChatInterfaceClick } from "/src/contexts/chats.js";
import { updateChat } from "/src/services/chats.js";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import toast from "react-hot-toast";

const ChatTag = ({ isOpen, onClose }) => {
  const { selectedChatId } = useContext(ChatInterfaceClick);
  const { callEndpoint } = useFetchAndLoad();

  const variants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };

  if (!isOpen) return null;

  const handleClose = async () => {
    if (!selectedChatId || !selectedChatId.id) {
      console.error("No chat selected");
      return;
    }

    try {
        const { call, abortController } = updateChat(selectedChatId.id, { state: "CLOSED" });
        await callEndpoint({ call, abortController });

      toast.success("Chat finalizado con éxito");
    } catch (error) {
      toast.error("Ocurrió un error al finalizar el chat");
      console.error("Error al cerrar el chat:", error);
    } finally {
      onClose();
    }
  };

  return (
    <form className="fixed inset-0 flex items-center justify-center z-20" style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}>
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        className="bg-gray-900 p-5 rounded-lg shadow-lg w-96 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-white text-lg mb-2">Finalizar Chat</h1>
        <label className="text-white text-sm">El chat que va a finalizar es: {selectedChatId.name}</label>
        <div className="mb-2">
          <label className="text-white text-sm">¿Desea dar el chat por resuelto?</label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleClose}
          >
            Finalizar Chat
          </button>
        </div>
      </motion.div>
    </form>
  );
};

export default ChatTag;
