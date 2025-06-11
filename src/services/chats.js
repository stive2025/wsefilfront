import CustomFetch from "@/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const getChatList = (params = {}) => {
  const abortController = loadAbort();
  console.log("params", params);
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
   if (params.phone) {
    queryParams.append('phone', params.phone);
  }
   // Agregar filtro por etiqueta si existe
  if (params.id_tag) {
    queryParams.append('tag_id', params.id_tag);
  }
  // Agregar filtro por agente si existe
  if (params.agent_id) {
    queryParams.append('user_id', params.agent_id);
    console.log("params.agent_id", queryParams);
  }
  if (params.state) {
    queryParams.append('state', params.state);
  }
  
  // Añadir los parámetros a la URL si existen
  const queryString = queryParams.toString();
  console.log("queryString", queryString);
  if (queryString) {
    endpoint = `${endpoint}?${queryString}`;
  }
  
  return {
    call: CustomFetch(endpoint, { signal: abortController.controller.signal }),
    abortController,
  };
};

const getChat = (chatId, page = 1) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`chats/${chatId}?page=${page}`, {
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

const transferChat = (chatId, transferData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`chats/transfer/${chatId}`, {
      method: "PUT",
      body: JSON.stringify(transferData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const searchChat = (chatId, searchBody) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`chats/search/${chatId}`, {
      method: "POST",
      body: JSON.stringify(searchBody),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const downloadChat = (params) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`chats/download/${params}`, {
      signal: abortController.controller.signal,
      responseType: 'blob',  // Indicar que esperamos un blob
      method: 'GET'
    }),
    abortController,
  };
};






export { getChatList, createChat, deleteChat, updateChat, getChat, transferChat, searchChat, downloadChat };