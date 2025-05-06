/* eslint-disable react/prop-types */
import { User, LogOut, Contact, Bolt, Users, MessageSquare } from "lucide-react";
import { ChatInterfaceClick } from "/src/contexts/chats.js"
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Resize from "/src/hooks/responsiveHook.jsx"
import { logout } from "/src/services/authService.js";
import { ABILITIES } from '/src/constants/abilities';
import AbilityGuard from '/src/components/common/AbilityGuard.jsx';
import { useTheme } from "/src/contexts/themeContext.jsx";

const NavSlideBar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const isMobile = Resize();
  const navigate = useNavigate();
  const { setSelectedChatId } = useContext(ChatInterfaceClick);
  const { theme } = useTheme();

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
        className={`
          cursor-pointer transition-colors duration-200
          ${isMobileView
            ? `flex items-center gap-2 p-2
               ${theme === 'light' 
                 ? 'text-[rgb(var(--color-text-primary-light))] hover:text-[rgb(var(--color-primary-light))]' 
                 : 'text-[rgb(var(--color-text-primary-dark))] hover:text-[rgb(var(--color-primary-dark))]'}`
            : `rounded-full p-2
               ${theme === 'light'
                 ? 'text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]'
                 : 'text-[rgb(var(--color-text-secondary-dark))] hover:text-[rgb(var(--color-primary-dark))]'}`
          }
          active:bg-opacity-20
          ${theme === 'light' 
            ? 'active:bg-[rgb(var(--color-primary-light))]' 
            : 'active:bg-[rgb(var(--color-primary-dark))]'}
        `}
        onClick={() => {
          setSelectedChatId(null);
          navigate(item.path);
          if (isMobileView) setShowMenu(false);
        }}
      >
        {item.icon}
        {isMobileView && <span>{item.label}</span>}
      </li>
    </AbilityGuard>
  );

  return isMobile ? (
    <header className={`
      fixed w-full top-0 z-20 h-10
      ${theme === 'light' 
        ? 'bg-[rgb(var(--color-bg-light-secondary))]' 
        : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
    `}>
      <div className="flex items-center justify-between h-full px-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`
            p-2 rounded-full transition-colors duration-200
            ${theme === 'light'
              ? 'text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]'
              : 'text-[rgb(var(--color-text-secondary-dark))] hover:text-[rgb(var(--color-primary-dark))]'}
          `}
        >
          {/* Hamburger icon */}
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <nav className={`
        fixed top-10 left-0 w-full h-[calc(100vh-2.5rem)] transition-transform duration-300 ease-in-out
        ${showMenu ? 'translate-x-0' : '-translate-x-full'}
        ${theme === 'light' 
          ? 'bg-[rgb(var(--color-bg-light-secondary))]' 
          : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
      `}>
        <ul className="flex flex-col gap-4 p-4">
          {menuOptions.map((item, index) => (
            <MenuItem key={index} item={item} isMobileView={true} />
          ))}
        </ul>
      </nav>
    </header>
  ) : (
    <div className={`
      fixed h-screen w-10 flex flex-col items-center py-4
      ${theme === 'light' 
        ? 'bg-[rgb(var(--color-bg-light-secondary))]' 
        : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
    `}>
      <ul className="flex flex-col gap-6 flex-1">
        {menuOptions.map((item, index) => (
          <MenuItem key={index} item={item} isMobileView={false} />
        ))}
      </ul>
      <button 
        onClick={logout}
        className={`
          p-2 rounded-full transition-colors duration-200 rotate-180
          ${theme === 'light'
            ? 'text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]'
            : 'text-[rgb(var(--color-text-secondary-dark))] hover:text-[rgb(var(--color-primary-dark))]'}
        `}
      >
        <LogOut />
      </button>
    </div>
  );
};

export default NavSlideBar;