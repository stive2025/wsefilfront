import { ENV_VARIABLES } from "/config/config";
import { GetCookieItem, RemoveCookieItem } from "../utilities/cookies.js";

let baseURL = ENV_VARIABLES.API_URL;

const CustomFetch = async (endpoint, options = {}) => {
  const token = GetCookieItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Ajustar headers para respuestas binarias
  if (options.responseType === 'blob') {
    headers['Accept'] = 'application/pdf, application/octet-stream';
  }

  const config = {
    ...options,
    headers: { ...headers, ...options.headers },
  };

  try {
    const response = await fetch(`${baseURL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        RemoveCookieItem("authToken");
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // Si esperamos una respuesta binaria, devolver el blob
    if (options.responseType === 'blob') {
      return response.blob();
    }

    // Para respuestas JSON, seguir con el proceso normal
    const responseClone = response.clone();

    try {
      const text = await responseClone.text();
      
      if (text.trim()) {
        return JSON.parse(text);
      } else {
        console.warn("La respuesta está vacía");
        return {};
      }
    } catch (error) {
      console.log(response)
      console.error("Error al parsear JSON:", error);
      return {};
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

export default CustomFetch;