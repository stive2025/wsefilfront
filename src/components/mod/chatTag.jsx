/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { ChatInterfaceClick } from "@/contexts/chats.js";
import { getTags, getTag } from "@/services/tags.js";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { updateChat } from "@/services/chats.js";
import Select from 'react-select';
import { useTheme } from "@/contexts/themeContext.jsx";
import clsx from 'clsx';

const ChatTag = ({ isOpen, onClose }) => {
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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
            await callEndpoint(updateChat(idChat, dataChat), `update_chat_${idChat}`);
        } catch (error) {
            console.error("Error actualizando chat ", error);
            throw error; // Re-lanzar para manejo en el onClick
        }
    };

    useEffect(() => {
        const loadData = async () => {
            // Validar que selectedChatId existe antes de proceder
            if (!selectedChatId || !selectedChatId.id) {
                console.warn('No hay chat seleccionado para etiquetar');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                console.log('Cargando datos para etiquetas, chat:', selectedChatId.id);

                // Cargar tags primero
                const tagsResponse = await callEndpoint(getTags({ page: 1 }));
                setTags(tagsResponse.data || []);
                console.log('Tags cargados:', tagsResponse.data?.length || 0);

                // Luego buscar tag actual si existe
                if (selectedChatId.tag_id) {
                    try {
                        const tagResponse = await callEndpoint(getTag(selectedChatId.tag_id));
                        setSelectedTag(tagResponse.data || null);
                        console.log('Tag actual encontrado:', tagResponse.data?.name);
                    } catch (tagError) {
                        console.warn('No se pudo cargar el tag actual:', tagError);
                        setSelectedTag(null);
                    }
                } else {
                    setSelectedTag(null);
                }
            } catch (error) {
                console.error("Error cargando datos de etiquetas:", error);
                setTags([]);
                setSelectedTag(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChatId?.id, isOpen]);

    // Convertir las etiquetas al formato que espera react-select
    const tagOptions = tags.map(tag => ({
        value: tag.id,
        label: tag.name,
        color: tag.color
    }));

    // Componente personalizado para la opción del select con color
    const Option = ({ innerProps, label, data }) => {
        console.log(label);
        return (
            <div
                {...innerProps}
                className={clsx(
                    "flex items-center px-3 py-2 cursor-pointer transition-colors duration-200",
                    theme === 'light'
                        ? "hover:bg-gray-100 text-gray-900"
                        : "hover:bg-gray-700 text-gray-100"
                )}
            >
                <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: data.color }}
                />
                <div className="truncate">{label}</div>
            </div>
        );
    }

    // Componente para mostrar el valor seleccionado con color
    const SingleValue = ({ innerProps, data }) => (
        <div {...innerProps} className="flex items-center">
            <div
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: data.color }}
            />
            <div className="truncate">{data.label}</div>
        </div>
    );

    // Simplified custom styles using Tailwind-compatible approach
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'transparent',
            borderColor: state.isFocused
                ? (theme === 'light' ? '#3b82f6' : '#60a5fa')
                : (theme === 'light' ? '#d1d5db' : '#4b5563'),
            boxShadow: state.isFocused ? '0 0 0 1px ' + (theme === 'light' ? '#3b82f6' : '#60a5fa') : 'none',
            '&:hover': {
                borderColor: theme === 'light' ? '#9ca3af' : '#6b7280',
            },
            minHeight: '38px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
            border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? (theme === 'light' ? '#3b82f6' : '#1d4ed8')
                : state.isFocused
                    ? (theme === 'light' ? '#f3f4f6' : '#374151')
                    : 'transparent',
            color: state.isSelected
                ? '#ffffff'
                : (theme === 'light' ? '#111827' : '#f9fafb'),
            '&:active': {
                backgroundColor: theme === 'light' ? '#2563eb' : '#1e40af',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: theme === 'light' ? '#111827' : '#f9fafb',
        }),
        input: (provided) => ({
            ...provided,
            color: theme === 'light' ? '#111827' : '#f9fafb',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: theme === 'light' ? '#6b7280' : '#9ca3af',
        }),
    };

    if (!isOpen) return null; // Si no está abierto, no se renderiza

    // Componente de loader
    const LoadingSpinner = () => (
        <div className="flex flex-col items-center justify-center py-8">
            <div className={clsx(
                "animate-spin rounded-full h-8 w-8 border-b-2",
                theme === 'light' ? "border-blue-600" : "border-blue-400"
            )}></div>
            <p className={clsx(
                "text-sm mt-2",
                theme === 'light' ? "text-gray-600" : "text-gray-300"
            )}>Cargando Etiquetas...</p>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-gray-700/50 backdrop-blur-sm">
            {/* Cierra el modal si se hace clic fuera */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                className={clsx(
                    "p-6 rounded-xl shadow-2xl w-96 max-w-[90vw] relative z-10 border",
                    theme === 'light'
                        ? "bg-white border-gray-200"
                        : "bg-gray-800 border-gray-600"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className={clsx(
                    "text-xl font-semibold mb-2",
                    theme === 'light' ? "text-gray-900" : "text-gray-100"
                )}>
                    Etiquetar Chat
                </h1>

                <p className={clsx(
                    "text-sm mb-4 font-medium",
                    theme === 'light' ? "text-gray-600" : "text-gray-300"
                )}>
                    {selectedChatId?.name || 'Chat sin nombre'}
                </p>

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <div className="mb-6">
                            <label className={clsx(
                                "text-sm font-medium block mb-2",
                                theme === 'light' ? "text-gray-700" : "text-gray-200"
                            )}>
                                Selecciona una Etiqueta
                            </label>
                            <div className={clsx(
                                "rounded-lg border-2 transition-colors",
                                theme === 'light'
                                    ? "bg-white border-gray-200"
                                    : "bg-gray-700 border-gray-600"
                            )}>
                                <Select
                                    options={tagOptions}
                                    value={selectedTag ? { value: selectedTag.id, label: selectedTag.name, color: selectedTag.color } : null}
                                    onChange={(option) => {
                                        const tag = tags.find(t => t.id === option.value);
                                        setSelectedTag(tag);
                                    }}
                                    placeholder="Seleccionar Etiqueta"
                                    isSearchable
                                    isClearable
                                    components={{ Option, SingleValue }}
                                    styles={customStyles}
                                    noOptionsMessage={() => "No hay etiquetas disponibles"}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                className={clsx(
                                    "px-4 py-2 rounded-lg font-medium transition-all duration-200 border",
                                    theme === 'light'
                                        ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                                        : "bg-gray-600 text-gray-200 border-gray-500 hover:bg-gray-500 hover:border-gray-400"
                                )}
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className={clsx(
                                    "px-4 py-2 rounded-lg font-medium transition-all duration-200 border",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    theme === 'light'
                                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 disabled:bg-gray-300 disabled:border-gray-300"
                                        : "bg-blue-500 text-white border-blue-500 hover:bg-blue-400 hover:border-blue-400 disabled:bg-gray-600 disabled:border-gray-600"
                                )}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    if (!selectedTag || !selectedChatId?.id) {
                                        console.warn('No se puede guardar: falta tag o chat seleccionado');
                                        return;
                                    }

                                    try {
                                        console.log('Guardando etiqueta:', selectedTag.name, 'en chat:', selectedChatId.id);
                                        await handleUpdateChat(selectedChatId.id, { tag_id: selectedTag.id });
                                        console.log('Etiqueta guardada exitosamente');
                                        onClose();
                                    } catch (error) {
                                        console.error('Error al guardar etiqueta:', error);
                                        // Aquí podrías mostrar un toast de error al usuario
                                    }
                                }}
                                disabled={!selectedTag || !selectedChatId?.id}
                            >
                                Guardar
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ChatTag;