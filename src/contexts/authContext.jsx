/* eslint-disable react/prop-types */
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { GetCookieItem, RemoveCookieItem, setCookieItem } from '../utilities/cookies';
import { loginService } from '../services/authService'; // Asegúrate de tener este servicio

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
    if (!requiredAbilities.length) return false;
    return requiredAbilities.some(ability => hasAbility(ability));
  };

  const hasAllAbilities = (requiredAbilities = []) => {
    if (!requiredAbilities.length) return false;
    return requiredAbilities.every(ability => hasAbility(ability));
  };

  // Cargar usuario desde cookies al iniciar
  useEffect(() => {
    const loadUserData = () => {
      const userData = GetCookieItem('userData');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
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
      const response = await loginService(credentials);
      
      if (!response || !response.token) {
        throw new Error('Invalid login response');
      }

      const userData = {
        ...response.user,
        token: response.token,
        abilities: response.abilities || []
      };

      setUser(userData);
      setAbilities(userData.abilities);
      setCookieItem('userData', JSON.stringify(userData), { expires: 7 });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAbilities([]);
    RemoveCookieItem('userData');
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