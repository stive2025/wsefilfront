/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { ChatInterfaceClick } from "/src/contexts/chats.js";
import { getAgents } from "/src/services/agents.js";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";

const ChatTransfer = ({ isOpen, onClose }) => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const { selectedChatId } = useContext(ChatInterfaceClick);
    const { callEndpoint } = useFetchAndLoad();

    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };

    useEffect(() => {
        const loadAgents = async () => {
            try {
                const response = await callEndpoint(getAgents({ page: 1 }));
                setAgents(response.data || []);
            } catch (error) {
                console.error("Error obteniendo agentes:", error);
                setAgents([]);
            }
        }

        loadAgents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isOpen) return null; // Si no está abierto, no se renderiza

    return (
        <form className=" fixed inset-0 flex items-center justify-center z-20" style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}>
            {/* Cierra el modal si se hace clic fuera */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                className="bg-gray-900 p-5 rounded-lg shadow-lg w-96 relative z-10"
                onClick={(e) => e.stopPropagation()} //mas abajito reemplazar por el backend linea 38 (chatId)
            >
                <h1 className="text-white text-lg mb-2">Transferir Chat</h1>
                <label className="text-white text-sm">{selectedChatId.name}</label>
                <div className="mb-2">
                    <label className="text-white text-sm">Transferir a:</label>
                    <select
                        className={`w-full bg-gray-900 outline-none ${selectedAgent ? 'text-white' : 'text-gray-400'}`}
                        value={selectedAgent ? selectedAgent.id : ""}
                        onChange={(e) => {
                            const agent = agents.find((a) => a.id === parseInt(e.target.value));
                            setSelectedAgent(agent);
                        }}
                    >
                        <option value="" disabled>Seleccionar agente</option>
                        {agents.length > 0 ? (
                            agents.map((agent) => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>No hay agentes</option>
                        )}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="text-white text-sm">Observaciones:</label>
                    <textarea className="text-xs border p-1 rounded bg-transparent text-white w-full" />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                        Transferir
                    </button>
                </div>
            </motion.div>
        </form>
    );
};

export default ChatTransfer;
