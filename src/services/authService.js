// src/services/authService.js (corrección rápida)
import {
  GetCookieItem,
  setCookieItem,
  RemoveCookieItem,
} from "/src/utilities/cookies.js";
import CustomFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const AUTH_TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";

export const loginService = (loginData) => {
  const abortController = loadAbort();
  console.log("Ejecutando loginService con datos:", loginData);
  
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
      console.log("Respuesta raw:", response);
      
      // CORRECCIÓN: Solo verificar si response.ok es false
      if (!response.ok && response.status !== 200) {
        console.error("Error en la respuesta de login:", response.status);
        throw new Error(`Error de autenticación (${response.status})`);
      }
      
      return response;
    })
    .then(data => {
      console.log("Datos recibidos en loginService:", data);
      return data;
    })
    .catch(error => {
      console.error("Error en loginService:", error);
      throw error;
    }),
    abortController,
  };
};

// Guardar token de autenticación
export const setAuthToken = (token, days = 1) => {
  console.log("Guardando token:", token);
  if (!token) {
    console.error("Intento de guardar un token vacío");
    return;
  }
  setCookieItem(AUTH_TOKEN_KEY, token, days);
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
  const userData = GetCookieItem(USER_DATA_KEY);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

// Comprobar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Cerrar sesión
export const logout = () => {
  RemoveCookieItem(AUTH_TOKEN_KEY);
  RemoveCookieItem(USER_DATA_KEY);
  window.location.href = "/login";
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