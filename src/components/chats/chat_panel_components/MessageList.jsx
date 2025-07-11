import React from "react";

const MessageList = ({ isLoading, isNewChat, hasMessages, renderMessagesWithDateSeparators, selectedChatId }) => {
  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
      style={{
        backgroundImage: `url('https://i.pinimg.com/736x/cd/3d/62/cd3d628f57875af792c07d6ad262391c.jpg')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      {isLoading && (
        <div className="flex justify-center py-4">
          <span className="animate-spin">Cargando...</span>
        </div>
      )}
      {isNewChat && !hasMessages ? (
        <div className="flex flex-col justify-center items-center h-full opacity-50">
          <p>Nuevo chat con {selectedChatId.name || selectedChatId.number}</p>
          <p className="text-sm mt-2">Escribe tu primer mensaje</p>
        </div>
      ) : (
        renderMessagesWithDateSeparators()
      )}
    </div>
  );
};

export default MessageList;
