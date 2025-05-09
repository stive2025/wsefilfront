/* eslint-disable react/prop-types */
import { QrCode, Sun, Moon } from "lucide-react";
import Resize from "@/hooks/responsiveHook.jsx";
import { ProfileInfoPanel } from "@/contexts/chats.js";
import { useContext, useEffect, useState } from "react";
import { GetCookieItem } from "@/utilities/cookies.js";
import { useTheme } from "@/contexts/themeContext.jsx";

const ProfileInfo = () => {
    const { SetProfileInfoOpen } = useContext(ProfileInfoPanel);
    const { theme, toggleTheme } = useTheme();
    const isMobile = Resize();
    const rawProfile = GetCookieItem("userData");
    const infoProfile = JSON.parse(rawProfile);
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        console.log("infoProfile", infoProfile);
    }, [infoProfile]);

    return (
        <div className={`
            flex flex-col mt-10 ${isMobile ? '' : 'ml-4'}
            ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light))]' : 'bg-[rgb(var(--color-bg-dark))]'}
        `}>
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between">
                <span className={`
                    text-xl font-bold mx-auto
                    ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                `}>
                    Perfil
                </span>
            </div>

            {/* Profile Section */}
            <div className="flex justify-center">
                <div className="flex flex-col md:flex-row items-center md:items-start p-5 md:space-y-0 md:space-x-6">
                    {/* Profile Image */}
                    <div className={`
                        w-60 h-60 rounded-full overflow-hidden
                        ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light-secondary))]' : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
                    `}>
                        <img
                            src={infoProfile?.profilePicture || "https://cdn-icons-png.flaticon.com/512/780/780259.png"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Profile Info */}
                    <div className="flex flex-col items-center md:items-start space-y-3">
                        <h2 className={`
                            text-xl font-bold
                            ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                        `}>
                            {infoProfile.name}
                        </h2>
                        <p className={`
                            ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                        `}>
                            {infoProfile.email}
                        </p>
                        <p className={`
                            ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                        `}>
                            {infoProfile.role}
                        </p>

                        {/* Theme Toggle Button */}
                        <button 
                            onClick={toggleTheme}
                            className={`
                                flex items-center gap-2 rounded-full p-2 transition-colors duration-200
                                ${theme === 'light' ? 'bg-[rgb(var(--color-primary-light))]' : 'bg-[rgb(var(--color-primary-dark))]'}
                                ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                                hover:opacity-80
                            `}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                        </button>

                        {/* QR Code Button */}
                        <button 
                            onClick={() => SetProfileInfoOpen(prev => !prev)}
                            className={`
                                rounded-full p-2 mb-3 transition-colors duration-200
                                ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                                hover:text-[rgb(var(--color-primary-${theme}))]
                            `}
                        >
                            <label className="flex items-center gap-2 cursor-pointer">
                                <QrCode size={20} />
                                Scanea el código QR
                            </label>
                        </button>

                        {/* Change Password Button */}
                        <button
                            onClick={() => setShowChangePassword(true)}
                            className={`
                                py-2 px-4 rounded transition-colors duration-200
                                ${theme === 'light' ? 'bg-[rgb(var(--color-secondary-light))]' : 'bg-[rgb(var(--color-secondary-dark))]'}
                                ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                                hover:opacity-80 font-bold
                            `}
                        >
                            Cambiar Contraseña
                        </button>

                        {/* Password Change Form */}
                        {showChangePassword && (
                            <div className={`
                                mt-4 p-4 rounded-lg w-full max-w-xs mb-15
                                ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light-secondary))]' : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
                            `}>
                                <input
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    className={`
                                        w-full p-2 mb-2 rounded-lg
                                        ${theme === 'light' 
                                            ? 'bg-[rgb(var(--color-bg-light))] text-[rgb(var(--color-text-primary-light))]' 
                                            : 'bg-[rgb(var(--color-bg-dark))] text-[rgb(var(--color-text-primary-dark))]'}
                                    `}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirmar contraseña"
                                    className={`
                                        w-full p-2 mb-2 rounded-lg
                                        ${theme === 'light' 
                                            ? 'bg-[rgb(var(--color-bg-light))] text-[rgb(var(--color-text-primary-light))]' 
                                            : 'bg-[rgb(var(--color-bg-dark))] text-[rgb(var(--color-text-primary-dark))]'}
                                    `}
                                />
                                <div className="flex justify-between">
                                    <button className={`
                                        p-2 rounded-lg transition-colors duration-200
                                        ${theme === 'light' ? 'bg-[rgb(var(--color-primary-light))]' : 'bg-[rgb(var(--color-primary-dark))]'}
                                        ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                                        hover:opacity-80
                                    `}>
                                        Guardar
                                    </button>
                                    <button 
                                        onClick={() => setShowChangePassword(false)}
                                        className={`
                                            p-2 rounded-lg transition-colors duration-200
                                            ${theme === 'light' ? 'bg-[rgb(var(--color-secondary-light))]' : 'bg-[rgb(var(--color-secondary-dark))]'}
                                            ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                                            hover:opacity-80
                                        `}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
