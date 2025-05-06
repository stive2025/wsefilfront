import { useState, useCallback, useContext, useEffect } from 'react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { createAutoMessage, updateAutoMessage } from "/src/services/AutoMessages.js";
import { UpdateAutoForm, AutoHandle, AutoCreateForm } from "/src/contexts/chats.js";
import { BotMessageSquare } from 'lucide-react';
import { ABILITIES } from '/src/constants/abilities.js';
import AbilityGuard from '/src/components/common/AbilityGuard.jsx';
import { useTheme } from "/src/contexts/themeContext";

const TagCreationModal = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { autoFind, setAutoFind } = useContext(UpdateAutoForm);
  const { setAutoHandle } = useContext(AutoHandle);
  const { setAutoClick } = useContext(AutoCreateForm);
  const { theme } = useTheme();

  const [labelName, setLabelName] = useState('');
  const [labelDescription, setLabelDescription] = useState('');
  const [idAuto, setIdAuto] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isFormValid = labelName.trim() && labelDescription.trim();

  useEffect(() => {
    // If we're in edit mode (tagFind exists), make sure the form stays open
    if (autoFind) {
      setAutoClick(true);
    }
  }, [autoFind, setAutoClick]);

  useEffect(() => {
    if (autoFind) {
      setIdAuto(autoFind.id);
      setLabelName(autoFind.name || '');
      setLabelDescription(autoFind.description || '');
    }
  }, [autoFind]);

  // Effect to clear success message
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
    setAutoFind(null);
    setLabelName('');
    setLabelDescription('');
  };

  const handleCreateTag = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);

        const formAutoData = {
          "name": labelName,
          "description": labelDescription
        };

        try {
          const response = await callEndpoint(createAutoMessage(formAutoData));
          setSuccess("Mensaje Automático creado con éxito", response);
          setAutoHandle(true);

          // Reset the form
          setLabelName('');
          setLabelDescription('');
        } catch (error) {
          console.error("Error creando Mensaje Automático ", error);
          setError("Error al crear el Mensaje Automático: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [labelName, labelDescription, isFormValid, callEndpoint, setAutoHandle]
  );

  const handleUpdateTag = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);

        const formAutoData = {
          "name": labelName,
          "description": labelDescription
        };

        try {
          const response = await callEndpoint(updateAutoMessage(idAuto, formAutoData));
          setSuccess("Mensaje Automático actualizado con éxito", response);
          setAutoHandle(true);
          setAutoFind(null);

          // Reset the form
          setLabelName('');
          setLabelDescription('');
        } catch (error) {
          console.error("Error actualizando Mensaje Automático ", error);
          setError("Error al actualizar el Mensaje Automático: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [labelName, labelDescription, isFormValid, callEndpoint, idAuto, setAutoFind, setAutoHandle]
  );

  return (
    // Wrapping the entire component with AbilityGuard to check if user can access this component
    <AbilityGuard abilities={[autoFind ? ABILITIES.UTILITIES.EDIT : ABILITIES.UTILITIES.CREATE]}>
      <div className={`bg-[rgb(var(--color-bg-${theme}))] rounded-lg w-full p-6 space-y-4 ${isMobile ? "" : "mt-16"} h-max`}>
        <div className={`flex items-center p-4 bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg`}>
          <BotMessageSquare size={20} className={`text-[rgb(var(--color-secondary-${theme}))] mr-4`} />
          <h1 className={`text-xl font-normal text-[rgb(var(--color-text-primary-${theme}))]`}>
            {autoFind ? 'EDITAR MENSAJE AUTOMÁTICO' : 'NUEVO MENSAJE AUTOMÁTICO'}
          </h1>
        </div>

        <div className={`mb-6 border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
          <label
            htmlFor="label-name"
            className={`block text-sm font-medium text-[rgb(var(--color-text-secondary-${theme}))] mb-2`}
          >
            Nombre del Mensaje Automático
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

        <div className={`mb-6 border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
          <label
            htmlFor="label-description"
            className={`block text-sm font-medium text-[rgb(var(--color-text-secondary-${theme}))] mb-2`}
          >
            Descripción
          </label>
          <textarea
            id="label-description"
            placeholder="¿Para que sirve este Mensaje Automático?"
            value={labelDescription}
            onChange={(e) => setLabelDescription(e.target.value)}
            className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none`}
          />
        </div>

        {/* Error and Success Messages */}
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
        {autoFind ? (
          <AbilityGuard abilities={[ABILITIES.UTILITIES.EDIT]}>
            <div className='flex space-x-4'>
              <button
                onClick={handleUpdateTag}
                disabled={!isFormValid || loading}
                className={`py-2 px-4 rounded bg-[rgb(var(--color-primary-${theme}))] 
                text-[rgb(var(--color-text-primary-${theme}))] transition-colors duration-300 
                hover:bg-[rgb(var(--color-secondary-${theme}))] disabled:opacity-50 disabled:cursor-not-allowed`}
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
              onClick={handleCreateTag}
              disabled={!isFormValid || loading}
              className={`w-full py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed 
              transition-colors duration-300 text-[rgb(var(--color-text-primary-${theme}))] cursor-pointer 
              bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))]`}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </AbilityGuard>
        )}
      </div>
    </AbilityGuard>
  );
};

export default TagCreationModal;