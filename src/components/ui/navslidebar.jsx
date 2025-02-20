import { User, LogOut, Contact, Bolt, Users, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const NavSlideBar = ({ role }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setShowMenu(!showMenu);
  const handleLogout = () => navigate("/");

  const menuOptions = {
    admin: [
      { icon: <User />, label: "Perfil" },
      { icon: <Bolt />, label: "Configuración" },
      { icon: <Contact />, label: "Contactos" },
      { icon: <Users />, label: "Agentes" },
    ],
    user: [
      { icon: <User />, label: "Perfil" },
      { icon: <Users />, label: "Contactos" },
    ],
    Supervisor: [
      { icon: <User />, label: "Perfil" },
      { icon: <Bolt />, label: "Configuración" },
      { icon: <Contact />, label: "Contactos" },
      { icon: <Users />, label: "Agentes" },
    ],
  };

  return isMobile ? (
    <header className="bg-gray-900 text-white fixed w-full top-0 z-20">
      <div className="flex justify-between items-center">
        <div className="text-xl cursor-pointer p-4" onClick={toggleMenu}>
          <Menu />
        </div>
        <div className="text-xl cursor-pointer p-4" onClick={handleLogout}>
          <LogOut />
        </div>
      </div>
        <div className={`
          transform transition-transform duration-300 text-xl cursor-pointer
          ${showMenu ? "-translate-x-full" : "translate-x-0"}
          `}>
          <nav className="bg-gray-800 text-white h-screen w-full p-2 shadow-md absolute top-full left-0">
            <ul className="flex flex-col gap-4">
              {menuOptions[role]?.map((item, index) => (
                <li key={index} className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
                  {item.icon} {item.label}
                </li>
              ))}
            </ul>
          </nav>
        </div>     
    </header>
  ) : (
    <div className="fixed h-screen w-16 bg-gray-900 flex flex-col items-center py-4">
      <ul className="flex flex-col gap-6 flex-1">
        {menuOptions[role]?.map((item, index) => (
          <li key={index} className="text-gray-400 hover:text-white cursor-pointer">
            {item.icon}
          </li>
        ))}
      </ul>
      <div className="text-gray-400 hover:text-white text-xl mt-auto mb-4 cursor-pointer" onClick={handleLogout}>
        <LogOut />
      </div>
    </div>
  );
};

export default NavSlideBar;
