/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { ChatInterfaceClick } from "/src/contexts/chats.js";


const ChatTag = ({ isOpen, onClose }) => {
    const [Tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const { selectedChatId } = useContext(ChatInterfaceClick);


    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };

    useEffect(() => {
        fetch("https://listarTags") // Reemplaza con tu API real
            .then((response) => response.json())
            .then((data) => setTags(data))
            .catch((error) => console.error("Error obteniendo tags:", error));
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
                <h1 className="text-white text-lg mb-2">Etiquetar Chat</h1>
                <label className="text-white text-sm">{selectedChatId.name}</label>
                <div className="mb-2">
                    <label className="text-white text-sm">Selecciona una Etiqueta</label>
                    <select
                        className="text-xs border p-1 rounded bg-transparent text-white w-full sm:p-2"
                        value={selectedTag ? selectedTag.id : ""}
                        onChange={(e) => {
                            const tag = Tags.find((t) => t.id === parseInt(e.target.value));
                            setSelectedTag(tag);
                        }}
                    >
                        <option value="" disabled>Seleccionar Etiqueta</option>
                        {Tags.length > 0 ? (
                            Tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>No hay Etiquetas</option>
                        )}
                    </select>
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
                        Guardar
                    </button>
                </div>
            </motion.div>
        </form>
    );
};

export default ChatTag;
