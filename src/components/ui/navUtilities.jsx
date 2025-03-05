import Resize from "/src/hooks/responsiveHook.jsx"
import { Tag, MessageCirclePlus, MessageSquareCode } from "lucide-react";
import { useNavigate } from "react-router-dom";


const NavUtilities = () => {
    const isMobile = Resize();
    const navigate = useNavigate();
    const menuOptions = [
        { icon: <Tag />, label: "Tags", path: "/utilities/tags" },
        { icon: <MessageCirclePlus />, label: "Mensajes Personalizados", path: "/utilities/customMessages" },
        { icon: <MessageSquareCode />, label: "Mensajes Automáticos", path: "/utilities/autoMessages" },
    ];

    return isMobile ? (
        <footer className="bg-gray-800 text-white fixed w-full bottom-0 z-20">
            <nav className="bg-gray-800 text-white h-10 w-full shadow-md absolute bottom-full left-0 flex items-center p-1">
            <ul className="flex w-full justify-around">
                    {menuOptions.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 cursor-pointer hover:text-gray-300 active:bg-gray-700 rounded-full p-2"
                            onClick={() => navigate(item.path)}>
                            {item.icon}
                        </li>
                    ))}
                </ul>
            </nav>
        </footer>
    ) : (
        <header className="bg-gray-900 text-white fixed w-full top-0 z-20">
            <nav className="bg-gray-800 text-white w-full ml-16 p-2 shadow-md absolute top-full left-0">
            <ul className="flex flex-row gap-4">
                    {menuOptions.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 cursor-pointer hover:text-gray-300 active:bg-gray-700 rounded-full p-2"
                            onClick={() => navigate(item.path)}>
                            {item.icon} {item.label}
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default NavUtilities;
