import { ENV_VARIABLES } from "/config/config";
import { GetCookieItem, RemoveCookieItem } from "../utilities/cookies.js";

let baseURL = ENV_VARIABLES.API_URL;

const CustomFetch = async (endpoint, options = {}) => {
  const token = GetCookieItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: { ...headers, ...options.headers },
  };

  try {
    const response = await fetch(`${baseURL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        RemoveCookieItem("token");
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    console.error(response);

    const responseClone = response.clone();

    try {
      const text = await responseClone.text(); // Lee el cuerpo como texto primero
      console.log("Raw Response:", text); // Verifica si realmente hay contenido

      if (text.trim()) {
        // Evita errores con respuestas vacías
        return JSON.parse(text);
      } else {
        console.warn("La respuesta está vacía");
        return {}; // Retorna un objeto vacío en caso de error
      }
    } catch (error) {
      console.error("Error al parsear JSON:", error);
      return {}; // Evita que el código se rompa
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

export default CustomFetch;
