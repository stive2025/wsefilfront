import { GetCookieItem, setCookieItem, RemoveCookieItem }  from "/src/utilities/cookies.js"; 
import CustomFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

export const loginUser = (loginData) => {
    const abortController = loadAbort();
    return {
      call: CustomFetch("login", {
        method: "POST",
        body: JSON.stringify(loginData),
        signal: abortController.controller.signal,
      }),
      abortController,
    };
  };
  

// Guardar token de autenticación
export const setAuthToken = (token, days = 1) => {
  console.log("Token:", token);
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
};

// Función para añadir el token a las peticiones fetch
export const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  console.log(token)
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };
  
  const response = await fetch(url, authOptions);
  
  // Si recibimos un 401 (Unauthorized), podríamos manejar el logout automático
  if (response.status === 401) {
    logout();
    // Opcional: redirigir al login
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  
  return response;
};