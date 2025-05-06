/* eslint-disable react/prop-types */ 
import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { ChatInterfaceClick } from "/src/contexts/chats.js";
import { getAgents } from "/src/services/agents.js";
import { transferChat, updateChat } from "/src/services/chats.js";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { useTheme } from "/src/contexts/themeContext.jsx";
import toast from "react-hot-toast";

const ChatTransfer = ({ isOpen, onClose }) => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [observations, setObservations] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const { selectedChatId,setSelectedChatId } = useContext(ChatInterfaceClick);
    const { callEndpoint } = useFetchAndLoad();
    const { theme } = useTheme();

    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };

    const handleUpdateChat = async (idChat, dataChat) => {
        try {
          const response = await callEndpoint(updateChat(idChat, dataChat), `update_chat_${idChat}`);
          console.log("Chat actualizado ", response);
        } catch (error) {
          console.error("Error actualizando chat ", error);
        }
      };

    useEffect(() => {
        const loadAgents = async () => {
            try {
                const response = await callEndpoint(getAgents({ page: 1 }));
                setAgents(response.data || []);
            } catch (error) {
                console.error("Error obteniendo agentes:", error);
                toast.error("Error al cargar los agentes.");
                setAgents([]);
            }
        };

        loadAgents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();

        if (!selectedAgent) {
            toast.error("Por favor seleccione un agente para transferir el chat.");
            return;
        }

        try {
            const transferData = {
                to: selectedAgent.id,
                is_private: isPrivate
            };

            const newStateChat = {state: "PENDING"};
            await handleUpdateChat(selectedChatId.id, newStateChat);

            if (isPrivate && observations.trim()) {
                transferData.body = observations;
            }

            await callEndpoint(transferChat(selectedChatId.id, transferData));
            toast.success("Chat transferido exitosamente.");
            setSelectedChatId(null);
            onClose();
        } catch (error) {
            console.error("Error al transferir el chat:", error);
            toast.error("Error al transferir el chat. Inténtelo nuevamente.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-20" 
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
                    Transferir Chat
                </h1>
                <label className={`
                    text-sm
                    ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                `}>
                    {selectedChatId.name}
                </label>

                <div className="mb-2">
                    <label className={`
                        text-sm block mb-1
                        ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                    `}>
                        Transferir a:
                    </label>
                    <select
                        className={`
                            w-full p-2 rounded transition-colors duration-200
                            ${theme === 'light' 
                                ? 'bg-[rgb(var(--color-bg-light-secondary))]' 
                                : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
                            ${theme === 'light' 
                                ? 'text-[rgb(var(--color-text-primary-light))]' 
                                : 'text-[rgb(var(--color-text-primary-dark))]'}
                            outline-none border
                            ${theme === 'light'
                                ? 'border-[rgb(var(--color-primary-light))]'
                                : 'border-[rgb(var(--color-primary-dark))]'}
                        `}
                        value={selectedAgent?.id || ""}
                        onChange={(e) => {
                            const agent = agents.find((a) => a.id === parseInt(e.target.value));
                            setSelectedAgent(agent);
                        }}
                    >
                        <option value="" disabled>Seleccionar agente</option>
                        {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <div className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            id="isPrivate"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className={`
                                mr-2 rounded transition-colors duration-200
                                ${theme === 'light'
                                    ? 'accent-[rgb(var(--color-primary-light))]'
                                    : 'accent-[rgb(var(--color-primary-dark))]'}
                            `}
                        />
                        <label 
                            htmlFor="isPrivate" 
                            className={`
                                text-sm
                                ${theme === 'light' 
                                    ? 'text-[rgb(var(--color-text-secondary-light))]' 
                                    : 'text-[rgb(var(--color-text-secondary-dark))]'}
                            `}
                        >
                            Incluir mensaje privado
                        </label>
                    </div>

                    {isPrivate && (
                        <div>
                            <label className={`
                                text-sm block mb-1
                                ${theme === 'light' 
                                    ? 'text-[rgb(var(--color-text-secondary-light))]' 
                                    : 'text-[rgb(var(--color-text-secondary-dark))]'}
                            `}>
                                Mensaje:
                            </label>
                            <textarea 
                                className={`
                                    w-full p-2 rounded text-sm transition-colors duration-200
                                    ${theme === 'light' 
                                        ? 'bg-[rgb(var(--color-bg-light-secondary))]' 
                                        : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
                                    ${theme === 'light' 
                                        ? 'text-[rgb(var(--color-text-primary-light))]' 
                                        : 'text-[rgb(var(--color-text-primary-dark))]'}
                                    border
                                    ${theme === 'light'
                                        ? 'border-[rgb(var(--color-primary-light))]'
                                        : 'border-[rgb(var(--color-primary-dark))]'}
                                `}
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder="Escriba un mensaje privado"
                                rows={3}
                            />
                        </div>
                    )}
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
                            hover:opacity-80 disabled:opacity-50
                        `}
                        onClick={handleTransfer}
                        disabled={!selectedAgent}
                    >
                        Transferir
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ChatTransfer;
