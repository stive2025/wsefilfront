/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/themeContext.jsx";

const ConectionMod = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };

    return (
        <form className="fixed inset-0 flex items-center justify-center z-20" 
              style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}>
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                className={`
                    p-5 rounded-lg shadow-lg w-96 relative z-10
                    ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light))]' : 'bg-[rgb(var(--color-bg-dark))]'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`
                    mx-auto p-4
                    ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light))]' : 'bg-[rgb(var(--color-bg-dark))]'}
                    ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                `}>
                    <div className={`
                        rounded-lg w-full space-y-4 h-max
                        ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light))]' : 'bg-[rgb(var(--color-bg-dark))]'}
                    `}>
                        <div className="flex justify-center rounded-lg">
                            <div className={`
                                text-center p-6 rounded-lg shadow-xl
                                ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light-secondary))]' : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
                            `}>
                                <h2 className="text-2xl mb-4">Inicia Sesión</h2>
                                <p className={`
                                    mb-6
                                    ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                                `}>
                                    No se pudo establecer conexión con el servidor. Por favor, conéctate.
                                </p>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className={`
                                        flex items-center gap-2 py-2 px-4 rounded transition-colors duration-200
                                        ${theme === 'light' 
                                            ? 'bg-[rgb(var(--color-secondary-light))]' 
                                            : 'bg-[rgb(var(--color-secondary-dark))]'}
                                        ${theme === 'light' 
                                            ? 'text-[rgb(var(--color-text-primary-light))]' 
                                            : 'text-[rgb(var(--color-text-primary-dark))]'}
                                        hover:opacity-80 font-bold
                                    `}
                                >
                                    <QrCode size={20} />
                                    Conectar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </form>
    );
};

export default ConectionMod;
