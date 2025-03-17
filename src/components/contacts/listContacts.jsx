/* eslint-disable react/prop-types */
import Resize from "/src/hooks/responsiveHook.jsx";
import { Search, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useContext } from "react";
import { NewContactForm, ChatInterfaceClick, NewMessage } from "/src/contexts/chats.js";
import { useNavigate, useLocation } from "react-router-dom";

// Componentes reutilizables

const SearchInput = () => (
  <div className="p-2 bg-gray-900">
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-gray-800 rounded-lg pl-8 pr-2 py-1 text-white placeholder-gray-400"
      />
      <Search className="absolute left-1 text-gray-400" size={18} />
    </div>
  </div>
);

const ContactItems = ({ contacts, setSelectedChatId, setNewMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="bg-gray-900">
      {contacts.contacts.map((item) => (
        <div key={item.id} className="w-full flex items-center space-x-3 p-4">
          <div
            className="w-full flex items-center space-x-3 p-4 hover:bg-gray-800 cursor-pointer active:bg-gray-700"
            onClick={() => {
              if (location.pathname === "/contacts") {
                navigate("/chatList");
              }
              setSelectedChatId(item.id);
              setNewMessage(false);
            }}
          >
            <img
              src={item.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />

            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">{item.name}</div>
              <div className="text-xs md:text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] sm:max-w-[200px]">
                {item.number}
              </div>
            </div>
          </div>
          {location.pathname === "/contacts" && (
            <div className="flex">
              <button className="mr-2 text-gray-400 hover:text-white">
                <Pencil size={16} />
              </button>
              <button className="text-gray-400 hover:text-white">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ListContacts = () => {
  const { setNewMessage } = useContext(NewMessage);
  const { setContactNew } = useContext(NewContactForm);
  const { selectedChatId, setSelectedChatId } = useContext(ChatInterfaceClick);
  const isMobile = Resize();
  const location = useLocation();
  const contacts = {
    contacts: [
      { id: "1", avatar: "/src/assets/images/agent1.jpg", name: "José Sarmiento", number: "0990046508" },
      { id: "2", avatar: "/src/assets/images/agent2.jpg", name: "María Pérez", number: "0990046508" },
      { id: "3", avatar: "/src/assets/images/agent3.jpg", name: "Juan López", number: "0990046508" }
    ],
  };

  return isMobile ? (
    <div className="w-full sm:w-80 flex flex-col bg-gray-900 text-white h-screen">
      {location.pathname === "/chatList" && (
        <div className="flex flex-row flex-shrink-0 mt-12">
          <button className="text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black p-1"
            onClick={() => setNewMessage(null)}      >
            <ArrowLeft size={15} />
          </button>
          <label className="p-1">CONTACTOS</label>
        </div>
      )}
      <div className="flex flex-col flex-shrink-0">
        <SearchInput />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ContactItems contacts={contacts} setSelectedChatId={setSelectedChatId} selectedChatId={selectedChatId} setNewMessage={setNewMessage} />
      </div>
      {location.pathname === "/contacts" && (
        <button
          className="absolute bottom-4 right-4 mb-15 rounded-full p-3 shadow-lg text-white cursor-pointer bg-naranja-base hover:bg-naranja-medio"
          onClick={() => setContactNew((prev) => !prev)}
        >
          <Plus size={18} />
        </button>
      )}
    </div>
  ) : (
    <div className="flex-1 border-r border-gray-700 flex flex-col bg-gray-900 text-white pt-10 ml-10 overflow-y-auto">
      {location.pathname === "/chatList" && (
        <div className="flex flex-row items-center flex-shrink-0 p-2">
          <button className="text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black p-1"
            onClick={() => setNewMessage(null)}      >
            <ArrowLeft size={15} />
          </button>
          <label className="p-1">CONTACTOS</label>
          
        </div>
      )}
      <div className="flex flex-col flex-shrink-0">
        <SearchInput />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <ContactItems contacts={contacts} setSelectedChatId={setSelectedChatId} selectedChatId={selectedChatId} setNewMessage={setNewMessage} />
      </div>
    </div>
  );
};

export default ListContacts;
