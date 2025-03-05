/* eslint-disable react/prop-types */
import { X, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ContactInfoClick } from "/src/contexts/chats.js"
import { useContext } from "react";
import Resize from "/src/hooks/responsiveHook.jsx";

const ContactInfo = ({ contactId }) => {

    const contacts = [
        {
            id: 1,
            name: "José Sarmiento",
            phone: "+593 99 004 6508",
            state: "En linea",
            contactState: ":)",
            multimedia: [
                {id: "1", url:"https://static.inaturalist.org/photos/265916780/large.jpg"},
                {id: "2", url:"https://static.inaturalist.org/photos/265916780/large.jpg"},
                {id: "3", url:"https://static.inaturalist.org/photos/265916780/large.jpg"}
            ],
            creditoInfo: [
                { idcredit: "112244", garante: "Ximena Gonzaga", mont: "1200", payDate: "04/01/2025" }
            ]
        },
        {
            id: 2,
            name: "María López",
            phone: "+593 99 004 6510",
            state: "En linea",
            contactState: ":)",
            multimedia: [
                {id: "1", url:"https://static.inaturalist.org/photos/265916780/large.jpg"},
                {id: "2", url:"https://static.inaturalist.org/photos/265916780/large.jpg"},
                {id: "3", url:"https://static.inaturalist.org/photos/265916780/large.jpg"}
            ],
            creditoInfo: [
                { idcredit: "112243", garante: "Ximena Gonzaga", mont: "1200", payDate: "04/01/2025" }
            ]
        }, {
            id: 3,
            name: "Carlos Pérez",
            phone: "+593 99 004 6509",
            state: "En linea",
            contactState: ":)",
            multimedia: [
                {id: "1", url:"https://static.inaturalist.org/photos/265916780/large.jpg"},
                {id: "2", url:"https://static.inaturalist.org/photos/265916780/large.jpg"},
                {id: "3", url:"https://static.inaturalist.org/photos/265916780/large.jpg"}
            ],
            creditoInfo: [
                { idcredit: "1123244", garante: "Ximena Gonzaga", mont: "1200", payDate: "04/01/2025" }
            ]
        }
    ];
    const idContact = parseInt(contactId);
    const contactFind = (contacts.find(contact => contact.id === idContact));

    const { setInfoOpen } = useContext(ContactInfoClick);
    const isMobile = Resize();
    const variants = {
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 }
    };
    return (
        <motion.div
            className={`w-full mt-15 bg-gray-900 text-white rounded-b-lg overflow-y-auto scrollbar-hide pl-4 pr-4 ${isMobile ? "mb-8 h-screen" : ""}`}
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
                            src="/placeholder-profile.jpg"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-lg mb-1">{contactFind.name}</h2>
                    <p className="text-gray-400 text-sm mb-1">{contactFind.phone}</p>
                    <p className="text-green-500 text-sm">{contactFind.state}</p>
                </div>

                {/* Client Status */}
                <div className="py-3 bg-gray-800 text-gray-500 text-center text-sm">
                    {contactFind.contactState}
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
                <div className="p-4 flex gap-2 ">
                    {contactFind.multimedia.map((imgItem) => (
                        <img key={imgItem.id}
                            src={imgItem.url}
                            alt="Thumbnail"
                            className="w-20 h-16 rounded object-cover"
                        />
                    ))}
                </div>

                {/* Credit Info */}
                <div className="p-4">
                    <h3 className="mb-2 text-base">Info.Credito</h3>
                    <div className="text-gray-500 text-sm">
                        <p className="mb-1">Nro.</p>
                        <p className="mb-1">{contactFind.creditoInfo[0].idcredit}.</p>
                        <p className="mb-1">Garante:</p>
                        <p className="mb-1">{contactFind.creditoInfo[0].garante}.</p>
                        <p className="mb-1">Monto:</p>
                        <p className="mb-1">{contactFind.creditoInfo[0].mont}.</p>
                        <p className="mb-1">Fecha:</p>
                        <p className="mb-1">{contactFind.creditoInfo[0].payDate}.</p>
                    </div>
                </div>
            </div>
        </motion.div>

    );
};
export default ContactInfo;
