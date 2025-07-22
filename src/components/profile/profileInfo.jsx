/* eslint-disable react/prop-types */
import { QrCode, Sun, Moon } from "lucide-react";
import Resize from "@/hooks/responsiveHook.jsx";
import { ProfileInfoPanel } from "@/contexts/chats.js";
import { useContext, useEffect, useState } from "react";
import { GetCookieItem } from "@/utilities/cookies.js";
import { useTheme } from "@/contexts/themeContext.jsx";
import { updateAgent } from "@/services/agents.js";
import toast from "react-hot-toast";

const ProfileInfo = () => {
    const { SetProfileInfoOpen } = useContext(ProfileInfoPanel);
    const { theme, toggleTheme } = useTheme();
    const isMobile = Resize();
    const rawProfile = GetCookieItem("userData");
    const infoProfile = JSON.parse(rawProfile);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [, setPasswordError] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isPasswordMatch, setIsPasswordMatch] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
    });

    const resetPasswordRequirements = () => {
        setPasswordRequirements({
            length: false,
            lowercase: false,
            uppercase: false,
            number: false,
            special: false
        });
    };

    // useEffect(() => {
    //     console.log("infoProfile", infoProfile);
    // }, [infoProfile]);

    const handleChangePassword = async (newPassword) => {
        try {
            const { call } = await updateAgent(infoProfile.id, { password: newPassword });

            const result = await call; // Aquí obtienes el objeto real con status, message, data, etc.

            if (result?.status === 200) {
                toast.success("Contraseña actualizada con éxito");
            } else {
                toast.error("Error al actualizar la contraseña");
            }
        } catch (error) {
            console.error("Error al actualizar la contraseña:", error);
        }
    }

    const checkPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
        return regex.test(password);
    }

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);

        if (!value) {
            resetPasswordRequirements();
            return;
        }

        // Actualizar requisitos
        setPasswordRequirements({
            length: value.length >= 8,
            lowercase: /[a-z]/.test(value),
            uppercase: /[A-Z]/.test(value),
            number: /\d/.test(value),
            special: /[^a-zA-Z\d]/.test(value)
        });

        setIsPasswordValid(checkPassword(value));
        setIsPasswordMatch(value === confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setIsPasswordMatch(newPassword === value);
    };

    const handleSubmit = async () => {
        if (!isPasswordValid) {
            toast.error('La contraseña no cumple con los requisitos');
            return;
        }

        if (!isPasswordMatch) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        await handleChangePassword(newPassword);
        setShowChangePassword(false);
        setNewPassword('');
        setConfirmPassword('');
    };

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

                        {/* Password Change Modal */}
                        {showChangePassword && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className={`
                                    relative w-full max-w-md p-6 rounded-lg shadow-lg
                                    ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light))]' : 'bg-[rgb(var(--color-bg-dark))]'}
                                `}>
                                    {/* Modal Header */}
                                    <div className="mb-4 flex justify-between items-center">
                                        <h3 className={`
                                            text-lg font-semibold
                                            ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                                        `}>
                                            Cambiar Contraseña
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowChangePassword(false);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                                setPasswordError('');
                                                resetPasswordRequirements();
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Password Requirements */}
                                    <div
                                        className={`mb-4 p-3 rounded-lg bg-opacity-50 ${theme === 'light' ? 'bg-gray-100' : 'bg-[#282a2a]'} `}>
                                        <h4
                                            className={`text-sm font-semibold mb-2 ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}`}>
                                            La contraseña debe contener:
                                        </h4>

                                        <ul className="space-y-1">
                                            {[
                                                { key: 'length', text: 'Mínimo 8 caracteres' },
                                                { key: 'lowercase', text: 'Al menos una minúscula' },
                                                { key: 'uppercase', text: 'Al menos una mayúscula' },
                                                { key: 'number', text: 'Al menos un número' },
                                                { key: 'special', text: 'Al menos un carácter especial' }
                                            ].map(({ key, text }) => (
                                                <li key={key} className="flex items-center space-x-2">
                                                    <span
                                                        className={` text-sm ${passwordRequirements[key] ? 'text-green-500' : 'text-gray-400'}`}>
                                                        {passwordRequirements[key] ? '✓' : '○'}
                                                    </span>
                                                    <span
                                                        className={`text-sm${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]': 'text-[rgb(var(--color-text-secondary-dark))]'}`}>
                                                        {text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Password Inputs */}
                                    <div className="space-y-4">
                                        <div>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Nueva contraseña"
                                                className={`
                                                    w-full p-2 rounded-lg border
                                                    ${theme === 'light'
                                                        ? 'bg-[rgb(var(--color-bg-light))] text-[rgb(var(--color-text-primary-light))]'
                                                        : 'bg-[rgb(var(--color-bg-dark))] text-[rgb(var(--color-text-primary-dark))]'}
                                                    ${!isPasswordValid && newPassword ? 'border-red-500' : 'border-gray-300'}
                                                `}
                                            />
                                        </div>

                                        <div>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={handleConfirmPasswordChange}
                                                placeholder="Confirmar contraseña"
                                                className={`
                                                    w-full p-2 rounded-lg border
                                                    ${theme === 'light'
                                                        ? 'bg-[rgb(var(--color-bg-light))] text-[rgb(var(--color-text-primary-light))]'
                                                        : 'bg-[rgb(var(--color-bg-dark))] text-[rgb(var(--color-text-primary-dark))]'}
                                                    ${confirmPassword && !isPasswordMatch ? 'border-red-500' : 'border-gray-300'}
                                                `}
                                            />
                                            {confirmPassword && !isPasswordMatch && (
                                                <p className="text-red-500 text-sm mt-1">Las contraseñas no coinciden</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            onClick={() => {
                                                setShowChangePassword(false);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                                setPasswordError('');
                                                resetPasswordRequirements();
                                            }}
                                            className={`
                                                px-4 py-2 rounded-lg transition-colors duration-200
                                                ${theme === 'light' ? 'bg-[rgb(var(--color-secondary-light))]' : 'bg-[rgb(var(--color-secondary-dark))]'}
                                                ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                                                hover:opacity-80
                                            `}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!isPasswordValid || !isPasswordMatch}
                                            className={`
                                                px-4 py-2 rounded-lg transition-colors duration-200
                                                ${theme === 'light' ? 'bg-[rgb(var(--color-primary-light))]' : 'bg-[rgb(var(--color-primary-dark))]'}
                                                ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                                                hover:opacity-80
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                            `}
                                        >
                                            Guardar
                                        </button>
                                    </div>
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
