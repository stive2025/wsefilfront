import { useState, useCallback, useContext, useEffect } from 'react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { createCustomMessage, updateCustomMessage } from "/src/services/customMessages.js";
import { UpdateCustomForm, CustomHandle, CustomCreateForm } from "/src/contexts/chats.js";

const TagCreationModal = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { customFind, setCustomFind } = useContext(UpdateCustomForm);
  const { setCustomHandle } = useContext(CustomHandle);
  const { setCustomClick } = useContext(CustomCreateForm);

  const [labelName, setLabelName] = useState('');
  const [labelDescription, setLabelDescription] = useState('');
  const [idCustom, setIdCustom] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isFormValid = labelName.trim() && labelDescription.trim();

  useEffect(() => {
    // If we're in edit mode (tagFind exists), make sure the form stays open
    if (customFind) {
      setCustomClick(true);
    }
  }, [customFind]);

  useEffect(() => {
    if (customFind) {
      setIdCustom(customFind.id);
      setLabelName(customFind.name || '');
      setLabelDescription(customFind.description || '');
    }
  }, [customFind]);

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
    setCustomFind(null);
    setLabelName('');
    setLabelDescription('');
  };

  const handleCreateTag = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);

        const formCustomData = {
          "name": labelName,
          "description": labelDescription
        };

        try {
          const response = await callEndpoint(createCustomMessage(formCustomData));
          setSuccess("Mensaje personalizado creada con éxito", response);
          setCustomHandle(true);
         
          // Reset the form
          setLabelName('');
          setLabelDescription('');
        } catch (error) {
          console.error("Error creando Mensaje personalizado ", error);
          setError("Error al crear la Mensaje personalizado: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [labelName, labelDescription, isFormValid, callEndpoint]
  );

  const handleUpdateTag = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);

        const formCustomData = {
          "name": labelName,
          "description": labelDescription
        };

        try {
          const response = await callEndpoint(updateCustomMessage(idCustom, formCustomData));
          setSuccess("Mensaje personalizado actualizada con éxito", response);
          setCustomHandle(true);
          setCustomFind(null);
          
          // Reset the form
          setLabelName('');
          setLabelDescription('');
        } catch (error) {
          console.error("Error actualizando Mensaje personalizado ", error);
          setError("Error al actualizar la Mensaje personalizado: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [labelName, labelDescription, isFormValid, callEndpoint, idCustom, setCustomFind]
  );

  return (
    <div className={`bg-gray-800 rounded-lg w-full p-6 space-y-4 ${isMobile?"":"mt-16"} h-max`}>
      <h1 className="block text-sm font-medium text-gray-300 mb-2">
        {customFind ? 'EDITAR MENSAJE PERSONALIZADO' : 'NUEVO MENSAJE PERSONALIZADO'}
      </h1>
      
      <div>
        <label
          htmlFor="label-name"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Nombre del Mensaje Personalizado
        </label>
        <input
          id="label-name"
          type="text"
          placeholder="Introduzca el nombre"
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
          className="w-full bg-gray-700 border-none text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="label-description"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Descripción
        </label>
        <textarea
          id="label-description"
          placeholder="¿Para que sirve este Mensaje personalizado?"
          value={labelDescription}
          onChange={(e) => setLabelDescription(e.target.value)}
          className="w-full bg-gray-700 border-none text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 min-h-[10px]"
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
      {customFind ? (
        <div className='flex space-x-4'>
          <button
            onClick={handleUpdateTag}
            disabled={!isFormValid || loading}
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
          onClick={handleCreateTag}
          disabled={!isFormValid || loading}
          className="w-full py-3 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed
                       transition-colors duration-300 text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      )}
    </div>
  );
};

export default TagCreationModal;