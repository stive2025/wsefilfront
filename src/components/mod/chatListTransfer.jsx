/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const ChatListTransfer = ({ isOpen, onClose }) => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);

    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };

    useEffect(() => {
        fetch("https://listarAgentes") // Reemplaza con tu API real
            .then((response) => response.json())
            .then((data) => setAgents(data))
            .catch((error) => console.error("Error obteniendo agentes:", error));
    }, []);

    if (!isOpen) return null; // Si no está abierto, no se renderiza

    return (
        <div className=" fixed inset-0 flex items-center justify-center z-20" style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}>
            {/* Cierra el modal si se hace clic fuera */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                className="bg-gray-900 p-5 rounded-lg shadow-lg w-96 relative z-10"
                onClick={(e) => e.stopPropagation()} // Evita cerrar si se hace clic dentro del modal
            >
                <h1 className="text-white text-lg mb-2">Transferir Chat</h1>

                <div className="mb-2">
                    <label className="text-white text-sm">Transferir a:</label>
                    <select
                        className="text-xs border p-1 rounded bg-transparent text-white w-full sm:p-2"
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
        </div>
    );
};

export default ChatListTransfer;
