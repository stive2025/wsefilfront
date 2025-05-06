/* eslint-disable react/prop-types */
import Resize from "/src/hooks/responsiveHook.jsx"
import { Tag, MailPlus, BotMessageSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "/src/contexts/themeContext.jsx";
import { useState, useEffect } from "react";

const NavUtilities = () => {
    const isMobile = Resize();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const [activePath, setActivePath] = useState('');

    // Update active path when location changes
    useEffect(() => {
        setActivePath(location.pathname);
    }, [location]);

    const menuOptions = [
        { icon: <Tag size={18} />, label: "Etiquetas", path: "/utilities/tags" },
        { icon: <MailPlus size={18} />, label: "Mensajes Personalizados", path: "/utilities/customMessages" },
        { icon: <BotMessageSquare size={18} />, label: "Mensajes Automáticos", path: "/utilities/autoMessages" },
    ];

    const isActive = (path) => {
        // Check if current path starts with menu item path
        // This handles sub-paths like /utilities/tags showing utilities as active
        if (path === '/utilities/') {
            // Special case for utilities path - match any utilities path
            return activePath.startsWith('/utilities');
        }
        return activePath === path || (path !== '/' && activePath.startsWith(path));
    };

    const MenuItem = ({ item }) => {
        const active = isActive(item.path);

        return (
            <li
                className={`
                    flex items-center gap-2 cursor-pointer rounded-full p-2 transition-colors duration-200
                    ${active
                        ? theme === 'light'
                            ? 'text-[rgb(var(--color-primary-light))]'
                            : 'text-[rgb(var(--color-primary-dark))]'
                        : theme === 'light'
                            ? 'text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]'
                            : 'text-[rgb(var(--color-text-secondary-dark))] hover:text-[rgb(var(--color-primary-dark))]'
                    }
                    ${theme === 'light'
                        ? 'active:bg-[rgb(var(--color-primary-light))] active:bg-opacity-20'
                        : 'active:bg-[rgb(var(--color-primary-dark))] active:bg-opacity-20'}
                `}
                onClick={() => navigate(item.path)}
            >
                {item.icon}
                {!isMobile && item.label}
            </li>
        );
    };

    return isMobile ? (
        <footer className={`
            fixed w-full bottom-0 z-20
            ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light-secondary))]' : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
        `}>
            <nav className={`
                h-10 w-full shadow-md absolute bottom-full left-0 flex items-center p-1
                ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light-secondary))]' : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
            `}>
                <ul className="flex w-full justify-around">
                    {menuOptions.map((item, index) => (
                        <MenuItem key={index} item={item} />
                    ))}
                </ul>
            </nav>
        </footer>
    ) : (
        <header className={`
            fixed w-full top-0 z-20
            ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light-secondary))]' : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
        `}>
            <nav className={`
                w-full ml-10 p-2 shadow-md absolute top-full left-0 h-10 flex items-center
                ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light-secondary))]' : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
            `}>
                <ul className="flex flex-row gap-4 items-center w-full">
                    {menuOptions.map((item, index) => (
                        <MenuItem key={index} item={item} />
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default NavUtilities;