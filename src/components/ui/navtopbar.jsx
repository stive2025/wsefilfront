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
    <div className="z-20 bg-gray-900 items-center p-2">
      <div className="text-gray-400 hover:text-white text-xl mt-auto mb-4 cursor-pointer rotate-180" onClick={toggleSidebar}>
           <Menu/>
      </div>
    </div>
  
    <div
      className={`
    transform transition-transform duration-300 text-xl cursor-pointer
    ${showSidebar ? "-translate-x-full" : "translate-x-0"}
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
        <div className="text-gray-400 hover:text-white text-xl mt-auto mb-4 cursor-pointer rotate-180" onClick={handleLogout}>
          <LogOut />
        </div>
      </nav>
    </div>
    </>
  );
};

export default NavSlideBar;



