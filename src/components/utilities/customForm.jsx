import { useState } from 'react';
import Resize from "/src/hooks/responsiveHook.jsx";

// eslint-disable-next-line react/prop-types
const CustomForm = ({ onSave }) => {
  const [labelName, setLabelName] = useState('');
  const [labelDescription, setLabelDescription] = useState('');
  const isMobile = Resize();

  const handleSave = () => {
    if (labelName.trim()) {
      onSave({
        name: labelName,
        description: labelDescription
      });
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg w-full p-6 space-y-4 ${isMobile?"":"mt-16"} h-max`}>
      <h1 className="block text-sm font-medium text-gray-300 mb-2 "
      >NUEVO MENSAJE  PERSONALIZADO
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
          placeholder="¿Que mensaje deseas enviar?"
          value={labelDescription}
          onChange={(e) => setLabelDescription(e.target.value)}
          className="w-full bg-gray-700 border-none text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 min-h-[10px]"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!labelName.trim()}
        className="w-full py-3 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-600
                     transition-colors duration-300 text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio"
      >
        Guardar
      </button>
    </div>

  );
};

export default CustomForm;