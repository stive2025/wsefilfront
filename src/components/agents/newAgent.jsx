import { useState } from 'react';
import { User } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";

const NewAgent = () => {
  const isMobile = Resize();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  return (
    <div className={`bg-gray-900 rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800 rounded-lg">
        <User size={20} className="text-[#FF9619] mr-4" />
        <h1 className="text-xl font-normal">Nuevo Agente</h1>
      </div>

      {/* Form */}
      <div className="p-4 flex-1 flex flex-col">
        {/* First name */}
        <div className="mb-6 border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
          <input
            type="text"
            placeholder="Nombres"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {/* Last name */}
        <div className="mb-6 border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
          <input
            type="text"
            placeholder="Apellidos"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>
        {/* Save button */}
        <div className="mt-4 mb-6">
          <button
            disabled={!firstName.trim()}
            className="w-full py-3 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-600
                     transition-colors duration-300 text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAgent;
