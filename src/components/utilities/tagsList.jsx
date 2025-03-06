import { Pencil, Trash2, Plus } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";


const TagList = () => {
  const isMobile = Resize();
  const labels = [
    {
      id: 1,
      title: 'Llamar mas tarde',
      description: 'Menú descripción',
    },
    {
      id: 2,
      title: 'Confirmar Pago',
      description: 'Menú descripción',
    },
    {
      id: 3,
      title: 'Pago Pendiente',
      description: 'Menú descripción',
    },
    {
      id: 4,
      title: 'Revisión',
      description: 'Menú descripción',
    },
    {
      id: 5,
      title: 'Pasar a Legal',
      description: 'Menú descripción',
    }
  ];

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${isMobile ? "mx-auto" : "ml-16"} mt-16  max-h-[80vh] flex flex-col`}>
      <div className='flex items-center justify-between '>
        <h2 className="text-lg font-semibold mb-4 ">Etiquetas</h2>
        <button className={`rounded-full p-2 flex items-center justify-center shadow-lg text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio ${isMobile ? "" : "hidden"}`}>
          <Plus size={10} />
        </button>
      </div>
      <div className={`bg-gray-800 rounded-lg p-4 overflow-y-auto scrollbar-hide  flex-grow`}>
        {labels.map((label) => (
          <div
            key={label.id}
            className={`flex items-center justify-between py-2 border-b border-gray-700`}>
            <div className="w-full flex items-center">
              <div>
                <p className="font-medium">{label.title}</p>
                <p className="text-sm text-gray-400">{label.description}</p>
              </div>
            </div>
            <div className="flex">
              <button className="mr-2 text-gray-400 hover:text-white">
                <Pencil size={16} />
              </button>
              <button className="text-gray-400 hover:text-white">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

  );
};

export default TagList;