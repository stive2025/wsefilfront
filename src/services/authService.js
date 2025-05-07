// src/services/authService.js (corrección rápida)
import {
  GetCookieItem,
  setCookieItem,
  RemoveCookieItem,
} from "@/utilities/cookies.js";
import CustomFetch from "@/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const AUTH_TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";

export const loginService = (loginData) => {
  const abortController = loadAbort();

  return {
    call: CustomFetch("login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
      signal: abortController.controller.signal,
    })
      .then((response) => {
        // Manejar tanto Response como objeto directo
        const responseData =
          response instanceof Response ? response.json() : response;
        return responseData;
      })
      .then((data) => {
        if (!data.token?.accessToken || !data.user) {
          throw new Error("Respuesta de autenticación incompleta");
        }

        // Extraer el token real del objeto anidado
        const authToken = data.token.plainTextToken;
        const userData = data.user;

        // Guardar datos
        setAuthToken(authToken);
        setUserData(userData);

        return {
          token: authToken,
          user: userData,
        };
      }),
    abortController,
  };
};
// Guardar token de autenticación
export const setAuthToken = (token, days = 1) => {
  if (!token) {
    console.error("Intento de guardar un token vacío");
    throw new Error("Token de autenticación inválido");
  }

  // Asegurar que el token sea una cadena
  const tokenToStore =
    typeof token === "string" ? token : JSON.stringify(token);

  setCookieItem(AUTH_TOKEN_KEY, tokenToStore, days);
  localStorage.setItem(AUTH_TOKEN_KEY, tokenToStore);
};

// Obtener el token de autenticación
export const getAuthToken = () => {
  return GetCookieItem(AUTH_TOKEN_KEY);
};

// Guardar datos del usuario
export const setUserData = (userData, days = 1) => {
  setCookieItem(USER_DATA_KEY, JSON.stringify(userData), days);
};

// Obtener datos del usuario
export const getUserData = () => {
  try {
    // Primero intentar con localStorage
    const localStorageData = localStorage.getItem(USER_DATA_KEY);
    if (localStorageData) {
      return JSON.parse(localStorageData);
    }

    // Luego con cookies
    const cookieValue = GetCookieItem(USER_DATA_KEY);
    if (!cookieValue) return null;

    // Intentar parsear directamente
    try {
      return JSON.parse(cookieValue);
    } catch (e) {
      // Si falla, intentar con decodeURIComponent
      console.error("Error al parsear datos de usuario desde cookie:", e);
      return JSON.parse(decodeURIComponent(cookieValue));
    }
  } catch (error) {
    console.error("Error al obtener datos de usuario:", error);
    return null;
  }
};

// Comprobar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Cerrar sesión
export const logout = () => {
  RemoveCookieItem(AUTH_TOKEN_KEY);
  RemoveCookieItem(USER_DATA_KEY);
  window.location.href = "#/login";
};

// Función para añadir el token a las peticiones fetch
export const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(url, authOptions);

  if (response.status === 401) {
    logout();
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  return response;
};
