import CustomFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const getAgents = (params = {}) => {
  const abortController = loadAbort();
  
  // Construir la URL con los parámetros
  let endpoint = "users";
  const queryParams = new URLSearchParams();
  
  // Si hay búsqueda por nombre, solo usamos ese parámetro
  if (params.name) {
    queryParams.append('name', params.name);
  } 
  // Si no hay búsqueda por nombre pero hay paginación, usamos solo page
  else if (params.page) {
    queryParams.append('page', params.page);
  }
  
  // Añadir los parámetros a la URL si existen
  const queryString = queryParams.toString();
  if (queryString) {
    endpoint =`${endpoint}?${queryString}`;
  }
  
  return {
    call: CustomFetch(endpoint, { signal: abortController.controller.signal }),
    abortController,
  };
};

const getAgent = (userId) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`users/${userId}`, { signal: abortController.controller.signal }),
    abortController,
  };
};

const createAgent = (agentData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch("users", {
      method: "POST",
      body: JSON.stringify(agentData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const updateAgent = (userId, userData) => {  // No debe ser async
  const abortController = loadAbort();
  return {
    call: CustomFetch(`users/${userId}`, {  // Ahora es una función que se llama luego
      method: "PATCH",
      body: JSON.stringify(userData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const deleteAgents = (id) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`users/${id}`, {
      method: "DELETE",
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

export { getAgents, createAgent, deleteAgents, updateAgent, getAgent };
