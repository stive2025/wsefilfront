/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { Info, StickyNote, SquareCheck } from "lucide-react";
import { useContext } from "react";
import { ContactInfoClick, TagClick, ResolveClick } from "/src/contexts/chats.js"


const MenuInchat = ({ onClose, isOpen }) => {
    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };

    const { setInfoOpen } = useContext(ContactInfoClick);
    const { setTagClick } = useContext(TagClick);
    const { setResolveClick } = useContext(ResolveClick);

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
                        <li key="Info" className="text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
                            onClick={() => { setInfoOpen(prev => !prev) }
                            }
                        >
                            <Info size={20} />
                        </li>
                        <li key="target" className="text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
                         onClick={() => { setTagClick(prev => !prev) }}
                         >
                            <StickyNote size={20} />
                        </li>
                        <li key="Finish" className="text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio">
                            <SquareCheck size={20} 
                            onClick={() => { setResolveClick(prev => !prev) }}
                            />
                        </li>
                    </ul>
                </motion.div>
            </div>
        </>
    );
};

export default MenuInchat;