import Resize from "/src/hooks/responsiveHook.jsx"
import { StateFilter } from "/src/contexts/chats.js";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "/src/contexts/themeContext.jsx";

const Navtopbar = () => {
  const isMobile = Resize();
  const { setStateSelected } = useContext(StateFilter);
  const location = useLocation();
  const { theme } = useTheme();
  
  if (location.pathname !== '/chatList') {
    return null;
  }

  const menuOptions = [
    /*{ key: "ALL", label: "TODO" },*/
    { key: "PENDING", label: "PENDIENTE" },
    { key: "OPEN", label: "PROCESO" },
    { key: "CLOSED", label: "RESUELTOS" }
  ];

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
            <li key={item.key}
              className={`
                flex items-center gap-2 cursor-pointer rounded-full p-2 transition-colors duration-200
                ${theme === 'light' 
                  ? 'text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]' 
                  : 'text-[rgb(var(--color-text-secondary-dark))] hover:text-[rgb(var(--color-primary-dark))]'}
                ${theme === 'light' 
                  ? 'active:bg-[rgb(var(--color-primary-light))] active:bg-opacity-20' 
                  : 'active:bg-[rgb(var(--color-primary-dark))] active:bg-opacity-20'}
              `}
              onClick={() => {
                setStateSelected(item.key);
                console.log(item.key);
              }}
            >
              {item.label}
            </li>
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
            <li key={item.key}
              onClick={() => {
                setStateSelected(item.key);
                console.log(item.key);
              }}
              className={`
                flex items-center gap-2 cursor-pointer rounded-full p-2 transition-colors duration-200
                ${theme === 'light' 
                  ? 'text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]' 
                  : 'text-[rgb(var(--color-text-secondary-dark))] hover:text-[rgb(var(--color-primary-dark))]'}
                ${theme === 'light' 
                  ? 'active:bg-[rgb(var(--color-primary-light))] active:bg-opacity-20' 
                  : 'active:bg-[rgb(var(--color-primary-dark))] active:bg-opacity-20'}
              `}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navtopbar;
