/* eslint-disable react/prop-types */
import { AnimatePresence, motion } from "framer-motion";
import ContactInfo from "/src/components/chats/contactInfo.jsx";
import { useState } from "react";
import { Info, StickyNote, SquareCheck } from "lucide-react";

const MenuInchat = ({ isOpen, onClose }) => {
    const [InfoOpen, setInfoOpen] = useState(false);

    const variants = {
        hidden: { opacity: 0, x: 50 }, 
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-transparent z-10" onClick={onClose}></div>
            <div className="absolute right-0 mt-2 w-15 rounded-lg shadow-lg z-20">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="fixed w-16 bg-transparent flex flex-col items-center py-4 shadow-lg mt-10"
                    onClick={onClose}
                >
                    <ul className="flex flex-col gap-6 flex-1 mr-10">
                        <li className="text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
                         onClick={() => setInfoOpen(prev => !prev)}>
                            <Info size={20} />
                        </li>
                        <li className="text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio">
                            <StickyNote size={20} />
                        </li>
                        <li className="text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio">
                            <SquareCheck size={20} />
                        </li>
                    </ul>
                </motion.div>
            </div>
            
            {/* Agregamos AnimatePresence para gestionar la animación de salida */}
            <AnimatePresence>
                {InfoOpen && <ContactInfo isOpen={InfoOpen} onClose={() => setInfoOpen(false)} />}  
            </AnimatePresence>
        </>
    );
};

export default MenuInchat;
