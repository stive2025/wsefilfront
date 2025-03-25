import { useState, useCallback, useContext, useEffect } from 'react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { createTag, updateTag } from "/src/services/tags.js";
import { UpdateTagForm, TagHandle, TagsCreateForm } from "/src/contexts/chats.js";
import { Tag } from 'lucide-react';


const TagCreationModal = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { tagFind, setTagFind } = useContext(UpdateTagForm);
  const { setTagHandle } = useContext(TagHandle);
  const { setTagsClick } = useContext(TagsCreateForm);

  const [labelName, setLabelName] = useState('');
  const [labelDescription, setLabelDescription] = useState('');
  const [idTag, setIdTag] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isFormValid = labelName.trim() && labelDescription.trim();

  useEffect(() => {
    // If we're in edit mode (tagFind exists), make sure the form stays open
    if (tagFind) {
      setTagsClick(true);
    }
  }, [tagFind]);

  useEffect(() => {
    if (tagFind) {
      setIdTag(tagFind.id);
      setLabelName(tagFind.name || '');
      setLabelDescription(tagFind.description || '');
    }
  }, [tagFind]);

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
    setTagFind(null);
    setLabelName('');
    setLabelDescription('');
  };

  const handleCreateTag = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);

        const formTagData = {
          "name": labelName,
          "description": labelDescription
        };

        try {
          const response = await callEndpoint(createTag(formTagData));
          setSuccess("Etiqueta creada con éxito", response);
          setTagHandle(true);

          // Reset the form
          setLabelName('');
          setLabelDescription('');
        } catch (error) {
          console.error("Error creando etiqueta ", error);
          setError("Error al crear la etiqueta: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [labelName, labelDescription, isFormValid, callEndpoint]
  );

  const handleUpdateTag = useCallback(
    async () => {
      if (isFormValid) {
        setError(null);

        const formTagData = {
          "name": labelName,
          "description": labelDescription
        };

        try {
          const response = await callEndpoint(updateTag(idTag, formTagData));
          setSuccess("Etiqueta actualizada con éxito", response);
          setTagHandle(true);
          setTagFind(null);

          // Reset the form
          setLabelName('');
          setLabelDescription('');
        } catch (error) {
          console.error("Error actualizando etiqueta ", error);
          setError("Error al actualizar la etiqueta: " + (error.message || "Verifica la conexión"));
        }
      }
    },
    [labelName, labelDescription, isFormValid, callEndpoint, idTag, setTagFind]
  );

  return (
    <div className={`rounded-lg w-full p-6 space-y-4 ${isMobile ? "" : "mt-16"} h-max`}>
      <div className="flex items-center p-4 bg-gray-800 rounded-lg">
        <Tag size={20} className="text-[#FF9619] mr-4" />
        <h1 className="text-xl font-normal">
        {tagFind ? 'EDITAR ETIQUETA' : 'NUEVA ETIQUETA'}
        </h1>
      </div>

      <div className="mb-6 border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
        <label
          htmlFor="label-name"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Nombre de la Etiqueta
        </label>
        <input
          id="label-name"
          type="text"
          placeholder="Introduzca el nombre"
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
          className="w-full bg-transparent text-white outline-none"
        />
      </div>

      <div className="mb-6 border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
        <label
          htmlFor="label-description"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Descripción
        </label>  
        <textarea
          id="label-description"
          placeholder="¿Para que sirve esta etiqueta?"
          value={labelDescription}
          onChange={(e) => setLabelDescription(e.target.value)}
          className="w-full bg-transparent text-white outline-none"
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
      {tagFind ? (
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