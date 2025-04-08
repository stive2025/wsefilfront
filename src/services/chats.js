import CustomFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const getChatList = (params = {}) => {
  const abortController = loadAbort();
  
  // Construir la URL con los parámetros
  let endpoint = "chats";
  const queryParams = new URLSearchParams();
  
  // Agregar paginación si existe
  if (params.page) {
    queryParams.append('page', params.page);
  }
  
  // Agregar filtro por nombre si existe
  if (params.name) {
    queryParams.append('name', params.name);
  }
  
  // Agregar filtro por etiqueta si existe
  if (params.tag) {
    queryParams.append('tag', params.tag);
  }
  
  // Agregar filtro por agente si existe
  if (params.agent_id) {
    queryParams.append('agent_id', params.agent_id);
  }
  
  // Añadir los parámetros a la URL si existen
  const queryString = queryParams.toString();
  if (queryString) {
    endpoint = `${endpoint}?${queryString}`;
  }
  
  return {
    call: CustomFetch(endpoint, { signal: abortController.controller.signal }),
    abortController,
  };
};

const getChat = (chatId) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`chats/${chatId}`, {
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const createChat = (messageData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch("chats", {
      method: "POST",
      body: JSON.stringify(messageData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const updateChat = (chatId, chatData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify(chatData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const deleteChat = (id) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`chats/${id}`, {
      method: "DELETE",
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

export { getChatList, createChat, deleteChat, updateChat, getChat };