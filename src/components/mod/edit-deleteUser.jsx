/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import TagForm from "@/components/utilities/tagForm.jsx";
import CustomForm from "@/components/utilities/customForm.jsx";
import AutoForm from "@/components/utilities/autoMForm.jsx";
import NewContact from "@/components/contacts/newContact.jsx";
import NewAgent from "@/components/agents/newAgent.jsx";
import ProfileQR from "@/components/profile/profileQR.jsx";
import { useTheme } from "@/contexts/themeContext.jsx";

const Tagmod = ({ onClose, isOpen, option }) => {
    const { theme } = useTheme();

    const variants = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 }
    };

    if (!isOpen) return null;

    return (
        <form 
            className="fixed inset-0 flex items-center justify-center z-20" 
            style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
        >
            {/* Cierra el modal si se hace clic fuera */}
            <div className="absolute inset-0" onClick={onClose}></div>
            
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
                    {option === 1 ? <TagForm /> 
                    : option === 2 ? <CustomForm />
                    : option === 3 ? <AutoForm />
                    : option === 4 ? <NewContact /> 
                    : option === 5 ? <NewAgent /> 
                    : option === 6 ? <ProfileQR />
                    : null}
                </div>
            </motion.div>
        </form>
    );
};

export default Tagmod;
