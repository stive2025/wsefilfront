import { useState, useCallback, useContext, useEffect } from 'react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndLoad.jsx";
import { createCustomMessage, updateCustomMessage } from "/src/services/customMessages.js";
import { UpdateCustomForm, CustomHandle, CustomCreateForm } from "/src/contexts/chats.js";
import { MailPlus } from 'lucide-react';
import AbilityGuard from '/src/components/common/AbilityGuard.jsx';
import { ABILITIES } from "/src/constants/abilities.js";
import { useTheme } from "/src/contexts/themeContext";

const CustomMessageForm = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { customFind, setCustomFind } = useContext(UpdateCustomForm);
  const { setCustomHandle } = useContext(CustomHandle);
  const { setCustomClick } = useContext(CustomCreateForm);
  const { theme } = useTheme();

  const [labelName, setLabelName] = useState('');
  const [labelDescription, setLabelDescription] = useState('');
  const [idCustom, setIdCustom] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isFormValid = labelName.trim() && labelDescription.trim();

  useEffect(() => {
    // Si estamos en modo edición (customFind existe), asegurar que el formulario permanezca abierto
    if (customFind) {
      setCustomClick(true);
    }
  }, [isMobile, customFind, setCustomClick]);

  // Efecto para cargar los datos del mensaje cuando se está en modo edición
  useEffect(() => {
    if (customFind) {
      setIdCustom(customFind.id);
      setLabelName(customFind.name || '');
      setLabelDescription(customFind.description || '');
    }
  }, [customFind]);

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
    setCustomFind(null);
    setLabelName('');
    setLabelDescription('');
  };

  const handleCreateCustomMessage = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);

        const formCustomData = {
          "name": labelName,
          "description": labelDescription
        };

        try {
          const response = await callEndpoint(createCustomMessage(formCustomData));
          console.log("Mensaje personalizado creado ", response);
          setSuccess("Mensaje personalizado creado con éxito");
          setCustomHandle(true);
         
          // Resetear el formulario
          setLabelName('');
          setLabelDescription('');
        } catch (error) {
          console.error("Error creando mensaje personalizado ", error);
          setError("Error al crear el mensaje personalizado: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [labelName, labelDescription, isFormValid, callEndpoint, setCustomHandle]
  );

  const handleUpdateCustomMessage = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);

        const formCustomData = {
          "name": labelName,
          "description": labelDescription
        };

        try {
          const response = await callEndpoint(updateCustomMessage(idCustom, formCustomData));
          console.log("Mensaje personalizado actualizado ", response);
          setSuccess("Mensaje personalizado actualizado con éxito");
          setCustomHandle(true);
          setCustomFind(null);
          
          // Resetear el formulario
          setLabelName('');
          setLabelDescription('');
        } catch (error) {
          console.error("Error actualizando mensaje personalizado ", error);
          setError("Error al actualizar el mensaje personalizado: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [labelName, labelDescription, isFormValid, callEndpoint, idCustom, setCustomFind, setCustomHandle]
  );

  return (
    // Envolveremos todo el componente con un AbilityGuard para verificar si puede ver este componente
    <AbilityGuard abilities={[customFind ? ABILITIES.UTILITIES.EDIT : ABILITIES.UTILITIES.CREATE]}>
      <div className={`bg-[rgb(var(--color-bg-${theme}))] rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
        {/* Header */}
        <div className={`flex items-center p-4 bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg`}>
          <MailPlus size={20} className={`text-[rgb(var(--color-secondary-${theme}))] mr-4`} />
          <h1 className={`text-xl font-normal text-[rgb(var(--color-text-primary-${theme}))]`}>
            {customFind ? 'Editar Mensaje Personalizado' : 'Nuevo Mensaje Personalizado'}
          </h1>
        </div>
        
        {/* Form */}
        <div className="p-4 flex-1 flex flex-col space-y-6">
          {/* Nombre */}
          <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
            <label
              htmlFor="label-name"
              className={`block text-sm font-medium text-[rgb(var(--color-text-secondary-${theme}))] mb-2`}
            >
              Nombre del Mensaje Personalizado
            </label>
            <input
              id="label-name"
              type="text"
              placeholder="Introduzca el nombre"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none`}
            />
          </div>

          {/* Descripción */}
          <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
            <label
              htmlFor="label-description"
              className={`block text-sm font-medium text-[rgb(var(--color-text-secondary-${theme}))] mb-2`}
            >
              Descripción
            </label>
            <textarea
              id="label-description"
              placeholder="¿Para qué sirve este mensaje personalizado?"
              value={labelDescription}
              onChange={(e) => setLabelDescription(e.target.value)}
              className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none`}
              rows={4}
            />
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
            {customFind ? (
              <AbilityGuard abilities={[ABILITIES.UTILITIES.EDIT]}>
                <div className='flex space-x-4'>
                  <button
                    onClick={handleUpdateCustomMessage}
                    disabled={!isFormValid || loading}
                    className={`py-2 px-4 rounded bg-[rgb(var(--color-primary-${theme}))] 
                      text-[rgb(var(--color-text-primary-${theme}))] transition-colors duration-300 
                      hover:bg-[rgb(var(--color-secondary-${theme}))] 
                      disabled:opacity-50 disabled:cursor-not-allowed`}
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
              <AbilityGuard abilities={[ABILITIES.UTILITIES.CREATE]}>
                <button
                  disabled={!isFormValid || loading}
                  onClick={handleCreateCustomMessage}
                  className={`w-full py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed 
                    transition-colors duration-300 text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer 
                    bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))]`}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </AbilityGuard>
            )}
          </div>
        </div>
      </div>
    </AbilityGuard>
  );
};

export default CustomMessageForm;