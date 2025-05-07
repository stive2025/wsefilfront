import { useState, useCallback, useContext, useEffect, useRef } from 'react';
import Resize from "@/hooks/responsiveHook.jsx";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { createTag, updateTag } from "@/services/tags.js";
import { UpdateTagForm, TagHandle, TagsCreateForm } from "@/contexts/chats.js";
import { Tag } from 'lucide-react';
import toast from "react-hot-toast";
import AbilityGuard from '@/components/common/AbilityGuard.jsx';
import { ABILITIES } from "@/constants/abilities.js";
import { useTheme } from "@/contexts/themeContext";

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
  const { theme } = useTheme();

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
  }, [tagFind, setTagsClick]);

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
  }, [labelName, labelDescription, labelColor, callEndpoint, setTagHandle, setTagsClick, isFormValid]);

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
  }, [labelName, labelDescription, labelColor, callEndpoint, idTag, setTagFind, setTagHandle, setTagsClick, isFormValid]);

  // Envolver el componente completo con AbilityGuard
  return (
    <AbilityGuard abilities={[tagFind ? ABILITIES.UTILITIES.EDIT : ABILITIES.UTILITIES.CREATE]}>
      <div
        ref={modalRef}
        className={`bg-[rgb(var(--color-bg-${theme}))] rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}
      >
        <div className={`flex items-center p-4 bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-lg`}>
          <Tag size={20} className={`text-[rgb(var(--color-secondary-${theme}))] mr-4`} />
          <h1 className={`text-xl font-normal text-[rgb(var(--color-text-primary-${theme}))]`}>
            {tagFind ? 'EDITAR ETIQUETA' : 'NUEVA ETIQUETA'}
          </h1>
        </div>

        <div className="p-4 flex-1 flex flex-col space-y-6">
          {/* Nombre */}
          <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2 focus-within:border-[rgb(var(--color-primary-${theme}))]`}>
            <label
              htmlFor="label-name"
              className={`block text-sm font-medium text-[rgb(var(--color-text-secondary-${theme}))] mb-2`}
            >
              Nombre de la Etiqueta
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
              placeholder="¿Para qué sirve esta etiqueta?"
              value={labelDescription}
              onChange={(e) => setLabelDescription(e.target.value)}
              className={`w-full bg-transparent text-[rgb(var(--color-text-primary-${theme}))] outline-none`}
            />
          </div>

          {/* Color */}
          <div className={`border-b border-[rgb(var(--color-text-secondary-${theme}))] pb-2`}>
            <label
              htmlFor="label-color"
              className={`block text-sm font-medium text-[rgb(var(--color-text-secondary-${theme}))] mb-2`}
            >
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
      </div>
    </AbilityGuard>
  );
};

export default TagCreationModal;