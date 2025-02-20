// src/components/NavSlideBar.jsx
import { User, LogOut, Contact, Bolt, Users, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line react/prop-types
const NavSlideBar = ({ role }) => {
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  // Opciones según el rol
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
      { icon: <Users />, label: "Agentes" }
    ],
  };
  //Método para Logout
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
    <div className="absolute top-4 left-4 z-20">
      <div className="text-white text-xl mt-auto mb-4 cursor-pointer rotate-180" onClick={toggleSidebar}>
          <Menu />
    </div>
  </div>
  
    <div
      className={`
    transform transition-transform duration-300
    ${showSidebar ? "translate-x-0" : "-translate-x-full"}
    `}>
      <nav className=" h-screen w-16 bg-gray-900 flex flex-col items-center py-4" >
        {/* Opciones de menú */}
        <ul className="flex flex-col gap-6 flex-1">
          {menuOptions[role]?.map((item, index) => (
            <li key={index} className="text-gray-400 hover:text-white cursor-pointer">
              {item.icon}
            </li>
          ))}
        </ul>

        {/* Botón de salida */}
        <div className=" text-gray-400 hover:text-white cursor-pointer text-xl mt-auto mb-4 rotate-180" onClick={handleLogout}>
          <LogOut />
        </div>
      </nav>
    </div>
    </>
  );
};

export default NavSlideBar;

