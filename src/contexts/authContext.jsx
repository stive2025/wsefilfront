/* eslint-disable react/prop-types */
// src/contexts/AuthContext.jsx (corrección rápida)
import { createContext, useContext, useState, useEffect } from 'react';
import { GetCookieItem, RemoveCookieItem } from '../utilities/cookies';
import { loginService, setAuthToken, setUserData } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [abilities, setAbilities] = useState([]);

  // Función para verificar permisos
  const hasAbility = (ability) => {
    if (!ability) return false;
    return abilities.includes(ability);
  };

  const hasAnyAbility = (requiredAbilities = []) => {
    // CORRECCIÓN: Si no hay abilities requeridas, permitir acceso
    if (requiredAbilities.length === 0) return true;
    return requiredAbilities.some(ability => hasAbility(ability));
  };

  const hasAllAbilities = (requiredAbilities = []) => {
    // CORRECCIÓN: Si no hay abilities requeridas, permitir acceso
    if (requiredAbilities.length === 0) return true;
    return requiredAbilities.every(ability => hasAbility(ability));
  };

  // Cargar usuario desde cookies al iniciar
  useEffect(() => {
    const loadUserData = () => {
      const userData = GetCookieItem('userData');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log("Cargando usuario desde cookies:", parsedUser);
          setUser(parsedUser);
          // CORRECCIÓN: Asegurar que abilities es un array
          setAbilities(parsedUser.abilities || []);
        } catch (error) {
          console.error('Error parsing user data', error);
          logout();
        }
      }
      setInitialCheckDone(true);
      setLoading(false);
    };

    loadUserData();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      console.log("Iniciando login con credenciales:", credentials);
      const response = await loginService(credentials).call;
      
      console.log("Respuesta de login completa:", response);
      
      if (!response) {
        throw new Error('Invalid login response');
      }
      
      // CORRECCIÓN: Manejar diferentes formatos de respuesta
      let tokenValue;
      if (response.token && response.token.plainTextToken) {
        tokenValue = response.token.plainTextToken;
      } else if (typeof response.token === 'string') {
        tokenValue = response.token;
      } else if (response.access_token) {
        tokenValue = response.access_token;
      } else {
        console.error("Formato de token no reconocido:", response.token);
        tokenValue = JSON.stringify(response.token);
      }
      
      // CORRECCIÓN: Extraer abilities correctamente
      const userAbilities = response.abilities || 
                           (response.user && response.user.abilities) || 
                           [];
      
      const userData = {
        ...(response.user || {}),
        token: tokenValue,
        abilities: userAbilities
      };
  
      console.log("Guardando datos de usuario:", userData);
      
      setUser(userData);
      setAbilities(userAbilities);
      setAuthToken(tokenValue, 7); // 7 días de expiración
      setUserData(userData, 7);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAbilities([]);
    RemoveCookieItem('userData');
    RemoveCookieItem('authToken');
  };

  const value = {
    user,
    loading,
    initialCheckDone,
    abilities,
    hasAbility,
    hasAnyAbility,
    hasAllAbilities,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};