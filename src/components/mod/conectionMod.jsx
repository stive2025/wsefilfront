/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConectionMod = () => {
    const navigate = useNavigate();

    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };
    return (
        <form className=" fixed inset-0 flex items-center justify-center z-20" style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}>
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                className="bg-gray-900 p-5 rounded-lg shadow-lg w-96 relative z-10"
                onClick={(e) => e.stopPropagation()} //mas abajito reemplazar por el backend linea 38 (chatId)
            >
                <div className="mx-auto p-4 bg-gray-900 text-white">
                    <div className={`bg-gray-900 rounded-lg w-full space-y-4 h-max`}>
                        <div className="flex justify-center rounded-lg">
                            <div className="text-center p-6  rounded-lg shadow-xl">
                                <h2 className="text-2xl mb-4">Inicia  Sesión</h2>
                                <p className="mb-6">No se pudo establecer conexión con el servidor. Por favor, conéctate.</p>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="bg-naranja-base hover:bg-naranja-medio text-white font-bold py-2 px-4 rounded transition duration-300"
                                >
                                    <label className="flex items-center gap-2">
                                        <QrCode size={20} />
                                        Conectar
                                    </label>
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
