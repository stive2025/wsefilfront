// src/utilities/cookies.js (versión corregida)

/**
 * Establece una cookie con un valor y tiempo de expiración específico
 * @param {string} name - Nombre de la cookie
 * @param {string} value - Valor a guardar
 * @param {number} days - Días hasta que expire (por defecto: 1)
 */
export const setCookieItem = (name, value, days = 1) => {
    try {
      if (!name || value === undefined || value === null) {
        console.error("Error al guardar cookie: nombre o valor inválido", { name, value });
        return;
      }
      
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = `expires=${date.toUTCString()}`;
      
      // Asegurarse de que el valor sea una cadena de texto
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      document.cookie = `${name}=${encodeURIComponent(stringValue)};${expires};path=/`;
    } catch (error) {
      console.error(`Error al guardar cookie '${name}':`, error);
    }
  };
  
  /**
   * Obtiene el valor de una cookie por su nombre
   * @param {string} name - Nombre de la cookie a buscar
   * @returns {string|null} - Valor de la cookie o null si no existe
   */
  export const GetCookieItem = (name) => {
    try {
      if (!name) {
        console.error("Error al obtener cookie: nombre no válido");
        return null;
      }
  
      const nameEQ = `${name}=`;
      const cookies = document.cookie.split(';');
      
      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
          const rawValue = cookie.substring(nameEQ.length);
          const decodedValue = decodeURIComponent(rawValue);
          return decodedValue;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error al obtener cookie '${name}':`, error);
      return null;
    }
  };
  
  /**
   * Elimina una cookie por su nombre
   * @param {string} name - Nombre de la cookie a eliminar
   */
  export const RemoveCookieItem = (name) => {
    try {
      // Eliminar cookie configurando una fecha de expiración en el pasado
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    } catch (error) {
      console.error(`Error al eliminar cookie '${name}':`, error);
    }
  };
  
  /**
   * Comprueba si las cookies están habilitadas en el navegador
   * @returns {boolean} - true si las cookies están habilitadas
   */
  export const areCookiesEnabled = () => {
    try {
      const testName = "testCookie";
      setCookieItem(testName, "test", 1);
      const cookieEnabled = GetCookieItem(testName) === "test";
      RemoveCookieItem(testName);
      return cookieEnabled;
    } catch (error) {
      console.error("Error al comprobar si las cookies están habilitadas:", error);
      return false;
    }
  };