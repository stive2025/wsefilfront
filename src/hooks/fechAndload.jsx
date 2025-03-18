import { useState, useRef, useEffect } from "react";

export const useFetchAndLoad = () => {
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(new AbortController());

  const callEndpoint = async (apiCall) => {
    if (!apiCall || !apiCall.call) {
      throw new Error("API call is required");
    }

    // Cancelar petición anterior si existe
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    // Usar el controlador proporcionado por la llamada API
    controllerRef.current = apiCall.abortController.controller;

    setLoading(true);
    
    try {
      const response = await apiCall.call;
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return { loading, callEndpoint };
};

export const loadAbort = () => {
  return { controller: new AbortController() };
};