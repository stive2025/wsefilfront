/* eslint-disable react/prop-types */
import { X, Search, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { SearchInChatClick } from "/src/contexts/chats.js"
import { useContext } from "react";
import Resize from "/src/hooks/responsiveHook.jsx";
import "react-datepicker/dist/react-datepicker.css";


const SearchInChat = () => {
    const { setSearchInChat } = useContext(SearchInChatClick);
    const isMobile = Resize();
    const variants = {
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 }
    };

    return (
        <motion.div
            className={`w-full mt-10 bg-gray-900 text-white rounded-b-lg overflow-y-auto scrollbar-hide ${isMobile ? "mb-8 h-screen" : ""}`}
            initial={isMobile ? { y: "100%" } : "hidden"} // Comienza desde abajo en móvil
            animate={isMobile ? { y: 0 } : "visible"} // Se mueve hacia arriba en móvil
            exit={isMobile ? { y: " 100%" } : "exit"} // Vuelve a salir hacia abajo en móvil
            variants={isMobile ? undefined : variants} // Usa las variantes solo si no es móvil
            transition={isMobile ? { duration: 0.5, ease: "easeOut" } : { duration: 0.5, ease: "easeOut" }} // Suaviza la animación en ambos casos
        >
            <div>
                {/* Header */}
                <div className="sticky w-full bg-gray-900 flex items-center z-5">
                    <span className="mr-2 text-xl font-bold cursor-pointer">
                        <button className="text-white cursor-pointer rounded-full p-2 hover:bg-gray-700" onClick={() => { setSearchInChat(prev => !prev) }
                        }><X size={20} /></button>
                    </span>
                    <span className="text-sm">Buscar Mensajes</span>
                </div>
            </div>
            <div className="p-2 bg-gray-900">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder="Buscar"
                        className="w-full bg-gray-800 rounded-lg pl-8 pr-2 py-1 text-white placeholder-gray-400"
                    />
                    <Search className="absolute left-1 text-gray-400" size={18} />
                    <div className="relative">
                        <label htmlFor="date" className="text-white cursor-pointer rounded-full p-1 hover:bg-gray-700">
                            <Calendar className="text-gray-400" size={18} />
                        </label>
                        <input
                            type="date"
                            id="date"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
export default SearchInChat;
