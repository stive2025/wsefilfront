import AutoFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const getAutoMessages = (params = {}) => {
  const abortController = loadAbort();
  
  // Construir la URL con los parámetros
  let endpoint = "AutoMessages";
  const queryParams = new URLSearchParams();
  
  // Agregar paginación si existe
  if (params.page) {
    queryParams.append('page', params.page);
  }
  
  // Agregar filtro por nombre si existe
  if (params.name) {
    queryParams.append('name', params.name);
  }
  
  // Agregar filtro por mensaje si existe
  if (params.AutoMessage) {
    queryParams.append('AutoMessage', params.AutoMessage);
  }
 
  // Añadir los parámetros a la URL si existen
  const queryString = queryParams.toString();
  if (queryString) {
    endpoint = `${endpoint}?${queryString}`;
  }
  
  return {
    call: AutoFetch(endpoint, { signal: abortController.controller.signal }),
    abortController,
  };
};

const getAutoMessage = (id) => {
  const abortController = loadAbort();
  return {
    call: AutoFetch(`AutoMessages/${id}`, {
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const createAutoMessage = (tagData) => {
  const abortController = loadAbort();
  return {
    call: AutoFetch("AutoMessages", {
      method: "POST",
      body: JSON.stringify(tagData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const updateAutoMessage = (id, tagData) => {
  const abortController = loadAbort();
  return {
    call: AutoFetch(`AutoMessages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(tagData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const deleteAutoMessage = (id) => {
  const abortController = loadAbort();
  return {
    call: AutoFetch(`tags/${id}`, {
      method: "DELETE",
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

export { getAutoMessages, createAutoMessage, deleteAutoMessage, updateAutoMessage, getAutoMessage };