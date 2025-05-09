import CustomFetch from "@/services/apiService.js";
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

const searchMessages = (searchData, idChat) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`chats/search/${idChat}`, {
      method: "POST",
      body: JSON.stringify(searchData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
}

export {sendMessage, searchMessages};
