/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { ChatInterfaceClick } from "@/contexts/chats.js";
import { getTags, getTag } from "@/services/tags.js";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { updateChat } from "@/services/chats.js";
import Select from 'react-select';
import { useTheme } from "@/contexts/themeContext.jsx";

const ChatTag = ({ isOpen, onClose }) => {
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const { selectedChatId } = useContext(ChatInterfaceClick);
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
        const loadTags = async () => {
            try {
                const response = await callEndpoint(getTags({ page: 1 }));
                setTags(response.data || []);
            } catch (error) {
                console.error("Error obteniendo Tags:", error);
                setTags([]);
            }
        };
    
        const SearchTag = async () => {
            try {
                console.log("Buscando tag con ID:", selectedChatId.tag_id);
                const response = await callEndpoint(getTag(selectedChatId.tag_id));
                console.log("Tag encontrado:", response);
                setSelectedTag(response.data || null);
            } catch (error) {
                console.error("Error buscando tag:", error);
            }
        };
    
        loadTags();
        SearchTag();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Convertir las etiquetas al formato que espera react-select
    const tagOptions = tags.map(tag => ({
        value: tag.id,
        label: tag.name,
        color: tag.color
    }));

    // Componente personalizado para la opción del select con color
    const Option = ({ innerProps, label, data }) => (
        <div 
            {...innerProps}
            className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer"
        >
            <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: data.color }}
            />
            <div>{label}</div>
        </div>
    );

    // Componente para mostrar el valor seleccionado con color
    const SingleValue = ({ innerProps, data }) => (
        <div {...innerProps} className="flex items-center">
            <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: data.color }}
            />
            <div>{data.label}</div>
        </div>
    );

    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: theme === 'light' 
                ? 'rgb(var(--color-bg-light))' 
                : 'rgb(var(--color-bg-dark))',
            borderColor: theme === 'light'
                ? 'rgb(var(--color-primary-light))'
                : 'rgb(var(--color-primary-dark))',
            color: theme === 'light'
                ? 'rgb(var(--color-text-primary-light))'
                : 'rgb(var(--color-text-primary-dark))',
            boxShadow: 'none',
            '&:hover': {
                borderColor: theme === 'light'
                    ? 'rgb(var(--color-secondary-light))'
                    : 'rgb(var(--color-secondary-dark))',
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: theme === 'light'
                ? 'rgb(var(--color-bg-light-secondary))'
                : 'rgb(var(--color-bg-dark-secondary))',
            color: theme === 'light'
                ? 'rgb(var(--color-text-primary-light))'
                : 'rgb(var(--color-text-primary-dark))',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected 
                ? (theme === 'light' 
                    ? 'rgb(var(--color-primary-light))' 
                    : 'rgb(var(--color-primary-dark))')
                : 'transparent',
            '&:hover': {
                backgroundColor: theme === 'light'
                    ? 'rgba(var(--color-primary-light), 0.2)'
                    : 'rgba(var(--color-primary-dark), 0.2)',
            },
            color: theme === 'light'
                ? 'rgb(var(--color-text-primary-light))'
                : 'rgb(var(--color-text-primary-dark))',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: theme === 'light'
                ? 'rgb(var(--color-text-primary-light))'
                : 'rgb(var(--color-text-primary-dark))',
        }),
        input: (provided) => ({
            ...provided,
            color: theme === 'light'
                ? 'rgb(var(--color-text-primary-light))'
                : 'rgb(var(--color-text-primary-dark))',
        }),
    };

    if (!isOpen) return null; // Si no está abierto, no se renderiza

    return (
        <form className="fixed inset-0 flex items-center justify-center z-20" style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}>
            {/* Cierra el modal si se hace clic fuera */}
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
                    Etiquetar Chat
                </h1>
                <label className={`
                    text-sm mb-3 block
                    ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                `}>
                    {selectedChatId.name}
                </label>
                <div className="mb-4">
                    <label className={`
                        text-sm block mb-2
                        ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                    `}>
                        Selecciona una Etiqueta
                    </label>
                    <Select
                        options={tagOptions}
                        onChange={(option) => {
                            const tag = tags.find(t => t.id === option.value);
                            setSelectedTag(tag);
                        }}
                        placeholder="Seleccionar Etiqueta"
                        isSearchable
                        components={{ Option, SingleValue }}
                        styles={customStyles}
                        noOptionsMessage={() => "No hay etiquetas disponibles"}
                    />
                </div>

                {/* Botones */}
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
                            disabled:opacity-50
                        `}
                        onClick={(e) => {
                            e.preventDefault(); // Evita el comportamiento por defecto del formulario
                            if (selectedTag) {
                                console.log("Guardando etiqueta:", selectedTag.id, "del chat:", selectedChatId.id);
                                handleUpdateChat(selectedChatId.id, { tag_id: selectedTag.id });
                                onClose(); // Cierra el modal después de guardar
                            }
                        }}
                        disabled={!selectedTag}
                    >
                        Guardar
                    </button>
                </div>
            </motion.div>
        </form>
    );
};

export default ChatTag;