/* eslint-disable react/prop-types */
import { User, LogOut, Contact, Bolt, Users, MessageSquare } from "lucide-react";
import { ChatInterfaceClick, TempNewMessage } from "@/contexts/chats.js"
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Resize from "@/hooks/responsiveHook.jsx"
import { logout } from "@/services/authService.js";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { useTheme } from "@/contexts/themeContext.jsx";
import { useResetContexts } from '@/hooks/useResetContexts';

const NavSlideBar = () => {
  const resetContexts = useResetContexts();
  const [showMenu, setShowMenu] = useState(false);
  const [activePath, setActivePath] = useState('');
  const isMobile = Resize();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedChatId } = useContext(ChatInterfaceClick);
  const { setTempIdChat } = useContext(TempNewMessage);
  const { theme } = useTheme();

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

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

  const isActive = (path) => {
    if (path.startsWith('/utilities')) {
      return activePath.startsWith('/utilities');
    }
    return activePath === path || (path !== '/' && activePath.startsWith(path));
  };

  const MenuItem = ({ item, isMobileView }) => {
    const active = isActive(item.path);
    
    return (
      <AbilityGuard abilities={item.abilities}>
        <li
          className={`
            cursor-pointer transition-colors duration-200 relative group
            ${isMobileView
              ? `flex items-center gap-2 p-2 rounded-md
                 ${active 
                   ? theme === 'light'
                     ? 'text-[rgb(var(--color-primary-light))] font-medium' 
                     : 'text-[rgb(var(--color-primary-dark))] font-medium'
                   : theme === 'light' 
                     ? 'text-[rgb(var(--color-text-primary-light))] hover:text-[rgb(var(--color-primary-light))]' 
                     : 'text-[rgb(var(--color-text-primary-dark))] hover:text-[rgb(var(--color-primary-dark))]'
                 }`
              : `rounded-full p-2
                 ${active
                   ? theme === 'light'
                     ? 'text-[rgb(var(--color-primary-light))]'
                     : 'text-[rgb(var(--color-primary-dark))]'
                   : theme === 'light'
                     ? 'text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]'
                     : 'text-[rgb(var(--color-text-secondary-dark))] hover:text-[rgb(var(--color-primary-dark))]'
                 }`
            }
            active:bg-opacity-20
            ${theme === 'light' 
              ? 'active:bg-[rgb(var(--color-primary-light))]' 
              : 'active:bg-[rgb(var(--color-primary-dark))]'}
          `}
          onClick={() => {
            setSelectedChatId(null);
            setTempIdChat(null);
            navigate(item.path);
            if (isMobileView) setShowMenu(false);
          }}
        >
          {item.icon}
          {isMobileView && <span>{item.label}</span>}
          
          {/* Tooltip */}
          {!isMobileView && (
            <div className={`
              absolute left-12 whitespace-nowrap px-2 py-1 rounded
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              ${theme === 'light'
                ? 'bg-[rgb(var(--color-bg-light-secondary))] text-[rgb(var(--color-text-primary-light))]'
                : 'bg-[rgb(var(--color-bg-dark-secondary))] text-[rgb(var(--color-text-primary-dark))]'}
              shadow-lg text-sm
            `}>
              {item.label}
            </div>
          )}
        </li>
      </AbilityGuard>
    );
  };

  const handleLogout = () => {
    resetContexts();
    logout();
  };

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
        onClick={handleLogout}
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