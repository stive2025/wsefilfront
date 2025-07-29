/**
 * Utilidades para el manejo de chats
 */

/**
 * Formatea un timestamp para mostrar en la lista de chats
 * @param {string|Date} timestamp - Timestamp a formatear
 * @returns {string} Timestamp formateado
 */
export const formatTimestamp = (timestamp) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Resetear horas para comparación de fechas
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

  if (messageDateOnly.getTime() === todayDateOnly.getTime()) {
    // Hoy - mostrar solo hora
    return messageDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else if (messageDateOnly.getTime() === yesterdayDateOnly.getTime()) {
    // Ayer - mostrar "Ayer"
    return 'Ayer';
  } else {
    // Días anteriores - mostrar fecha
    return messageDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  }
};

/**
 * Obtiene una vista previa del mensaje para mostrar en la lista
 * @param {Object} message - Objeto del mensaje
 * @returns {string} Vista previa del mensaje
 */
export const getMessagePreview = (message) => {
  if (!message) return '';
  
  if (message.body) {
    // Limitar la longitud del mensaje
    const maxLength = 50;
    return message.body.length > maxLength 
      ? `${message.body.substring(0, maxLength)}...` 
      : message.body;
  }
  
  if (message.type === 'image') return '📷 Imagen';
  if (message.type === 'document') return '📄 Documento';
  if (message.type === 'audio') return '🎵 Audio';
  if (message.type === 'video') return '🎥 Video';
  if (message.type === 'location') return '📍 Ubicación';
  
  return 'Mensaje';
};

/**
 * Determina si un chat debe estar seleccionado
 * @param {number} chatId - ID del chat
 * @param {Object} selectedChatId - Chat actualmente seleccionado
 * @param {number} tempIdChat - ID temporal del chat
 * @returns {boolean} True si el chat está seleccionado
 */
export const isChatSelected = (chatId, selectedChatId, tempIdChat) => {
  if (tempIdChat && tempIdChat === chatId) {
    return true;
  }
  
  if (selectedChatId) {
    return selectedChatId.id === chatId;
  }
  
  return false;
};

/**
 * Crea un objeto de chat a partir de datos de mensaje
 * @param {Object} messageData - Datos del mensaje
 * @returns {Object} Objeto de chat formateado
 */
export const createChatFromMessage = (messageData) => {
  return {
    id: messageData.chat_id,
    contact_id: messageData.contact_id,
    name: messageData.contact_name || messageData.number || "Desconocido",
    number: messageData.number,
    last_message: getMessagePreview(messageData),
    timestamp: new Date(messageData.timestamp).toLocaleDateString(),
    updated_at: messageData.timestamp,
    avatar: messageData.profile_picture || "/avatar.jpg",
    unread_message: messageData.from_me === false || messageData.from_me === "false" ? 1 : 0,
    state: "PENDING",
    ack: messageData.ack,
    from_me: messageData.from_me?.toString(),
    tag_id: null,
    by_user: null
  };
};
