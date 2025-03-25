import { useState, useCallback, useContext, useEffect } from 'react';
import { User } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndLoad.jsx"; 
import { createAgent, updateAgent } from "/src/services/agents.js";
import { UpdateAgentForm, AgentHandle, NewAgentForm } from "/src/contexts/chats.js";

const NewAgent = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { agentFind, setAgentFind } = useContext(UpdateAgentForm);
  const { setAgentHandle } = useContext(AgentHandle);
  const { setAgentNew } = useContext(NewAgentForm);


  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [idAgent, setIdAgent] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && password.trim() && role;
  const isFormValidForUpdate = firstName.trim() && lastName.trim() && email.trim() && role;

  useEffect(() => {
    // If we're in edit mode (agentFind exists), make sure the form stays open
    if (agentFind) {
      // This will ensure the form stays open when switching between mobile and desktop
      // Import or get reference to setAgentNew if it's not already in this component
       setAgentNew(true);
    }
  }, [isMobile, agentFind]);


  useEffect(() => {
    if (agentFind) {
      console.log("Agente a editar ", agentFind);
      const [fName, lName] = agentFind.name.split(' ');
      setIdAgent(agentFind.id);
      setFirstName(fName || '');
      setLastName(lName || '');
      setEmail(agentFind.email || '');
      setRole(agentFind.role || '');
      setPassword(''); // Por seguridad, no mostrar la contraseña
    }
  }, [agentFind]);

  // Efecto para limpiar el mensaje de éxito después de un tiempo
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success]);


  const handleCancelEdit = () => {
    setError(null);
    setSuccess(false);
    setAgentFind(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRole('');
  };

  const handleCreateAgent = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);

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
          setSuccess("Agente creado con éxito");
          setAgentHandle(true);
         
          // Resetear el formulario
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setRole('');
        } catch (error) {
          console.error("Error creando agente ", error);
          setError("Error al crear el agente: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [firstName, lastName, email, password, role, isFormValid, callEndpoint]
  );

  const handleUpdateAgent = useCallback(
    async () => {
      if (isFormValidForUpdate) {
        setError(null);

        const formAgentData = {
          "name": `${firstName} ${lastName}`,
          "email": email,
          "role": role,
          "abilities": "abilitie1",
        };

        try {
          const response = await callEndpoint(updateAgent(idAgent, formAgentData));
          console.log("Agente actualizado ", response);
          setSuccess("Agente actualizado con éxito");
          setAgentHandle(true);
          setAgentFind(null);
          
          // Resetear el formulario
          setFirstName('');
          setLastName('');
          setEmail('');
          setRole('');
        } catch (error) {
          console.error("Error actualizando agente ", error);
          setError("Error al actualizar el agente: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [firstName, lastName, email, role, isFormValidForUpdate, callEndpoint, idAgent, setAgentFind]
  );

  return (
    <div className={`bg-gray-900 rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800 rounded-lg">
        <User size={20} className="text-[#FF9619] mr-4" />
        <h1 className="text-xl font-normal">{agentFind ? 'Editar Agente' : 'Nuevo Agente'}</h1>
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

        {/* Password - solo se muestra en modo creación */}
        {!agentFind && (
          <div className="border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-white outline-none"
            />
          </div>
        )}

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
           {success}
          </div>
        )}

        {/* Save Button */}
        <div>
          {agentFind ? (
            <div className='flex space-x-4'>
              <button
                onClick={handleUpdateAgent}
                disabled={!isFormValidForUpdate || loading}
                className="py-2 px-4 rounded bg-naranja-base text-white transition-colors duration-300 hover:bg-naranja-medio disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Actualizar'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="py-2 px-4 rounded bg-red-500 text-white"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              disabled={!isFormValid || loading}
              onClick={handleCreateAgent}
              className="w-full py-3 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAgent;