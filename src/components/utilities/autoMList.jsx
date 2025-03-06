import { Pencil, Trash2, Plus } from 'lucide-react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { useContext } from "react";
import { AutoCreateForm } from "/src/contexts/chats.js"


const AutoList = () => {
  const isMobile = Resize();
  const { setAutoClick } = useContext(AutoCreateForm);
  const labels = [
    {
      id: 1,
      title: 'Saludo',
      Mensaje: 'Hola',
    },
    {
      id: 2,
      title: 'Agradecimiento',
      Mensaje: 'Gracias por su tiempo',
    },
    {
      id: 3,
      title: 'Info. Atención',
      Mensaje: 'Ahora no estamos atendiendo',
    },
    {
      id: 4,
      title: 'Direccion',
      Mensaje: 'Nuestra direccion es',
    },
    {
      id: 5,
      title: 'Menú',
      Mensaje: 'Marca 1,2,3 según el menú:...',
    }
  ];

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${isMobile ? "mx-auto" : "ml-16"} mt-16  max-h-[80vh] flex flex-col`}>
      <div className='flex items-center justify-between '>
        <h2 className="text-lg font-semibold mb-4 ">Mensajes Automáticos</h2>
        <button className={`rounded-full p-2 flex items-center justify-center shadow-lg text-white cursor-pointer rounded-full p-2 bg-naranja-base hover:bg-naranja-medio ${isMobile ? "" : "hidden"}`}
         onClick={() =>{setAutoClick (prev => !prev) }}>
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
                <p className="text-sm text-gray-400">{label.Mensaje}</p>
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

export default AutoList;