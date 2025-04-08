/* eslint-disable react/prop-types */
import { X, Search, Calendar, Download, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SearchInChatClick, ChatInterfaceClick } from "/src/contexts/chats.js";
import { useContext, useState } from "react";
import Resize from "/src/hooks/responsiveHook.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
import CustomFetch from "/src/services/apiService.js";

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

    const executeSearch = async (download = false) => {
        setIsLoading(true);
        setHasSearched(true);

        try {
            const userData = JSON.parse(Cookies.get("userData") || "{}");

            const userId = userData.id;

            if (!userId) {
                console.error("No user ID found");
                return;
            }

            // Build the request body with the correct structure
            const requestBody = {
                start_date: formatDateForAPI(startDate) || "",
                end_date: formatDateForAPI(endDate) || "",
                body: searchText || "",
                download: download
            };
            const endpoint = `chats/search/${selectedChatId.id}`;

            const response = await CustomFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });
            // Handle download if requested
            if (download && response.download) {
                window.open(response.download, '_blank');
                return;
            }
            setSearchResults(response || []);
        } catch (error) {
            console.error("Error searching messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => executeSearch(false);
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };
    const downloadChatHistory = () => executeSearch(true);

    // Handle Enter key press in search input
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <motion.div
            className={`w-full mt-10 bg-gray-900 text-white rounded-b-lg overflow-y-auto scrollbar-hide ${isMobile ? "mb-8 h-screen" : ""}`}
            initial={isMobile ? { y: "100%" } : "hidden"}
            animate={isMobile ? { y: 0 } : "visible"}
            exit={isMobile ? { y: " 100%" } : "exit"}
            variants={isMobile ? undefined : variants}
            transition={isMobile ? { duration: 0.5, ease: "easeOut" } : { duration: 0.5, ease: "easeOut" }}
        >
            <div>
                {/* Header */}
                <div className="sticky top-0 w-full bg-gray-900 flex items-center z-10 p-2 border-b border-gray-800">
                    <span className="mr-2 text-xl font-bold cursor-pointer">
                        <button className="text-white cursor-pointer rounded-full p-2 hover:bg-gray-700" onClick={() => { setSearchInChat(prev => !prev) }
                        }><X size={20} /></button>
                    </span>
                    <span className="text-sm">Buscar Mensajes</span>
                </div>
            </div>
            <div className="p-2 bg-gray-900">
                <div className="relative flex items-center mb-2">
                    <input
                        type="text"
                        placeholder="Buscar"
                        className="w-full bg-gray-800 rounded-lg pl-8 pr-10 py-2 text-white placeholder-gray-400"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <Search className="absolute left-2 text-gray-400" size={18} />
                    <div className="absolute right-2 flex items-center gap-2">
                        <button
                            className="text-white cursor-pointer rounded-full p-1 hover:bg-gray-700"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            <Calendar className="text-gray-400" size={18} />
                        </button>
                        <button
                            className="text-white cursor-pointer rounded-full p-1 hover:bg-gray-700"
                            onClick={handleSearch}
                        >
                            <ArrowRight className="text-gray-400" size={18} />
                        </button>
                    </div>
                </div>

                {/* Date Range Picker */}
                {showDatePicker && (
                    <div className="bg-gray-800 p-3 rounded-lg mb-3">
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="flex flex-col flex-1">
                                <label className="text-sm text-gray-400 mb-1">Fecha inicial</label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={date => setStartDate(date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    className="w-full bg-gray-900 rounded-lg px-3 py-2 text-white"
                                    placeholderText="Seleccionar fecha inicial"
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="text-sm text-gray-400 mb-1">Fecha final</label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={date => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    className="w-full bg-gray-900 rounded-lg px-3 py-2 text-white"
                                    placeholderText="Seleccionar fecha final"
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Results */}
                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : hasSearched ? (
                        <>
                            {searchResults.length > 0 ? (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm text-gray-400">{searchResults.length} mensajes encontrados</p>
                                        <button
                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                                            onClick={downloadChatHistory}
                                        >
                                            <Download size={14} /> Descargar
                                        </button>
                                    </div>
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                        {searchResults.map((message, index) => (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-lg ${message.from_me === "true" ? 'bg-blue-800 ml-8' : 'bg-gray-800 mr-8'}`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-gray-400">
                                                        {message.from_me === "true" ? 'Tú' : 'Contacto'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTimestamp(message.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm">{message.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400">
                                    No se encontraron mensajes que coincidan con tu búsqueda.
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </motion.div>
    );
};

export default SearchInChat;