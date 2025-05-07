/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { Info, StickyNote, SquareCheck } from "lucide-react";
import { useContext } from "react";
import { ContactInfoClick, TagClick, ResolveClick } from "@/contexts/chats.js"
import { useTheme } from "@/contexts/themeContext.jsx";

const MenuInchat = ({ onClose, isOpen }) => {
    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };

    const { setInfoOpen } = useContext(ContactInfoClick);
    const { setTagClick } = useContext(TagClick);
    const { setResolveClick } = useContext(ResolveClick);
    const { theme } = useTheme();

    if (!isOpen) return null; 

    const MenuButton = ({ icon: Icon, onClick }) => (
        <li 
            className={`
                cursor-pointer rounded-full p-2 transition-colors duration-200
                ${theme === 'light' 
                    ? 'bg-[rgb(var(--color-secondary-light))]' 
                    : 'bg-[rgb(var(--color-secondary-dark))]'}
                hover:opacity-80
                ${theme === 'light' 
                    ? 'text-[rgb(var(--color-text-primary-light))]' 
                    : 'text-[rgb(var(--color-text-primary-dark))]'}
            `}
            onClick={onClick}
        >
            <Icon size={20} />
        </li>
    );

    return (
        <>
            <div className="fixed inset-0 bg-transparent z-10" onClick={onClose}></div>
            <div className="absolute right-0 mt-2 w-15 rounded-lg shadow-lg z-20">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className={`
                        fixed w-16 flex flex-col items-center py-4  mt-10
                    `}
                    onClick={onClose}
                >
                    <ul className="flex flex-col gap-6 flex-1 mr-10">
                        <MenuButton 
                            icon={Info} 
                            onClick={() => setInfoOpen(prev => !prev)} 
                        />
                        <MenuButton 
                            icon={StickyNote} 
                            onClick={() => setTagClick(prev => !prev)} 
                        />
                        <MenuButton 
                            icon={SquareCheck} 
                            onClick={() => setResolveClick(prev => !prev)} 
                        />
                    </ul>
                </motion.div>
            </div>
        </>
    );
};

export default MenuInchat;