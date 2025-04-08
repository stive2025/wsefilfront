import CustomFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const getTags = (params = {}) => {
  const abortController = loadAbort();
  
  // Construir la URL con los parámetros
  let endpoint = "tags";
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

const getTag = (id) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`tags/${id}`, {
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const createTag = (tagData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch("tags", {
      method: "POST",
      body: JSON.stringify(tagData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const updateTag = (id, tagData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`tags/${id}`, {
      method: "PATCH",
      body: JSON.stringify(tagData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const deleteTag = (id) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`tags/${id}`, {
      method: "DELETE",
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

export { getTags, createTag, deleteTag, updateTag, getTag };