import { useState, useRef, useEffect } from "react";

// export const useFetchAndLoad = () => {
//   const [loading, setLoading] = useState(false);
//   const controllerRef = useRef(new AbortController());

//   const callEndpoint = async (apiCall) => {
//     if (!apiCall || !apiCall.call) {
//       throw new Error("API call is required");
//     }

//     // Cancelar petición anterior si existe
//     if (controllerRef.current) {
//       controllerRef.current.abort();
//     }
    
//     // Usar el controlador proporcionado por la llamada API
//     controllerRef.current = apiCall.abortController.controller;

//     setLoading(true);
    
//     try {
//       const response = await apiCall.call;
//       setLoading(false);
//       return response;
//     } catch (error) {
//       setLoading(false);
//       throw error;
//     }
//   };

//   // Limpieza al desmontar el componente
//   useEffect(() => {
//     return () => {
//       if (controllerRef.current) {
//         controllerRef.current.abort();
//       }
//     };
//   }, []);

//   return { loading, callEndpoint };
// };

export const useFetchAndLoad = () => {
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(0);
  const controllersMapRef = useRef(new Map());
  
  const callEndpoint = async (apiCall, key = 'default') => {
    if (!apiCall || !apiCall.call) {
      throw new Error("API call is required");
    }

    // Cancelar petición anterior si existe con la misma key
    if (controllersMapRef.current.has(key)) {
      controllersMapRef.current.get(key).abort();
      controllersMapRef.current.delete(key);
    }
    
    // Usar el controlador proporcionado por la llamada API
    controllersMapRef.current.set(key, apiCall.abortController.controller);

    setLoadingItems(prev => prev + 1);
    setLoading(true);
    
    try {
      const response = await apiCall.call;
      setLoadingItems(prev => prev - 1);
      if (loadingItems <= 1) setLoading(false);
      return response;
    } catch (error) {
      setLoadingItems(prev => prev - 1);
      if (loadingItems <= 1) setLoading(false);
      throw error;
    }
  };

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      controllersMapRef.current.forEach(controller => {
        controller.abort();
      });
      controllersMapRef.current.clear();
    };
  }, []);

  return { loading, callEndpoint };
};

export const loadAbort = () => {
  return { controller: new AbortController() };
};