/* eslint-disable react/prop-types */
import Resize from "@/hooks/responsiveHook.jsx"
import { StateFilter } from "@/contexts/chats.js";
import { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/themeContext.jsx";

const Navtopbar = () => {
  const isMobile = Resize();
  const { stateSelected, setStateSelected } = useContext(StateFilter);
  const location = useLocation();
  const { theme } = useTheme();
  const [activeItem, setActiveItem] = useState(stateSelected || "PENDING");

  useEffect(() => {
    // Solo establecer PENDING si no hay estado seleccionado
    if (!stateSelected) {
      setStateSelected("OPEN"); // Cambiar a 'OPEN' como valor por defecto
    }
    setActiveItem(stateSelected || "OPEN");
  }, [stateSelected, setStateSelected]);

  if (location.pathname !== '/chatList') {
    return null;
  }

  const menuOptions = [
    { key: "OPEN", label: "PROCESO" },
    { key: "PENDING", label: "PENDIENTE" },
    { key: "CLOSED", label: "RESUELTOS" }
  ];

  const MenuItem = ({ item }) => {
    const isActive = activeItem === item.key;
    // Update active item when stateSelected changes
    useEffect(() => {
      if (stateSelected) {
        setActiveItem(stateSelected);
      }
    }, [stateSelected]);

    return (
      <li
        onClick={() => {
          setStateSelected(item.key);
          setActiveItem(item.key);
        }}
        className={`
          flex items-center gap-2 cursor-pointer rounded-full p-2 transition-colors duration-200
          ${isActive
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
      >
        {item.label}
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
          {Object.values(menuOptions).map((item) => (
            <MenuItem key={item.key} item={item} />
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
          {Object.values(menuOptions).map((item) => (
            <MenuItem key={item.key} item={item} />
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navtopbar;