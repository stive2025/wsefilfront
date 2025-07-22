import React from "react";

const ChatHeader = ({ /* props como nombre, acciones, etc. */ }) => {
  // Aquí puedes agregar los botones de acciones, nombre de usuario, estado, etc.
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white dark:bg-gray-900">
      {/* Aquí va el contenido del encabezado del chat */}
      <span className="font-bold text-lg">Chat Header</span>
      {/* Botones de acción, menú, etc. */}
    </div>
  );
};

export default ChatHeader;
