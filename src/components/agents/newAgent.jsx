import { useState, useCallback, useContext, useEffect } from 'react';
import { User, CheckSquare, Settings } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndLoad.jsx";
import { createAgent, updateAgent } from "/src/services/agents.js";
import { UpdateAgentForm, AgentHandle, NewAgentForm } from "/src/contexts/chats.js";
import { ABILITIES, ROLES, ROLE_DEFAULT_ABILITIES } from "/src/constants/abilities.js";

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
  const [showAbilitiesModal, setShowAbilitiesModal] = useState(false);
  const [selectedAbilities, setSelectedAbilities] = useState([]);

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && password.trim() && role;
  const isFormValidForUpdate = firstName.trim() && lastName.trim() && email.trim() && role;

  useEffect(() => {
    // If we're in edit mode (agentFind exists), make sure the form stays open
    if (agentFind) {
      // This will ensure the form stays open when switching between mobile and desktop
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
      setPassword('');

      // Manejo mejorado de abilities
      if (agentFind.abilities) {
        console.log("Abilities originales:", agentFind.abilities);

        try {
          let parsedAbilities;

          if (Array.isArray(agentFind.abilities)) {
            parsedAbilities = [...agentFind.abilities]; // Crea una copia para evitar referencias
          }
          else if (typeof agentFind.abilities === 'string') {
            // Si ya es un string que parece un JSON array
            if (agentFind.abilities.startsWith('[') && agentFind.abilities.endsWith(']')) {
              parsedAbilities = JSON.parse(agentFind.abilities);
            }
            // Si es un string con comillas extras (formato incorrecto de BD)
            else {
              const cleanedAbilitiesString = agentFind.abilities
                .replace(/^"+|"+$/g, '')  // Quita comillas al inicio y final
                .replace(/\\"/g, '"');     // Reemplaza \" por "
              parsedAbilities = JSON.parse(cleanedAbilitiesString);
            }
          }

          console.log("Parsed Abilities:", parsedAbilities);
          console.log("Tipo:", typeof parsedAbilities, "Es array:", Array.isArray(parsedAbilities));

          if (Array.isArray(parsedAbilities)) {
            // Usamos setTimeout para asegurar que este cambio de estado ocurra después
            // de los demás cambios de estado iniciales
            setTimeout(() => {
              setSelectedAbilities(parsedAbilities);
              console.log("selectedAbilities actualizado en useEffect:", parsedAbilities);
            }, 0);
          } else {
            console.error("Las abilities parseadas no son un array", parsedAbilities);
            setSelectedAbilities([]);
          }
        } catch (e) {
          console.error("Error parsing abilities", e);
          setSelectedAbilities([]);
        }
      } else {
        setSelectedAbilities([]);
      }
    }
  }, [agentFind]);

  useEffect(() => {
    console.log("Estado de selectedAbilities actualizado:", selectedAbilities);
  }, [selectedAbilities]);
  // Actualizar las habilidades cuando cambia el rol
  useEffect(() => {
    if (role) {
      // Mapear el valor del rol a la clave del objeto ROLES
      let roleKey;
      switch (role) {
        case '1': roleKey = ROLES.ADMIN; break;
        case '2': roleKey = ROLES.SUPERVISOR; break;
        case '3': roleKey = ROLES.AGENT; break;
        case '4': roleKey = ROLES.READONLY; break;
        default: roleKey = null;
      }

      if (roleKey && ROLE_DEFAULT_ABILITIES[roleKey]) {
        setSelectedAbilities(ROLE_DEFAULT_ABILITIES[roleKey]);
      } else {
        setSelectedAbilities([]);
      }
    }
  }, [role]);

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
    setSelectedAbilities([]);
  };
  const toggleAbilitySelection = (ability) => {
    console.log("Toggle ability:", ability);
    console.log("Estado actual:", selectedAbilities);

    setSelectedAbilities(prevAbilities => {
      // Verificar que prevAbilities sea un array
      const currentAbilities = Array.isArray(prevAbilities) ? prevAbilities : [];

      // Verificar si la habilidad ya existe
      const exists = currentAbilities.includes(ability);
      console.log("¿Existe ya?", exists);

      if (exists) {
        // Quitar la habilidad
        const newAbilities = currentAbilities.filter(a => a !== ability);
        console.log("Quitando ability, nuevo estado:", newAbilities);
        return newAbilities;
      } else {
        // Agregar la habilidad
        const newAbilities = [...currentAbilities, ability];
        console.log("Agregando ability, nuevo estado:", newAbilities);
        return newAbilities;
      }
    });
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
          "abilities": JSON.stringify(selectedAbilities),
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
          setSelectedAbilities([]);
        } catch (error) {
          console.error("Error creando agente ", error);
          setError("Error al crear el agente: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [firstName, lastName, email, password, role, selectedAbilities, isFormValid, callEndpoint]
  );

  const handleUpdateAgent = useCallback(
    async () => {
      if (isFormValidForUpdate) {
        setError(null);

        // Hacemos una copia del estado para evitar posibles problemas con la serialización
        const abilitiesToSend = [...selectedAbilities];

        const formAgentData = {
          "name": `${firstName} ${lastName}`,
          "email": email,
          "role": role,
          "abilities": JSON.stringify(abilitiesToSend),
        };

        console.log("Datos a enviar:", formAgentData);
        console.log("Abilities a enviar:", abilitiesToSend);

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
          setSelectedAbilities([]);
        } catch (error) {
          console.error("Error actualizando agente ", error);
          setError("Error al actualizar el agente: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [firstName, lastName, email, role, selectedAbilities, isFormValidForUpdate, callEndpoint, idAgent, setAgentFind]
  );

  // Renderiza cada sección de habilidades
  const renderAbilitySection = (sectionName, abilities) => {
    console.log(`Renderizando sección ${sectionName}, selectedAbilities:`, selectedAbilities);

    return (
      <div key={sectionName} className="mb-4">
        <h3 className="text-[#FF9619] font-medium mb-2">{sectionName}</h3>
        <div className="space-y-2">
          {Object.entries(abilities).map(([abilityKey, abilityValue]) => {
            // Verificamos si la habilidad está seleccionada
            const isChecked = Array.isArray(selectedAbilities) &&
              selectedAbilities.includes(abilityValue);

            // Log para depuración
            console.log(`Checkbox ${abilityValue}: ${isChecked ? 'Seleccionado' : 'No seleccionado'}`);

            return (
              <div key={abilityValue} className="flex items-center">
                <input
                  type="checkbox"
                  id={abilityValue}
                  checked={isChecked}
                  onChange={() => toggleAbilitySelection(abilityValue)}
                  className="mr-2 h-4 w-4 accent-[#FF9619]"
                />
                <label htmlFor={abilityValue} className="text-sm text-gray-300">
                  {abilityKey}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
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
            <option value="4">Solo Lectura</option>
          </select>
        </div>

        {/* Botón para gestionar permisos */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAbilitiesModal(true)}
            className="flex items-center space-x-2 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
          >
            <Settings size={18} className="text-[#FF9619]" />
            <span>
              Gestionar Permisos ({Array.isArray(selectedAbilities) ? selectedAbilities.length : 0})
            </span>
          </button>
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

      {/* Modal de Abilities */}
      {showAbilitiesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-white font-medium flex items-center">
                <CheckSquare size={20} className="text-[#FF9619] mr-2" />
                Configurar Permisos
              </h2>
              <button
                onClick={() => setShowAbilitiesModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 text-sm">
                Total de permisos seleccionados: {Array.isArray(selectedAbilities) ? selectedAbilities.length : 0}
              </p>
            </div>

            <div className="space-y-6">
              {renderAbilitySection('Listado de Chats', ABILITIES.CHATS)}
              {renderAbilitySection('Panel de Chat', ABILITIES.CHAT_PANEL)}
              {renderAbilitySection('Utilidades', ABILITIES.UTILITIES)}
              {renderAbilitySection('Contactos', ABILITIES.CONTACTS)}
              {renderAbilitySection('Agentes', ABILITIES.AGENTS)}
              {renderAbilitySection('Perfil', ABILITIES.PROFILE)}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAbilitiesModal(false)}
                className="py-2 px-4 bg-[#FF9619] hover:bg-[#e68000] text-white rounded-md"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAgent;