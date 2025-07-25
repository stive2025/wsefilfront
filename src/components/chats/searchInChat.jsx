/* eslint-disable react/prop-types */
import { X, Search, Calendar, Download, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SearchInChatClick, ChatInterfaceClick } from "@/contexts/chats.js";
import { useContext, useState } from "react";
import Resize from "@/hooks/responsiveHook.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
import { searchChat, downloadChat } from "@/services/chats.js";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { useTheme } from "@/contexts/themeContext";

const SearchInChat = () => {
    const { setSearchInChat } = useContext(SearchInChatClick);
    const isMobile = Resize();
    const { selectedChatId } = useContext(ChatInterfaceClick);
    const [searchText, setSearchText] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const { callEndpoint } = useFetchAndLoad();
    const { theme } = useTheme();

    const variants = {
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 }
    };

    const formatDateForAPI = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Build query parameters for API calls
    const buildQueryParams = () => {
        const params = new URLSearchParams();

        if (startDate) params.append("start_date", formatDateForAPI(startDate));
        if (endDate) params.append("end_date", formatDateForAPI(endDate));
        if (searchText) params.append("body", searchText);

        return params.toString();
    };

    // Build request body for search API
    const buildRequestBody = () => {
        return {
            start_date: formatDateForAPI(startDate) || "",
            end_date: formatDateForAPI(endDate) || "",
            body: searchText || "",
            download: false,
        };
    };

    // Function to handle search
    const handleSearch = async () => {
        if (!selectedChatId || !selectedChatId.id) {
            console.error("No chat selected");
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            const userData = JSON.parse(Cookies.get("userData") || "{}");
            const userId = userData.id;

            if (!userId) {
                console.error("No user ID found");
                return;
            }

            const requestBody = buildRequestBody();
            // Call search API and update search results
            const response = await callEndpoint(searchChat(selectedChatId.id, requestBody));

            // Assuming the response has a data property with the search results
            if (response) {
                setSearchResults(response);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error searching messages:", error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Separate function to handle download
    const handleDownload = async () => {
        if (!selectedChatId || !selectedChatId.id) {
            console.error("No chat selected");
            return;
        }

        setIsLoading(true);

        try {
            // Construir la URL con todos los parámetros de búsqueda
            const baseUrl = `${selectedChatId.id}`;
            const params = buildQueryParams();
            const fullUrl = `${baseUrl}?${params}`;

            // Llamar al endpoint de descarga
            const response = await callEndpoint(downloadChat(fullUrl));

            // Verificar que tenemos una respuesta
            if (!response) {
                throw new Error('No se recibió respuesta del servidor');
            }

            // Crear una URL del blob
            const url = window.URL.createObjectURL(response);

            // Generar un nombre descriptivo para el archivo
            const today = new Date().toISOString().split('T')[0];
            const fileName = `chat_history_${selectedChatId.id}_${today}.pdf`;

            // Crear un elemento <a> para la descarga
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);

            // Hacer click en el enlace para iniciar la descarga
            document.body.appendChild(link);
            link.click();

            // Limpiar después de la descarga
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error("Error downloading chat history:", error);
            // Notificar al usuario del error
            alert("Error al descargar el historial de chat. Por favor intente nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key press in search input
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const handleClear = () => {
        setSearchText('');
    };

    return (
        <motion.div
            className={`w-full mt-10 
                bg-[rgb(var(--color-bg-${theme}))] 
                text-[rgb(var(--color-text-primary-${theme}))] 
                rounded-b-lg overflow-y-auto scrollbar-hide 
                ${isMobile ? "mb-8 h-screen" : ""}`}
            initial={isMobile ? { y: "100%" } : "hidden"}
            animate={isMobile ? { y: 0 } : "visible"}
            exit={isMobile ? { y: " 100%" } : "exit"}
            variants={isMobile ? undefined : variants}
            transition={isMobile ? { duration: 0.5, ease: "easeOut" } : { duration: 0.5, ease: "easeOut" }}
        >
            <div>
                {/* Header */}
                <div className={`sticky top-0 w-full 
                    bg-[rgb(var(--color-bg-${theme}-secondary))] 
                    border-b border-[rgb(var(--color-text-secondary-${theme}))]
                    flex items-center z-10 p-2`}>
                    <span className="mr-2 text-xl font-bold cursor-pointer">
                        <button
                            className={`text-[rgb(var(--color-text-primary-${theme}))] 
                                cursor-pointer rounded-full p-2 
                                hover:bg-[rgb(var(--input-hover-bg-${theme}))]`}
                            onClick={() => setSearchInChat(prev => !prev)}>
                            <X size={20} />
                        </button>
                    </span>
                    <span className="text-sm">Buscar Mensajes</span>
                </div>
            </div>
            <div className={`p-2 bg-[rgb(var(--color-bg-${theme}))]`}>
                <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.SEARCH_MESSAGES]}>
                    <div className="relative flex items-center mb-2">
                        <input
                            type="text"
                            placeholder="Buscar"
                            className={`w-full bg-[rgb(var(--color-bg-${theme}-secondary))] 
      rounded-lg pl-8 pr-24 py-2  /* más padding right para los 3 botones */
      text-[rgb(var(--color-text-primary-${theme}))]
      placeholder-[rgb(var(--color-text-secondary-${theme}))]
      hover:bg-[rgb(var(--input-hover-bg-${theme}))]
      focus:border-[rgb(var(--input-focus-border-${theme}))]
      outline-none`}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <Search className={`absolute left-2 text-[rgb(var(--color-text-secondary-${theme}))]`} size={18} />

                        <div className="absolute right-2 flex items-center gap-2">
                            {searchText && (
                                <button
                                    onClick={handleClear}
                                    className={`p-1 rounded-full
          text-[rgb(var(--color-text-secondary-${theme}))]
          hover:bg-[rgb(var(--input-hover-bg-${theme}))]
          hover:text-[rgb(var(--color-primary-${theme}))]
          transition-colors duration-200`}
                                    title="Limpiar búsqueda"
                                >
                                    <span className="text-xl leading-none">&times;</span>
                                </button>
                            )}
                            <button
                                className={`text-[rgb(var(--color-text-primary-${theme}))] 
        cursor-pointer rounded-full p-1 
        hover:bg-[rgb(var(--input-hover-bg-${theme}))]`}
                                onClick={() => setShowDatePicker(!showDatePicker)}
                            >
                                <Calendar className={`text-[rgb(var(--color-text-secondary-${theme}))]`} size={18} />
                            </button>
                            <button
                                className={`text-[rgb(var(--color-text-primary-${theme}))] 
        cursor-pointer rounded-full p-1 
        hover:bg-[rgb(var(--input-hover-bg-${theme}))]`}
                                onClick={handleSearch}
                            >
                                <ArrowRight className={`text-[rgb(var(--color-text-secondary-${theme}))]`} size={18} />
                            </button>
                        </div>
                    </div>
                </AbilityGuard>
                {/* Date Range Picker */}
                <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.SEARCH_MESSAGES]}>

                    {showDatePicker && (
                        <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))] p-3 rounded-lg mb-3`}>
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex flex-col flex-1">
                                    <label className={`text-sm text-[rgb(var(--color-text-secondary-${theme}))] mb-1`}>Fecha inicial</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={date => setStartDate(date)}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        className={`w-full bg-[rgb(var(--color-bg-${theme}))] 
                                            rounded-lg px-3 py-2 
                                            text-[rgb(var(--color-text-primary-${theme}))]`}
                                        placeholderText="Seleccionar fecha inicial"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <label className={`text-sm text-[rgb(var(--color-text-secondary-${theme}))] mb-1`}>Fecha final</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={date => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        className={`w-full bg-[rgb(var(--color-bg-${theme}))] 
                                            rounded-lg px-3 py-2 
                                            text-[rgb(var(--color-text-primary-${theme}))]`}
                                        placeholderText="Seleccionar fecha final"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </AbilityGuard>
                {/* Search Results */}
                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 
                                border-[rgb(var(--color-primary-${theme}))]`}></div>
                        </div>
                    ) : hasSearched ? (
                        <>
                            {searchResults.length > 0 ? (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className={`text-sm text-[rgb(var(--color-text-secondary-${theme}))]`}>{searchResults.length} mensajes encontrados</p>
                                        <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.DOWNLOAD_HISTORY]}>
                                            <button
                                                className={`flex items-center gap-1 
                                                    bg-[rgb(var(--color-primary-${theme}))] 
                                                    hover:bg-[rgb(var(--color-secondary-${theme}))] 
                                                    text-[rgb(var(--color-text-primary-${theme}))] 
                                                    px-3 py-1 rounded-md text-sm`}
                                                onClick={handleDownload}
                                            >
                                                <Download size={14} /> Descargar
                                            </button>
                                        </AbilityGuard>
                                    </div>
                                    <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.SEARCH_MESSAGES]}>
                                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                            {searchResults.map((message, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-3 rounded-lg ${message.from_me === "true" ? 'bg-blue-800 ml-8' : 'bg-gray-800 mr-8'}`}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-medium text-gray-400">
                                                            {message.from_me === "true" ? 'Tú' : selectedChatId.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimestamp(message.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">{message.body}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </AbilityGuard>
                                </div>
                            ) : (
                                <div className={`text-center py-6 text-[rgb(var(--color-text-secondary-${theme}))]`}>
                                    No se encontraron mensajes que coincidan con tu búsqueda.
                                </div>
                            )}
                        </>
                    ) : (
                        <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.SEARCH_MESSAGES]} fallback={
                            <div className={`text-center py-6 text-[rgb(var(--color-text-secondary-${theme}))]`}>
                                No tienes permisos para buscar mensajes en este chat.
                            </div>
                        }>
                            <div className={`text-center py-6 text-[rgb(var(--color-text-secondary-${theme}))]`}>
                                Ingresa términos de búsqueda y/o selecciona un rango de fechas.
                            </div>
                        </AbilityGuard>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SearchInChat;