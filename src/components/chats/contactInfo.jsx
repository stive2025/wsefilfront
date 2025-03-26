/* eslint-disable react/prop-types */
import { X, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ContactInfoClick, ChatInterfaceClick } from "/src/contexts/chats.js"
import { useContext, useEffect, useState } from "react";
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { getContact } from "/src/services/contacts.js";

const ContactInfo = () => {
    const { selectedChatId } = useContext(ChatInterfaceClick);
    const [contactFind, setContactFind] = useState({});
    const { callEndpoint } = useFetchAndLoad();

    useEffect(() => {
        const fetchContact = async () => {
          try {
            const contactCall = getContact(selectedChatId.idContact);
            const response = await callEndpoint(contactCall);
            setContactFind(response);
            console.log("Contacto encontrado:", response);
          } catch (error) {
            if (error.name !== "AbortError") {
              console.error("Error buscando contacto:", error);
            }
          }
        };
      
        fetchContact();
      }, [ContactInfoClick]); // Se ejecutará cada vez que `ContactInfoClick` cambie
      
    const { setInfoOpen } = useContext(ContactInfoClick);
    const isMobile = Resize();
    const variants = {
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 }
    };
    return (
        <motion.div
            className={`w-full mt-9 bg-gray-900 text-white rounded-b-lg overflow-y-auto scrollbar-hide pl-4 pr-4 ${isMobile ? "mb-8 h-screen" : ""}`}
            initial={isMobile ? { y: "100%" } : "hidden"} // Comienza desde abajo en móvil
            animate={isMobile ? { y: 0 } : "visible"} // Se mueve hacia arriba en móvil
            exit={isMobile ? { y: " 100%" } : "exit"} // Vuelve a salir hacia abajo en móvil
            variants={isMobile ? undefined : variants} // Usa las variantes solo si no es móvil
            transition={isMobile ? { duration: 0.5, ease: "easeOut" } : { duration: 0.5, ease: "easeOut" }} // Suaviza la animación en ambos casos
        >
            <div>
                {/* Header */}
                <div className="sticky top-0 left-0 w-full bg-gray-900 px-4 py-3 flex items-center z-5">
                    <span className="mr-2 text-xl font-bold cursor-pointer">
                        <button className="text-white cursor-pointer rounded-full p-2 hover:bg-gray-700" onClick={() => { setInfoOpen(prev => !prev) }
                        }><X size={20} /></button>
                    </span>
                    <span className="text-sm">Info. del Contacto</span>
                </div>

                {/* Profile Section */}
                <div className="p-5 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 mb-3">
                        <img
                            src={contactFind.profile_picture || "https://via.placeholder.com/150"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-lg mb-1">{contactFind.name}</h2>
                    <p className="text-gray-400 text-sm mb-1">{contactFind.phone_number}</p>
                </div>

                {/* Client Status */}
                <div className="py-3 bg-gray-800 text-gray-500 text-center text-sm">
                   {/*{contactFind.contactState}  */} 
                </div>

                {/* Files Section */}
                <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Archivos, enlaces y documentos</span>
                    <div>
                        <span className="text-gray-400 text-sm">563</span>
                        <span className="text-gray-400 text-sm">
                            <button><ChevronRight size={20} /></button>
                        </span>
                    </div>
                </div>

                {/* Thumbnails */}
{/*                 <div className="p-4 flex gap-2 ">
                    {contactFind.multimedia.map((imgItem) => (
                        <img key={imgItem.id}
                            src={imgItem.url}
                            alt="Thumbnail"
                            className="w-20 h-16 rounded object-cover"
                        />
                    ))}
                </div> */}

                {/* Credit Info */}
                <div className="p-4">
                    <h3 className="mb-2 text-base">Info.Credito</h3>
                   {/*  <div className="text-gray-500 text-sm">
                        <p className="mb-1">Nro.</p>
                        <p className="mb-1">{contactFind.creditoInfo[0].idcredit}.</p>
                        <p className="mb-1">Garante:</p>
                        <p className="mb-1">{contactFind.creditoInfo[0].garante}.</p>
                        <p className="mb-1">Monto:</p>
                        <p className="mb-1">{contactFind.creditoInfo[0].mont}.</p>
                        <p className="mb-1">Fecha:</p>
                        <p className="mb-1">{contactFind.creditoInfo[0].payDate}.</p>
                    </div> */}
                </div>
            </div>
        </motion.div>

    );
};
export default ContactInfo;
