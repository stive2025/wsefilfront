/* eslint-disable react/prop-types */
import { X, ChevronRight, Phone, Mail, MapPin, Briefcase, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { ContactInfoClick, ChatInterfaceClick } from "@/contexts/chats.js"
import { useContext, useEffect, useState } from "react";
import Resize from "@/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { getContact } from "@/services/contacts.js";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { useTheme } from "@/contexts/themeContext";

const ContactInfo = () => {
    const { selectedChatId } = useContext(ChatInterfaceClick);
    const { infoOpen, setInfoOpen } = useContext(ContactInfoClick);
    const [contactFind, setContactFind] = useState({});
    const { callEndpoint } = useFetchAndLoad();
    const [isLoading, setIsLoading] = useState(true);
    const isMobile = Resize();
    const { theme } = useTheme();

    useEffect(() => {
        // Only fetch when the modal is open AND we have a contact ID AND user has permission
        console.log("informacion del chat", selectedChatId);
        if (infoOpen && selectedChatId?.idContact) {
            setIsLoading(true);
            const fetchContact = async () => {
                try {
                    const contactCall = getContact(selectedChatId.idContact);
                    const response = await callEndpoint(contactCall);
                    setContactFind(response);
                } catch (error) {
                    if (error.name !== "AbortError") {
                        console.error("Error buscando contacto:", error);
                    }
                } finally {
                    setIsLoading(false);
                }
            };

            fetchContact();
        }

        // Reset contact data when modal closes
        if (!infoOpen) {
            setContactFind({});
        }
    }, [infoOpen]);

    useEffect(() => {
        const currentChatId = selectedChatId?.idContact;
        if (infoOpen && currentChatId !== undefined) {
            const lastChatId = JSON.parse(sessionStorage.getItem('lastChatId'));
            if (lastChatId !== currentChatId) {
                setInfoOpen(false);
                sessionStorage.setItem('lastChatId', JSON.stringify(currentChatId));
            }
        }
    }, [selectedChatId])


    const variants = {
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No disponible";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.VIEW_CONTACT_INFO]} fallback={
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
                    <div className={`sticky top-0 w-full 
                        bg-[rgb(var(--color-bg-${theme}-secondary))] 
                        border-b border-[rgb(var(--color-text-secondary-${theme}))]
                        flex items-center z-10 p-2`}>
                        <span className="mr-2 text-xl font-bold cursor-pointer">
                            <button
                                className={`text-[rgb(var(--color-text-primary-${theme}))] 
                                    cursor-pointer rounded-full p-2 
                                    hover:bg-[rgb(var(--input-hover-bg-${theme}))]`}
                                onClick={() => { setInfoOpen(false) }}>
                                <X size={20} />
                            </button>
                        </span>
                        <span className="text-sm">Info. del Contacto</span>
                    </div>
                    <div className={`p-4 text-center text-[rgb(var(--color-text-secondary-${theme}))]`}>
                        No tienes permisos para ver la información de contacto.
                    </div>
                </div>
            </motion.div>
        }>
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
                            <button className={`text-[rgb(var(--color-text-primary-${theme}))] 
                                    cursor-pointer rounded-full p-2 
                                    hover:bg-[rgb(var(--input-hover-bg-${theme}))]`}
                                onClick={() => { setInfoOpen(false) }}>
                                <X size={20} />
                            </button>
                        </span>
                        <span className="text-sm">Info. del Contacto</span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 
                                border-[rgb(var(--color-primary-${theme}))]`}></div>
                        </div>
                    ) : (
                        <div className={`p-2 bg-[rgb(var(--color-bg-${theme}))]`}>
                            {/* Profile Section */}
                            <div className={`p-5 flex flex-col items-center 
                                bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg mb-3`}>
                                <div className={`w-20 h-20 rounded-full overflow-hidden 
                                    bg-[rgb(var(--color-bg-${theme}))] mb-3`}>
                                    <img
                                        src={contactFind.profile_picture || "https://via.placeholder.com/150"}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h2 className="text-lg font-medium mb-1">{contactFind.name || "Sin nombre"}</h2>
                                <p className={`text-[rgb(var(--color-text-secondary-${theme}))] text-sm mb-2`}>
                                    {contactFind.phone_number || "Sin número"}
                                </p>

                                {/* Quick Actions */}
                                <div className="flex gap-3 mt-2">
                                    <button className={`bg-[rgb(var(--color-primary-${theme}))] 
                                        hover:bg-[rgb(var(--color-secondary-${theme}))] 
                                        text-[rgb(var(--color-text-primary-${theme}))] p-2 rounded-full`}>
                                        <Phone size={16} />
                                    </button>
                                    <button className={`bg-[rgb(var(--color-primary-${theme}))] 
                                        hover:bg-[rgb(var(--color-secondary-${theme}))] 
                                        text-[rgb(var(--color-text-primary-${theme}))] p-2 rounded-full`}>
                                        <Mail size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Contact Details Section */}
                            <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg mb-3`}>
                                <h3 className={`px-4 py-3 border-b 
                                    border-[rgb(var(--color-text-secondary-${theme}))] font-medium`}>
                                    Detalles de Contacto
                                </h3>

                                <div className="p-3">
                                    <div className="flex items-start mb-3">
                                        <Phone size={16} className={`text-[rgb(var(--color-text-secondary-${theme}))] mr-3 mt-1`} />
                                        <div>
                                            <p className={`text-sm text-[rgb(var(--color-text-secondary-${theme}))]`}>Teléfono</p>
                                            <p>{contactFind.phone_number || "No disponible"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start mb-3">
                                        <Mail size={16} className={`text-[rgb(var(--color-text-secondary-${theme}))] mr-3 mt-1`} />
                                        <div>
                                            <p className={`text-sm text-[rgb(var(--color-text-secondary-${theme}))]`}>Email</p>
                                            <p>{contactFind.email || "No disponible"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start mb-3">
                                        <MapPin size={16} className={`text-[rgb(var(--color-text-secondary-${theme}))] mr-3 mt-1`} />
                                        <div>
                                            <p className={`text-sm text-[rgb(var(--color-text-secondary-${theme}))]`}>Dirección</p>
                                            <p>{contactFind.address || "No disponible"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start mb-3">
                                        <Briefcase size={16} className={`text-[rgb(var(--color-text-secondary-${theme}))] mr-3 mt-1`} />
                                        <div>
                                            <p className={`text-sm text-[rgb(var(--color-text-secondary-${theme}))]`}>Empresa</p>
                                            <p>{contactFind.company || "No disponible"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Calendar size={16} className={`text-[rgb(var(--color-text-secondary-${theme}))] mr-3 mt-1`} />
                                        <div>
                                            <p className={`text-sm text-[rgb(var(--color-text-secondary-${theme}))]`}>Cliente desde</p>
                                            <p>{contactFind.created_at ? formatDate(contactFind.created_at) : "No disponible"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Files Section */}
                            <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg mb-3`}>
                                <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                                    <span className="font-medium">Archivos, enlaces y documentos</span>
                                    <button className="flex items-center text-gray-400 hover:text-white">
                                        <span className="text-sm mr-1">{contactFind.multimedia?.length || 0}</span>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                {contactFind.multimedia && contactFind.multimedia.length > 0 ? (
                                    <div className="p-3 flex flex-wrap gap-2">
                                        {contactFind.multimedia.slice(0, 4).map((imgItem, index) => (
                                            <img key={imgItem.id || index}
                                                src={imgItem.url}
                                                alt="Thumbnail"
                                                className="w-20 h-16 rounded object-cover"
                                            />
                                        ))}
                                        {contactFind.multimedia.length > 4 && (
                                            <div className="w-20 h-16 rounded bg-gray-700 flex items-center justify-center">
                                                <span className="text-white">+{contactFind.multimedia.length - 4}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        No hay archivos compartidos
                                    </div>
                                )}
                            </div>

                            {/* Credit Info Section */}
                            <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg`}>
                                <h3 className="px-4 py-3 border-b border-gray-700 font-medium">Información de Crédito</h3>

                                {contactFind.creditoInfo && contactFind.creditoInfo.length > 0 ? (
                                    <div className="p-3">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-400">Nro. Crédito:</span>
                                            <span>{contactFind.creditoInfo[0].idcredit || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-400">Garante:</span>
                                            <span>{contactFind.creditoInfo[0].garante || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-400">Monto:</span>
                                            <span>{contactFind.creditoInfo[0].mont || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-400">Fecha de pago:</span>
                                            <span>{contactFind.creditoInfo[0].payDate || "N/A"}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        No hay información de crédito disponible
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AbilityGuard>
    );
};

export default ContactInfo;