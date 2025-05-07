import CustomFetch from "@/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";


const getCodigoQR = () => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`connections/1`, { signal: abortController.controller.signal }),
    abortController,
  };
};



export { getCodigoQR };
