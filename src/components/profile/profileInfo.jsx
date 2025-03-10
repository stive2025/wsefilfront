
import { Edit2, QrCode } from "lucide-react";
import Resize from "/src/hooks/responsiveHook.jsx";
import {ProfileInfoPanel  } from "/src/contexts/chats.js";
import { useContext } from "react";



// FIN Componentes reutilizables

const ProfileInfo = () => {
    const { SetProfileInfoOpen } = useContext(ProfileInfoPanel);
    const isMobile = Resize();
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
        }]

    const contactFind = (contacts.find(contact => contact.id === 1));
    return (
        <div className={`w-full sm:w-80  flex flex-col bg-gray-900 text-white h-screen mt-10 ${isMobile ? "" : "ml-10"}`}>
            {/* Header */}
            <div className="sticky top-0 left-0 w-full bg-gray-900 px-4 py-3 flex items-center z-5">
                <span className="text-sm">Perfil</span>
            </div>

            {/* Profile Section */}
            <div className="p-5 flex flex-col items-center">
                <div className="w-60 h-60 rounded-full overflow-hidden bg-gray-700 mb-3">
                    <img
                        src={contactFind.multimedia}
                        alt="Profile"
                        className="w-full h-full object-cover"

                    />
                    <button className="  text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black p-2" >
                        <Edit2 size={20} />
                    </button>
                </div>
                <button className="text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black p-2"
                        onClick={() => SetProfileInfoOpen((prev) => !prev)}
                        >
                    <QrCode size={20} />
                </button>
            </div>
        </div>
    )
};

export default ProfileInfo;
