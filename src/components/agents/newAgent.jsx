import { useState, useCallback } from 'react';
import { User } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { createAgent } from "/src/services/agents.js";

const NewAgent = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && password.trim() && role;

  const handleCreateAgent = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);
        setSuccess(false);
        
        const formAgentData = {
          "name": `${firstName} ${lastName}`,
          "email": email,
          "role": role,
          "password": password,
          "abilities": "abilitie1",
        };
        
        try {
          const response = await callEndpoint(createAgent(formAgentData));
          console.log("Agente creado ", response);
          setSuccess(true);
          
          // Opcional: resetear el formulario
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setRole('');
        } catch (error) {
          console.error("Error creando agente ", error);
          setError("Error al crear el agente");
        }
      }
    },
    [firstName, lastName, email, password, role, isFormValid, callEndpoint]
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

        {/* Success and Error Messages */}
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-green-500 text-sm">
            Agente creado exitosamente
          </div>
        )}

        {/* Save Button */}
        <div>
          <button
            disabled={!isFormValid || loading}
            onClick={handleCreateAgent}
            className="w-full py-3 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-600
            transition-colors duration-300 text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAgent;