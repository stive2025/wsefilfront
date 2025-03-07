/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import TagForm from "/src/components/utilities/tagForm.jsx";
import CustomForm from "/src/components/utilities/customForm.jsx";
import AutoForm from "/src/components/utilities/autoMForm.jsx";
import NewContact from "/src/components/contacts/newContact.jsx";


const Tagmod = ({ onClose, isOpen, option }) => {

    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };
    if (!isOpen) return null;
    return (
        <form className=" fixed inset-0 flex items-center justify-center z-20" style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}>
            {/* Cierra el modal si se hace clic fuera */}
            <div className="absolute inset-0" onClick={onClose}></div>
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                className="bg-gray-900 p-5 rounded-lg shadow-lg w-96 relative z-10"
                onClick={(e) => e.stopPropagation()} //mas abajito reemplazar por el backend linea 38 (chatId)
            >
                <div className="mx-auto p-4 bg-gray-900 text-white">
                {option === 1 ? <TagForm /> : option === 2 ? <CustomForm /> : option === 3 ? <AutoForm />:  option === 4 ? <NewContact /> : null}
                </div>

            </motion.div>
        </form>
    );
};

export default Tagmod;
