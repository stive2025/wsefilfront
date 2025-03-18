import CustomFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const getAgents = () => {
  const abortController = loadAbort();
  return {
    call: CustomFetch("users", { signal: abortController.controller.signal }),
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

const deleteAgents = (id) => {
    const abortController = loadAbort();
    return {
      call: CustomFetch(`users/${id}`, {
        method: "DELETE",
        signal: abortController.controller.signal,
      }),
      abortController,
    };
  };;


export { getAgents, createAgent, deleteAgents };