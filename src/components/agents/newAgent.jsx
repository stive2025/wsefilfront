import { useState, useCallback } from 'react';
import { User } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";
import CustomFetch from "/src/services/apiService.js";

const NewAgent = () => {
  const isMobile = Resize();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && password.trim() && role;

  const createAgent = useCallback(
    async () => {
      if (isFormValid) {
        const formAgentData = {
          "name": `${firstName} ${lastName}`,
          "email": email,
          "role": role,
          "password": password,
          "abilities": "abilitie1",
        }
        try {
          const createAgentResponse = await CustomFetch("users",
            {
              method: "POST",
              body: JSON.stringify(formAgentData)
            })
            console.log("Agente creado ", createAgentResponse)
        } catch (error) {
          console.error("Error creando agente ", error)
        }

      }
    }
  );

  return (
    <div className={`bg-gray-900 rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800 rounded-lg">
        <User size={20} className="text-[#FF9619] mr-4" />
        <h1 className="text-xl font-normal">Nuevo Agente</h1>
      </div>

      {/* Form */}
      <div className="p-4 flex-1 flex flex-col space-y-6">
        {/* First Name */}
        <div className="border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
          <input
            type="text"
            placeholder="Nombres"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {/* Last Name */}
        <div className="border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
          <input
            type="text"
            placeholder="Apellidos"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {/* Email */}
        <div className="border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {/* Password */}
        <div className="border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {/* Role Combobox */}
        <div className="border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`w-full bg-gray-900 outline-none ${role ? 'text-white' : 'text-gray-400'}`}
          >
            <option value="">Seleccionar Rol</option>
            <option value="1">Administrador</option>
            <option value="2">Supervisor</option>
            <option value="3">Agente</option>
          </select>
        </div>

        {/* Save Button */}
        <div>
          <button
            disabled={!isFormValid}
            onClick={createAgent}
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
