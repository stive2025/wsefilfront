import { useState, useCallback, useContext, useEffect } from 'react';
import { User, CheckSquare, Settings } from 'lucide-react';
import Resize from "@/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "@/hooks/fechAndLoad.jsx";
import { createAgent, updateAgent } from "@/services/agents.js";
import { UpdateAgentForm, AgentHandle, NewAgentForm } from "@/contexts/chats.js";
import { ABILITIES, ROLES, ROLE_DEFAULT_ABILITIES } from "@/constants/abilities.js";
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { useTheme } from "@/contexts/themeContext";

const NewAgent = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { agentFind, setAgentFind } = useContext(UpdateAgentForm);
  const { setAgentHandle } = useContext(AgentHandle);
  const { setAgentNew } = useContext(NewAgentForm);
  const { theme } = useTheme();

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
  const [forceUpdate, setForceUpdate] = useState(0); // Estado para forzar re-renders

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && password.trim() && role;
  const isFormValidForUpdate = firstName.trim() && lastName.trim() && email.trim() && role;

  useEffect(() => {
    // Si estamos en modo edición (agentFind existe), asegurar que el formulario permanezca abierto
    if (agentFind) {
      setAgentNew(true);
    }
  }, [isMobile, agentFind, setAgentNew]);

  // Efecto para cargar los datos del agente cuando se está en modo edición
  useEffect(() => {
    if (agentFind) {
      const [fName, lName] = agentFind.name.split(' ');
      setIdAgent(agentFind.id);
      setFirstName(fName || '');
      setLastName(lName || '');
      setEmail(agentFind.email || '');
      setRole(agentFind.role || '');
      setPassword('');

      // Procesamiento mejorado de abilities
      if (agentFind.abilities) {
        try {
          let parsedAbilities;

          if (Array.isArray(agentFind.abilities)) {
            parsedAbilities = [...agentFind.abilities];
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

          if (Array.isArray(parsedAbilities)) {
            setSelectedAbilities(parsedAbilities);
            // Forzar actualización de la UI
            setForceUpdate(prev => prev + 1);
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

  // Actualizar las habilidades cuando cambia el rol (solo si no estamos en modo edición)
  useEffect(() => {
    if (role && !agentFind) {


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
        // Forzar actualización de la UI
        setForceUpdate(prev => prev + 1);
      } else {
        setSelectedAbilities([]);
      }
    }
  }, [role, agentFind]);

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
    setSelectedAbilities(prevAbilities => {
      // Verificar que prevAbilities sea un array
      const currentAbilities = Array.isArray(prevAbilities) ? prevAbilities : [];

      // Verificar si la habilidad ya existe
      const exists = currentAbilities.includes(ability);

      if (exists) {
        // Quitar la habilidad
        return currentAbilities.filter(a => a !== ability);
      } else {
        // Agregar la habilidad
        return [...currentAbilities, ability];
      }
    });

    // Forzar actualización de la UI
    setTimeout(() => {
      setForceUpdate(prev => prev + 1);
    }, 0);
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
    [firstName, lastName, email, password, role, selectedAbilities, isFormValid, callEndpoint, setAgentHandle]
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
    [firstName, lastName, email, role, selectedAbilities, isFormValidForUpdate, callEndpoint, idAgent, setAgentFind, setAgentHandle]
  );

  // Objeto de traducción para las secciones
  const SECTION_TRANSLATIONS = {
    'Listado de Chats': {
      title: 'Gestión de Conversaciones',
      abilities: {
        'VIEW': 'Ver lista de conversaciones',
        'SEARCH': 'Filtrar y buscar conversaciones',
        'FILTER_BY_AGENT': 'Filtrar por agente',
        'FILTER_BY_STATUS': 'Filtrar por estado',
        'FILTER_BY_TAG': 'Filtrar por etiqueta',
      }
    },
    'Panel de Chat': {
      title: 'Interacción con Chats',
      abilities: {
        'VIEW': 'Ver conversaciones en tiempo real',
        'SEND_TEXT': 'Enviar mensajes',
        'SEND_MEDIA': 'Enviar archivos multimedia',
        'SEARCH_MESSAGES': 'Buscar mensajes',
        'DOWNLOAD_HISTORY': 'Descargar historial de mensajes',
        'TRANSFER': 'Transferir conversaciones',
        'VIEW_CONTACT_INFO': 'Ver información de agente',
        'TAG_CHAT': 'Etiquetar conversaciones',
        'MARK_AS_FINISHED': 'Marcar como finalizado',
      }
    },
    'Utilidades': {
      title: 'Herramientas y Utilidades',
      abilities: {
        'VIEW': 'Ver herramientas',
        'CREATE': 'Crear nuevas herramientas',
        'EDIT': 'Modificar herramientas existentes',
        'DELETE': 'Eliminar herramientas',
        'SEARCH': 'Buscar herramientas',
      }
    },
    'Contactos': {
      title: 'Gestión de Contactos',
      abilities: {
        'CREATE': 'Crear nuevos contactos',
        'EDIT': 'Editar contactos existentes',
        'DELETE': 'Eliminar contactos',
        'SEARCH': 'Buscar contactos',
        'VIEW': 'Ver lista de contactos'
      }
    },
    'Agentes': {
      title: 'Gestión de Agentes',
      abilities: {
        'CREATE': 'Crear nuevos agentes',
        'EDIT': 'Modificar agentes existentes',
        'DELETE': 'Eliminar agentes',
        'SEARCH': 'Buscar agentes',
        'VIEW': 'Ver lista de agentes'
      }
    },
    'Perfil': {
      title: 'Configuración de Perfil',
      abilities: {
        'VIEW': 'Ver perfil propio',
        'SCAN_QR': 'Escanear QR',
        'CHANGE_PASSWORD': 'Cambiar contraseña',
      }
    }
  };

  // Modificar la función renderAbilitySection
  const renderAbilitySection = (sectionName, abilities) => {
    const sectionTranslation = SECTION_TRANSLATIONS[sectionName];

    return (
      <div key={sectionName} className="mb-6">
        <h3 className="text-[#FF9619] font-medium mb-3 text-lg">
          {sectionTranslation.title}
        </h3>
        <div className="space-y-3 pl-2">
          {Object.entries(abilities).map(([abilityKey, abilityValue]) => {
            const isChecked = Array.isArray(selectedAbilities) &&
              selectedAbilities.includes(abilityValue);

            const description = sectionTranslation.abilities[abilityKey] || abilityKey;

            return (
              <div key={abilityValue} className="flex items-center hover:bg-black/10 p-2 rounded-md">
                <input
                  type="checkbox"
                  id={`${abilityValue}-${forceUpdate}`}
                  checked={isChecked}
                  onChange={() => toggleAbilitySelection(abilityValue)}
                  className="mr-3 h-4 w-4 accent-[#FF9619]"
                />
                <label
                  htmlFor={`${abilityValue}-${forceUpdate}`}
                  className={`text-sm text-[rgb(var(--color-text-primary-${theme}))]`}
                >
                  {description}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Calcular contador de permisos seleccionados - asegurándonos que es un array válido
  const selectedAbilitiesCount = Array.isArray(selectedAbilities) ? selectedAbilities.length : 0;

  return (
    // Envolveremos todo el componente con un AbilityGuard para verificar si puede ver este componente
    <AbilityGuard abilities={[agentFind ? ABILITIES.AGENTS.EDIT : ABILITIES.AGENTS.CREATE]}>
      <div className={`bg-[rgb(var(--color-bg-${theme}))] rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
        {/* Header */}
        <div className={`flex items-center p-4 bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg`}>
          <User size={20} className={`text-[rgb(var(--color-secondary-${theme}))] mr-4`} />
          <h1 className={`text-xl font-normal text-[rgb(var(--color-text-primary-${theme}))]`}>
            {agentFind ? 'Editar Agente' : 'Nuevo Agente'}
          </h1>
        </div>

        {/* Form */}
        <div className="p-4 flex-1 flex flex-col space-y-6">
          {/* First Name */}
          <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
            <input
              type="text"
              placeholder="Nombres"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none`}
            />
          </div>

          {/* Last Name */}
          <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
            <input
              type="text"
              placeholder="Apellidos"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none`}
            />
          </div>

          {/* Email */}
          <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none`}
            />
          </div>

          {/* Password - solo se muestra en modo creación */}
          {!agentFind && (
            <AbilityGuard abilities={[ABILITIES.AGENTS.CREATE]}>
              <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none`}
                />
              </div>
            </AbilityGuard>
          )}

          {/* Role Combobox */}
          <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full bg-[rgb(var(--color-bg-${theme}))] outline-none ${role ? `text-[rgb(var(--color-text-primary-${theme}))]` : `text-[rgb(var(--color-text-secondary-${theme}))]`}`}
            >
              <option value="">Seleccionar Rol</option>
              <option value="1">Administrador</option>
              <option value="2">Supervisor</option>
              <option value="3">Agente</option>
              <option value="4">Solo Lectura</option>
            </select>
          </div>

          {/* Botón para gestionar permisos */}
          <AbilityGuard abilities={[agentFind ? ABILITIES.AGENTS.EDIT : ABILITIES.AGENTS.CREATE]}>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowAbilitiesModal(true)}
                className={`flex items-center space-x-2 py-2 px-4 bg-[rgb(var(--color-bg-${theme}-secondary))] hover:bg-[rgb(var(--color-primary-${theme}))] text-[rgb(var(--color-text-primary-${theme}))] rounded-md`}
              >
                <Settings size={18} className={`text-[rgb(var(--color-secondary-${theme}))]`} />
                <span>
                  Gestionar Permisos ({selectedAbilitiesCount})
                </span>
              </button>
            </div>
          </AbilityGuard>

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
              <AbilityGuard abilities={[ABILITIES.AGENTS.EDIT]}>
                <div className='flex space-x-4'>
                  <button
                    onClick={handleUpdateAgent}
                    disabled={!isFormValidForUpdate || loading}
                    className={`py-2 px-4 rounded bg-[rgb(var(--color-primary-${theme}))] text-[rgb(var(--color-text-primary-${theme}))] transition-colors duration-300 hover:bg-[rgb(var(--color-secondary-${theme}))] disabled:opacity-50 disabled:cursor-not-allowed`}
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
              </AbilityGuard>
            ) : (
              <AbilityGuard abilities={[ABILITIES.AGENTS.CREATE]}>
                <button
                  disabled={!isFormValid || loading}
                  onClick={handleCreateAgent}
                  className={`w-full py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))]`}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </AbilityGuard>
            )}
          </div>
        </div>

        {/* Modal de Abilities */}
        {showAbilitiesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl text-[rgb(var(--color-text-primary-${theme}))] font-medium flex items-center`}>
                  <CheckSquare size={20} className={`text-[rgb(var(--color-secondary-${theme}))] mr-2`} />
                  Configurar Permisos
                </h2>
                <button
                  onClick={() => setShowAbilitiesModal(false)}
                  className={`text-[rgb(var(--color-text-secondary-${theme}))] hover:text-[rgb(var(--color-text-primary-${theme}))]`}
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 text-sm">
                  Total de permisos seleccionados: {selectedAbilitiesCount}
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
    </AbilityGuard>
  );
};

export default NewAgent;