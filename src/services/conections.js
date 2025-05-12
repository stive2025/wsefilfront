import CustomFetch from "@/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";
import { GetCookieItem } from "@/utilities/cookies.js";

const getCodigoQR = () => {
  const abortController = loadAbort();
  const userDataString = GetCookieItem("userData"); 
  const userData = JSON.parse(userDataString);
  const userId = userData.id;

  if (!userId) {
    throw new Error("User ID not found in cookies");
  }

  return {
    call: CustomFetch(`connections/${userId}`, {
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

export { getCodigoQR };
