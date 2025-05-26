import { useState, useRef, useEffect } from "react";

export const useFetchAndLoad = () => {
  const [loading, setLoading] = useState(false);
  const [, setLoadingItems] = useState(0);
  const controllersMapRef = useRef(new Map());
  
  const callEndpoint = async (apiCall, key = 'default') => {
    if (!apiCall || !apiCall.call) {
      throw new Error("API call is required");
    }

    // Crear un nuevo AbortController para cada llamada
    const controller = new AbortController();
    
    // Modificar la llamada para manejar el controlador
    const modifiedApiCall = {
      ...apiCall,
      call: apiCall.call.then(response => {
        if (controllersMapRef.current.has(key)) {
          controllersMapRef.current.delete(key);
        }
        return response;
      }).catch(error => {
        if (controllersMapRef.current.has(key)) {
          controllersMapRef.current.delete(key);
        }
        throw error;
      })
    };

    // Almacenar el nuevo controlador
    controllersMapRef.current.set(key, controller);

    setLoadingItems(prev => prev + 1);
    setLoading(true);
    
    try {
      const response = await modifiedApiCall.call;
      
      setLoadingItems(prev => {
        const newLoadingItems = prev - 1;
        if (newLoadingItems <= 0) {
          setLoading(false);
        }
        return newLoadingItems;
      });
      
      return response;
    } catch (error) {
      setLoadingItems(prev => {
        const newLoadingItems = prev - 1;
        if (newLoadingItems <= 0) {
          setLoading(false);
        }
        return newLoadingItems;
      });
      
      // Solo relanzar si no es un AbortError
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        throw error;
      }
    }
  };

  // Efecto de limpieza para abortar todas las solicitudes pendientes al desmontar el componente
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