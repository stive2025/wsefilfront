import { useState, useCallback, useContext, useEffect, useRef } from 'react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { createTag, updateTag } from "/src/services/tags.js";
import { UpdateTagForm, TagHandle, TagsCreateForm } from "/src/contexts/chats.js";
import { Tag } from 'lucide-react';
import toast from "react-hot-toast";

const TagCreationModal = () => {
  const isMobile = Resize();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { tagFind, setTagFind } = useContext(UpdateTagForm);
  const { setTagHandle } = useContext(TagHandle);
  const { setTagsClick } = useContext(TagsCreateForm);
  const [labelName, setLabelName] = useState('');
  const [labelDescription, setLabelDescription] = useState('');
  const [labelColor, setLabelColor] = useState('#FFFFFF');
  const [idTag, setIdTag] = useState('');

  const isFormValid = labelName.trim() && labelDescription.trim();
  const modalRef = useRef(null);

  // Scroll al abrir
  useEffect(() => {
    modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tagFind]);

  // Modo edición
  useEffect(() => {
    if (tagFind) {
      setTagsClick(true);
      setIdTag(tagFind.id);
      setLabelName(tagFind.name || '');
      setLabelDescription(tagFind.description || '');
      setLabelColor(tagFind.color || "#FFFFFF");
    }
  }, [tagFind]);

  // Cancelar edición
  const handleCancelEdit = () => {
    setTagFind(null);
    setLabelName('');
    setLabelDescription('');
    setLabelColor("#FFFFFF");
    setTagsClick(false); // Cierra el modal
  };

  // Crear etiqueta
  const handleCreateTag = useCallback(async () => {
    if (isFormValid) {
      const formTagData = {
        name: labelName,
        description: labelDescription,
        color: labelColor
      };
      try {
        await callEndpoint(createTag(formTagData));
        toast.success("Etiqueta creada con éxito");
        setTagHandle(true);
        setLabelName('');
        setLabelDescription('');
        setLabelColor('#FFFFFF');
        setTagsClick(false); // Cierra el modal
      } catch (error) {
        toast.error("Error al crear la etiqueta: " + (error.message || "Verifica la conexión"));
      }
    }
  }, [labelName, labelDescription, labelColor, callEndpoint]);

  // Editar etiqueta
  const handleUpdateTag = useCallback(async () => {
    if (isFormValid) {
      const formTagData = {
        name: labelName,
        description: labelDescription,
        color: labelColor
      };
      try {
        await callEndpoint(updateTag(idTag, formTagData));
        toast.success("Etiqueta actualizada con éxito");
        setTagHandle(true);
        setTagFind(null);
        setLabelName('');
        setLabelDescription('');
        setLabelColor('#FFFFFF');
        setTagsClick(false); // Cierra el modal
      } catch (error) {
        toast.error("Error al actualizar la etiqueta: " + (error.message || "Verifica la conexión"));
      }
    }
  }, [labelName, labelDescription, labelColor, callEndpoint, idTag]);

  return (
    <div
      ref={modalRef}
      className={`rounded-lg w-full p-6 space-y-4 ${isMobile ? "" : "mt-16"} max-h-[80vh] overflow-y-auto animate-fadeIn`}
    >
      <div className="flex items-center p-4 bg-gray-800 rounded-lg animate-slideDown">
        <Tag size={20} className="text-[#FF9619] mr-4" />
        <h1 className="text-xl font-normal">
          {tagFind ? 'EDITAR ETIQUETA' : 'NUEVA ETIQUETA'}
        </h1>
      </div>

      {/* Nombre */}
      <div className="mb-6 border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
        <label htmlFor="label-name" className="block text-sm font-medium text-gray-300 mb-2">
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

      {/* Descripción */}
      <div className="mb-6 border-b border-gray-700 pb-2 focus-within:border-[#FF9619]">
        <label htmlFor="label-description" className="block text-sm font-medium text-gray-300 mb-2">
          Descripción
        </label>
        <textarea
          id="label-description"
          placeholder="¿Para qué sirve esta etiqueta?"
          value={labelDescription}
          onChange={(e) => setLabelDescription(e.target.value)}
          className="w-full bg-transparent text-white outline-none"
        />
      </div>

      {/* Color */}
      <div className="mb-6 border-b border-gray-700 pb-2">
        <label htmlFor="label-color" className="block text-sm font-medium text-gray-300 mb-2">
          Color de la Etiqueta
        </label>
        <input
          id="label-color"
          type="color"
          value={labelColor}
          onChange={(e) => setLabelColor(e.target.value)}
          className="w-16 h-10 p-0 border-none bg-transparent"
        />
      </div>

      {/* Botones */}
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
          className="w-full py-3 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      )}
    </div>
  );
};

export default TagCreationModal;
