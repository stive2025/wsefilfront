/* eslint-disable react/prop-types */ 
import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { ChatInterfaceClick } from "/src/contexts/chats.js";
import { getAgents } from "/src/services/agents.js";
import { transferChat } from "/src/services/chats.js";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import toast from "react-hot-toast";

const ChatTransfer = ({ isOpen, onClose }) => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [observations, setObservations] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const { selectedChatId,setSelectedChatId } = useContext(ChatInterfaceClick);
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
        <div className="fixed inset-0 flex items-center justify-center z-20" style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}>
            <div className="absolute inset-0" onClick={onClose}></div>

            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                className="bg-gray-900 p-5 rounded-lg shadow-lg w-96 relative z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="text-white text-lg mb-2">Transferir Chat</h1>
                <label className="text-white text-sm">{selectedChatId.name}</label>

                <div className="mb-2">
                    <label className="text-white text-sm">Transferir a:</label>
                    <select
                        className={`w-full bg-gray-900 outline-none ${selectedAgent ? 'text-white' : 'text-gray-400'}`}
                        value={selectedAgent?.id || ""}
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

                <div className="mb-3">
                    <div className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            id="isPrivate"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="isPrivate" className="text-white text-sm">Incluir mensaje privado</label>
                    </div>

                    {isPrivate && (
                        <div>
                            <label className="text-white text-sm">Mensaje:</label>
                            <textarea 
                                className="text-xs border p-1 rounded bg-transparent text-white w-full" 
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
                        className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button"
                        className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
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
