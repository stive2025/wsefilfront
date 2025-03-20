/* eslint-disable react/prop-types */
import { QrCode } from "lucide-react";
import Resize from "/src/hooks/responsiveHook.jsx";
import { ProfileInfoPanel } from "/src/contexts/chats.js";
import { useContext, useState } from "react";

const ProfileInfo = ({ role }) => {
    const { SetProfileInfoOpen } = useContext(ProfileInfoPanel);
    const isMobile = Resize();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const contacts = [
        {
            id: 1,
            name: "José Sarmiento",
            phone: "+593 99 004 6508",
            state: "En linea",
            contactState: ":)",
            multimedia: [
                { id: "1", url: "https://th.bing.com/th/id/OIP.vec1MtxNIg3BNzhFjw1WNAHaE8?rs=1&pid=ImgDetMain" },
            ],
            creditoInfo: [
                { idcredit: "112244", garante: "Ximena Gonzaga", mont: "1200", payDate: "04/01/2025" }
            ]
        }
    ];

    

    const contactFind = contacts.find(contact => contact.id == 1);

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
                            src={contactFind.multimedia[0].url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Profile Info */}
                    <div className="flex flex-col items-center md:items-start space-y-3">
                        <h2 className="text-xl font-bold">{contactFind.name}</h2>
                        <p>{contactFind.phone}</p>
                        {role == "admin" && (
                            <button className="text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black p-2 mb-3"
                                onClick={() => SetProfileInfoOpen(prev => !prev)}>
                                <QrCode size={20} />
                            </button>
                        )}
                        <button className="text-white bg-blue-600 rounded-full cursor-pointer p-2 hover:bg-blue-500"
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
