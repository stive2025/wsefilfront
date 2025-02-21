import { useEffect, useState } from "react";

const useFetchAndLoad = () => {
  const [loading, setLoading] = useState(false);
  let controller = new AbortController();

  const callEndpoint = async (url, options = {}) => {
    controller = new AbortController();  // Crear un nuevo controlador por cada petición
    setLoading(true);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      if (!response.ok) throw new Error("Error: ${response.statusText}");
      const data = await response.json();
      return data;
    } catch (err) {
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelEndpoint = () => {
    setLoading(false);
    controller.abort();
  };

  useEffect(() => {
    return () => {
      cancelEndpoint();
    };
  }, []);

  return { loading, callEndpoint };
};

export default useFetchAndLoad;