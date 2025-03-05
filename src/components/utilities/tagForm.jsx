import { useState } from 'react';

// eslint-disable-next-line react/prop-types
const LabelCreationModal = ({ onSave }) => {
  const [labelName, setLabelName] = useState('');
  const [labelDescription, setLabelDescription] = useState('');

  const handleSave = () => {
    if (labelName.trim()) {
      onSave({
        name: labelName,
        description: labelDescription
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 space-y-4">
        <div>
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
            placeholder="¿Para que sirve esta etiqueta?"
            value={labelDescription}
            onChange={(e) => setLabelDescription(e.target.value)}
            className="w-full bg-gray-700 border-none text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={!labelName.trim()}
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 
                     disabled:bg-gray-600 disabled:cursor-not-allowed 
                     transition-colors duration-300"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default LabelCreationModal;