/* eslint-disable react/prop-types */
import { QrCode } from "lucide-react";
import Resize from "/src/hooks/responsiveHook.jsx";
import { ProfileInfoPanel } from "/src/contexts/chats.js";
import { useContext, useEffect, useState } from "react";
import { GetCookieItem } from "/src/utilities/cookies.js";

const ProfileInfo = () => {
    const { SetProfileInfoOpen } = useContext(ProfileInfoPanel);
    const isMobile = Resize();
    const rawProfile = GetCookieItem("userData");
    const infoProfile = JSON.parse(rawProfile);
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        console.log("infoProfile", infoProfile);
    }, [infoProfile]);

    return (
        <div className={`flex flex-col bg-transparent text-white mt-10 ${isMobile ? '' : 'ml-4'}`}>
            {/* Header */}
            <div className="bg-transparent px-4 py-3 flex items-center justify-between">
                <span className="text-xl font-bold mx-auto">Perfil</span>

            </div>

            {/* Profile Section */}
            <div className="flex justify-center">
                <div className="flex flex-col md:flex-row items-center md:items-start p-5 md:space-y-0 md:space-x-6">
                    {/* Profile Image */}
                    <div className="w-60 h-60 rounded-full overflow-hidden bg-gray-700">
                        <img
                            src={infoProfile?.profilePicture || "https://cdn-icons-png.flaticon.com/512/780/780259.png"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Profile Info */}
                    <div className="flex flex-col items-center md:items-start space-y-3">
                        <h2 className="text-xl font-bold">{infoProfile.name}</h2>
                        <p className="text-gray-400">{infoProfile.email}</p>
                        <p className="text-gray-400">{infoProfile.role}</p>
                        <button className="text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black p-2 mb-3"
                            onClick={() => SetProfileInfoOpen(prev => !prev)}>
                            <label className="flex items-center gap-2">
                                <QrCode size={20} />
                                Scanea el código QR
                            </label>
                        </button>
                        <button
                            className="bg-naranja-base hover:bg-naranja-medio text-white font-bold py-2 px-4 rounded transition duration-300"
                            onClick={() => setShowChangePassword(true)}>
                            Cambiar Contraseña
                        </button>

                        {showChangePassword && (
                            <div className=" mt-4 bg-gray-800 p-4 rounded-lg w-full max-w-xs mb-15">
                                <input
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    className="w-full p-2 mb-2 rounded-lg bg-gray-700 text-white"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirmar contraseña"
                                    className="w-full p-2 mb-2 rounded-lg bg-gray-700 text-white"
                                />
                                <div className="flex justify-between">
                                    <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-500">Guardar</button>
                                    <button className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-500" onClick={() => setShowChangePassword(false)}>Cancelar</button>
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
