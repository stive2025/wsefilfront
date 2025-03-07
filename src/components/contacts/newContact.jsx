import { useState } from 'react';
import { User, Phone } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";

const NewContact = () => {
  const isMobile = Resize();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  return (
    <div className={`bg-gray-900 rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800 rounded-lg">
        <User size={20} className="text-[#FF9619] mr-4" />
        <h1 className="text-xl font-normal">Nuevo Contacto</h1>
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

        {/* Phone */}
        <div className="mb-6">
          <div className="flex items-center">
            <Phone size={20} className="text-gray-400 mr-4" />
            <div className="flex-1">
              <div className="flex mt-1">
                <div className="flex-1 border-b border-gray-700 focus-within:border-[#FF9619] pb-1">
                  <input
                    type="tel"
                    placeholder="Número"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-transparent text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Save button */}
        <div className="mt-4 mb-6">
          <button
            disabled={!phoneNumber.trim()}
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

export default NewContact;
