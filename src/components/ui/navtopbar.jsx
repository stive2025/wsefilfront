import Resize from "/src/hooks/responsiveHook.jsx"
import { StateFilter } from "/src/contexts/chats.js";
import { useContext } from "react";
import { useLocation } from "react-router-dom";



const Navtopbar = () => {
  const isMobile = Resize();
  const { setStateSelected } = useContext(StateFilter);
  const location = useLocation();
  
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
    <footer className="bg-gray-800 text-white fixed w-full bottom-0 z-20">
      <nav className="bg-gray-800 text-white h-10 w-full shadow-md absolute bottom-full left-0 flex items-center p-1">
        <ul className="flex w-full justify-around">
          {Object.values(menuOptions).map((item) => (
            <li key={item.key}
              className="flex items-center gap-2 cursor-pointer hover:text-gray-300 active:bg-gray-700 rounded-full p-2"
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
    <header className="bg-gray-900 text-white fixed w-full top-0 z-20">
      <nav className="bg-gray-800 text-white w-full ml-10 p-2 shadow-md absolute top-full left-0 h-10 flex items-center">
        <ul className="flex flex-row gap-4 items-center w-full">
          {Object.values(menuOptions).map((item) => (
            <li key={item.key}
              onClick={() => {
                setStateSelected(item.key);
                console.log(item.key);
              }}
              className="flex items-center gap-2 cursor-pointer hover:text-gray-300 active:bg-gray-700 rounded-full p-2">
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navtopbar;
