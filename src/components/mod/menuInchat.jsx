import { motion } from "framer-motion";
import { Info, StickyNote, SquareCheck } from "lucide-react";

const MenuInchat = () => {
    const menuOptions = [
        { icon: <Info />, label: "Información" },
        { icon: <StickyNote />, label: "Etiquetar" },
        { icon: <SquareCheck />, label: "Finalizar Chat" }
    ];

    return (
        <motion.div 
            initial={{ x: -100, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -100, opacity: 0 }}
            className="fixed w-16 bg-transparent flex flex-col items-center py-4 shadow-lg mt-10"
        >
            <ul className="flex flex-col gap-6 flex-1 mr-10">
                {menuOptions.map((item, index) => (
                    <li key={index} className="text-white hover:text-white cursor-pointer active:bg-gray-700 rounded-full p-2 bg-red-400">
                        {item.icon}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

export default MenuInchat;