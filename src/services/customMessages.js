import CustomFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const getCustomMessages = (params = {}) => {
  const abortController = loadAbort();
  
  // Construir la URL con los parámetros
  let endpoint = "customMessages";
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
  if (params.customMessage) {
    queryParams.append('customMessage', params.customMessage);
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

const getCustomMessage = (id) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`customMessages/${id}`, {
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const createCustomMessage = (tagData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch("customMessages", {
      method: "POST",
      body: JSON.stringify(tagData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const updateCustomMessage = (id, tagData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`customMessages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(tagData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const deleteCustomMessage = (id) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`tags/${id}`, {
      method: "DELETE",
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

export { getCustomMessages, createCustomMessage, deleteCustomMessage, updateCustomMessage, getCustomMessage };