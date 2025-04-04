import CustomFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const sendMessage = (messageData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch("messages/connect", {
      method: "POST",
      body: JSON.stringify(messageData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
}

export {sendMessage };
