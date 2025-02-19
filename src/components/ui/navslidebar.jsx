// src/components/NavSlideBar.jsx
import { FaUser, FaSignOutAlt } from "react-icons/fa";

// eslint-disable-next-line react/prop-types
const NavSlideBar = ({ role }) => {
  // Opciones según el rol
  const menuOptions = {
    admin: [
      { icon: <FaUser />, label: "Usuarios" },
      { icon: <FaUser />, label: "Reportes" },
      { icon: <FaUser />, label: "Configuración" },
    ],
    user: [
      { icon: <FaUser />, label: "Perfil" },
      { icon: <FaUser />, label: "Mis pedidos" },
    ],
    guest: [
      { icon: <FaUser />, label: "Inicio" },
      { icon: <FaUser />, label: "Acerca de" },
    ],
  };

  return (
    <nav className="h-screen w-16 bg-gray-900 flex flex-col items-center py-4">
      {/* Icono superior */}
      <div className="text-white text-2xl mb-4">
        <FaUser />
      </div>

      {/* Opciones de menú */}
      <ul className="flex flex-col gap-6 flex-1">
        {menuOptions[role]?.map((item, index) => (
          <li key={index} className="text-gray-400 hover:text-white cursor-pointer">
            {item.icon}
          </li>
        ))}
      </ul>

      {/* Botón de salida */}
      <div className="text-white text-xl mt-auto mb-4 cursor-pointer">
        <FaSignOutAlt />
      </div>
    </nav>
  );
};

export default NavSlideBar;

