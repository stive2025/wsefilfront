import { User, LogOut, Contact, Bolt, Users, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Resize  from "/src/hooks/responsiveHook.jsx"

// eslint-disable-next-line react/prop-types
const NavSlideBar = ({ role }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isMobile = Resize();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    if (role === "admin") {
      fetch("https://listarAgentes") // Reemplaza con tu API real
        .then((response) => response.json())
        .then((data) => setAgents(data))
        .catch((error) => console.error("Error obteniendo agentes:", error));
    }
  }, [role]);

  const toggleMenu = () => setShowMenu(!showMenu);
  const handleLogout = () => navigate("/login");

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
        <div className="flex flex-row gap-4">
          <div className="text-xl cursor-pointer p-4 flex" onClick={toggleMenu}>
            <Menu />
          </div>
          <div className="cursor-pointer p-4 flex">
            {role === "admin" && (
              <div className="cursor-pointerflex">
                <select
                  className="text-xs border p-1 rounded bg-white text-black  w-full sm:w-auto sm:p-2 "
                  value={selectedAgent ? selectedAgent.id : ""}
                  onChange={(e) => {
                    const agent = agents.find((a) => a.id === parseInt(e.target.value));
                    setSelectedAgent(agent);
                  }}
                >
                  <option value="" disabled>Seleccionar agente</option>
                  {agents.length > 0 ? (
                    agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No hay agentes</option>
                  )}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="text-xl cursor-pointer p-4" onClick={handleLogout}>
          <LogOut />
        </div>
      </div>
      <div className={`
          transform transition-transform duration-300 text-xl cursor-pointer
          ${!showMenu ? "-translate-x-full" : "translate-x-0"}
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
      <div className="text-gray-400 hover:text-white text-xl mt-auto mb-4 cursor-pointer rotate-180" onClick={handleLogout}>
        <LogOut />
      </div>
    </div>
  );
};

export default NavSlideBar;
