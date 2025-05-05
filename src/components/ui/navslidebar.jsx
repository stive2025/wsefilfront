/* eslint-disable react/prop-types */
import { User, LogOut, Contact, Bolt, Users, MessageSquare } from "lucide-react";
import { ChatInterfaceClick } from "/src/contexts/chats.js"
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Resize from "/src/hooks/responsiveHook.jsx"
import { logout } from "/src/services/authService.js";
import { ABILITIES } from '/src/constants/abilities';
import AbilityGuard from '/src/components/common/AbilityGuard.jsx';

const NavSlideBar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const isMobile = Resize();
  const navigate = useNavigate();
  const { setSelectedChatId } = useContext(ChatInterfaceClick);

  const menuOptions = [
    {
      icon: <User />,
      label: "Perfil",
      path: "/profile",
      abilities: [ABILITIES.PROFILE.VIEW, ABILITIES.PROFILE.CREATE, ABILITIES.PROFILE.UPDATE, ABILITIES.PROFILE.DELETE]
    },
    {
      icon: <MessageSquare />,
      label: "Chats",
      path: "/chatList",
      abilities: [ABILITIES.CHATS.VIEW, ABILITIES.CHATS.CREATE, ABILITIES.CHATS.UPDATE, ABILITIES.CHATS.DELETE]
    },
    {
      icon: <Bolt />,
      label: "Configuración",
      path: "/utilities/tags",
      abilities: [ABILITIES.UTILITIES.VIEW, ABILITIES.UTILITIES.CREATE, ABILITIES.UTILITIES.UPDATE, ABILITIES.UTILITIES.DELETE]
    },
    {
      icon: <Contact />,
      label: "Contactos",
      path: "/contacts",
      abilities: [ABILITIES.CONTACTS.VIEW, ABILITIES.CONTACTS.CREATE, ABILITIES.CONTACTS.UPDATE, ABILITIES.CONTACTS.DELETE]
    },
    {
      icon: <Users />,
      label: "Agentes",
      path: "/agents",
      abilities: [ABILITIES.AGENTS.VIEW, ABILITIES.AGENTS.CREATE, ABILITIES.AGENTS.UPDATE, ABILITIES.AGENTS.DELETE]
    }
  ];

  const MenuItem = ({ item, isMobileView }) => (
    <AbilityGuard abilities={item.abilities}>
      <li
        className={`${isMobileView
            ? "flex items-center gap-2 cursor-pointer hover:text-gray-300 active:bg-gray-700 p-2"
            : "text-gray-400 hover:text-white cursor-pointer active:bg-gray-700 rounded-full p-2"
          }`}
        onClick={() => {
          setSelectedChatId(null);
          navigate(item.path);
          if (isMobileView) setShowMenu(false);
        }}
      >
        {item.icon}
        {isMobileView && item.label}
      </li>
    </AbilityGuard>
  );

  return isMobile ? (
    <header className="bg-gray-800 text-white fixed w-full top-0 z-20 h-10">
      {/* ...existing code for header... */}
      <div className={`
          transform transition-transform duration-300 text-xl cursor-pointer 
          ${!showMenu ? "-translate-x-full" : "translate-x-0"}
        `}>
        <nav className="bg-gray-800 text-white h-screen w-full p-2 shadow-md absolute top-full left-0">
          <ul className="flex flex-col gap-4">
            {menuOptions.map((item, index) => (
              <MenuItem key={index} item={item} isMobileView={true} />
            ))}
          </ul>
        </nav>
      </div>
    </header>
  ) : (
    <div className="fixed h-screen w-10 bg-gray-800 flex flex-col items-center py-4">
      <ul className="flex flex-col gap-6 flex-1">
        {menuOptions.map((item, index) => (
          <MenuItem key={index} item={item} isMobileView={false} />
        ))}
      </ul>
      <div className="text-gray-400 hover:text-white text-xl mt-auto mb-4 cursor-pointer p-2 rotate-180 active:bg-gray-700 rounded-full" onClick={logout}>
        <LogOut />
      </div>
    </div>
  );
};

export default NavSlideBar;