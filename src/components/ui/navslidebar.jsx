import { User, LogOut, Contact, Bolt, Users, Menu, MessageSquare } from "lucide-react";
import { ChatInterfaceClick } from "/src/contexts/chats.js"
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { getAgents } from "/src/services/agents.js";
import Resize from "/src/hooks/responsiveHook.jsx"

// eslint-disable-next-line react/prop-types
const NavSlideBar = ({ role }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isMobile = Resize();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const { setSelectedChatId } = useContext(ChatInterfaceClick);
  const { callEndpoint } = useFetchAndLoad();
  const [setError] = useState(null);


  useEffect(() => {
    if (role === "admin") {
      fetchAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const fetchAgents = async () => {
    try {
      // Llamar a getAgents() para obtener el objeto con call y abortController
      const agentsCall = getAgents();
      // Pasar el objeto completo a callEndpoint
      console.log("Cargando agentes...");
      const response = await callEndpoint(agentsCall);
      setAgents(response);
    } catch (error) {
      // Solo actualizar el estado de error si no es un error de abort
      if (error.name !== 'AbortError') {
        console.error("Error buscando agentes:", error);
        setError("No se pudieron cargar los agentes");
      }
    }
  };

  const toggleMenu = () => setShowMenu(!showMenu);
  const handleLogout = () => navigate("/login");

  const menuOptions = {
    admin: [
      { icon: <User />, label: "Perfil", path: "/profile" },
      { icon: <MessageSquare />, label: "Chats", path: "/chatList" },
      { icon: <Bolt />, label: "Configuración", path: "/utilities/tags" },
      { icon: <Contact />, label: "Contactos", path: "/contacts" },
      { icon: <Users />, label: "Agentes", path: "/agents" },
    ],
    user: [
      { icon: <User />, label: "Perfil", path: "/profile" },
      { icon: <MessageSquare />, label: "Chats", path: "/chatList" },
      { icon: <Users />, label: "Contactos", path: "/agents" },
    ],
    Supervisor: [
      { icon: <User />, label: "Perfil", path: "/profile" },
      { icon: <MessageSquare />, label: "Chats", path: "/chatList" },
      { icon: <Bolt />, label: "Configuración", path: "/utilities/tags" },
      { icon: <Contact />, label: "Contactos", path: "/contacts" },
      { icon: <Users />, label: "Agentes", path: "/agents" },
    ],
  };

  return isMobile ? (
    <header className="bg-gray-800 text-white fixed w-full top-0 z-20 h-10">
      <div className="flex justify-between items-center h-10">
        <div className="flex flex-row gap-4">
          <div className="text-xl cursor-pointer p-4 flex" onClick={toggleMenu}>
            <Menu />
          </div>
          <div className="cursor-pointer p-4 flex">
            {role === "admin" && (
              <div className="cursor-pointerflex">
                <select
                  className={`text-xs border p-1 rounded bg-gray-900 text-white w-full sm:w-auto sm:p-2 ${selectedAgent ? 'text-white' : 'text-gray-400'}`}
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
              <li key={index} className="flex items-center gap-2 cursor-pointer hover:text-gray-300 active:bg-gray-700 p-2"
                onClick={() => {
                  setSelectedChatId(null);
                  navigate(item.path);
                  setShowMenu(false);
                }}
              >
                {item.icon} {item.label}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  ) : (
    <div className="fixed h-screen w-10 bg-gray-800 flex flex-col items-center py-4">
      <ul className="flex flex-col gap-6 flex-1">
        {menuOptions[role]?.map((item, index) => (
          <li key={index} className="text-gray-400 hover:text-white cursor-pointer active:bg-gray-700 rounded-full p-2"
            onClick={() => { setSelectedChatId(null); navigate(item.path); }}
          >
            {item.icon}
          </li>
        ))}
      </ul>
      <div className="text-gray-400 hover:text-white text-xl mt-auto mb-4 cursor-pointer p-2 rotate-180 active:bg-gray-700 rounded-full" onClick={handleLogout}>
        <LogOut />
      </div>
    </div>
  );
};

export default NavSlideBar;
