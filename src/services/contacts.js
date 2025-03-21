import CustomFetch from "/src/services/apiService.js";
import { loadAbort } from "../hooks/fechAndload.jsx";

const getContacts = (params = {}) => {
  const abortController = loadAbort();

  // Construir la URL con los parámetros
  let endpoint = "contacts";
  const queryParams = new URLSearchParams();

  // Si hay búsqueda por nombre, solo usamos ese parámetro
  if (params.name) {
    queryParams.append("name", params.name);
  }
  // Si no hay búsqueda por nombre pero hay paginación, usamos solo page
  else if (params.page) {
    queryParams.append("page", params.page);
  }

  // Añadir los parámetros a la URL si existen
  const queryString = queryParams.toString();
  if (queryString) {
    endpoint = `${endpoint}?${queryString}`;
  }

  return {
    call: CustomFetch(endpoint, { signal: abortController.controller.signal }),
    abortController,
  };
};

const getContact = (contactId) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`contacts/${contactId}`, {
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const createContact = (contactData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch("contacts", {
      method: "POST",
      body: JSON.stringify(contactData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const updateContact = (contactId, contactData) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`contacts/${contactId}`, {
      method: "PATCH",
      body: JSON.stringify(contactData),
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

const deleteContact = (id) => {
  const abortController = loadAbort();
  return {
    call: CustomFetch(`contacts/${id}`, {
      method: "DELETE",
      signal: abortController.controller.signal,
    }),
    abortController,
  };
};

// Diccionario de prefijos de países y sus longitudes de números estándar
const countryPrefixes = {
  1: { name: "USA/Canada", standardLength: 10 }, // USA/Canada: +1 xxx xxx xxxx
  44: { name: "UK", standardLength: 10 }, // UK: +44 xxxx xxxxxx
  33: { name: "France", standardLength: 9 }, // France: +33 x xx xx xx xx
  49: { name: "Germany", standardLength: 11 }, // Germany: +49 xxx xxxxxxx
  34: { name: "Spain", standardLength: 9 }, // Spain: +34 xxx xxx xxx
  52: { name: "Mexico", standardLength: 10 }, // Mexico: +52 xx xxxx xxxx
  55: { name: "Brazil", standardLength: 11 }, // Brazil: +55 xx xxxxx xxxx
  86: { name: "China", standardLength: 11 }, // China: +86 xxx xxxx xxxx
  91: { name: "India", standardLength: 10 }, // India: +91 xxxxx xxxxx
  81: { name: "Japan", standardLength: 10 }, // Japan: +81 xx xxxx xxxx
  593: { name: "Ecuador", standardLength: 9 }, // Ecuador: +593 xx xxx xxxx (9 dígitos sin el prefijo)
  54: { name: "Argentina", standardLength: 10 }, // Argentina: +54 xx xxxx xxxx
  57: { name: "Colombia", standardLength: 10 }, // Colombia: +57 xxx xxx xxxx
  56: { name: "Chile", standardLength: 9 }, // Chile: +56 x xxxx xxxx
  51: { name: "Peru", standardLength: 9 }, // Peru: +51 xxx xxx xxx
  58: { name: "Venezuela", standardLength: 10 }, // Venezuela: +58 xxx xxx xxxx
  39: { name: "Italy", standardLength: 10 }, // Italy: +39 xxx xxx xxxx
  61: { name: "Australia", standardLength: 9 }, // Australia: +61 x xxxx xxxx
  7: { name: "Russia", standardLength: 10 }, // Russia: +7 xxx xxx xxxx
  27: { name: "South Africa", standardLength: 9 }, // South Africa: +27 xx xxx xxxx
  351: { name: "Portugal", standardLength: 9 }, // Portugal: +351 xxx xxx xxx
  30: { name: "Greece", standardLength: 10 }, // Greece: +30 xxx xxx xxxx
  31: { name: "Netherlands", standardLength: 9 }, // Netherlands: +31 x xxxx xxxx
  46: { name: "Sweden", standardLength: 9 }, // Sweden: +46 xx xxx xxxx
  47: { name: "Norway", standardLength: 8 }, // Norway: +47 xxxx xxxx
};

// Función para formatear el número de teléfono con un código de país específico
const formatPhoneNumber = (number, countryPrefix) => {
  // Eliminar todos los espacios en blanco, guiones, paréntesis y otros caracteres no numéricos
  let cleanNumber = number.replace(/\D/g, "");
  
  // Si no hay código de país, intentamos detectarlo por el patrón del número
  if (!countryPrefix) {
    return detectAndFormatPhoneNumber(cleanNumber);
  }
  
  // Obtenemos información del país según el código
  const prefixInfo = countryPrefixes[countryPrefix.replace(/\+/g, "")];
  
  if (!prefixInfo) {
    // Si no tenemos información del país, devolvemos como está
    return countryPrefix + cleanNumber;
  }
  
  // Eliminamos prefijos específicos según el país
  switch (countryPrefix) {
    case "593": // Ecuador
      // Eliminar el 0 inicial si existe
      if (cleanNumber.startsWith("0")) {
        cleanNumber = cleanNumber.substring(1);
      }
      break;
    case "52": // México
      // Eliminar el 1 inicial en México (para celulares)
      if (cleanNumber.length > 10 && cleanNumber.startsWith("1")) {
        cleanNumber = cleanNumber.substring(1);
      }
      break;
    // Puedes agregar más reglas específicas para otros países aquí
  }
  
  // Asegurarnos de que el número tenga la longitud estándar del país
  if (cleanNumber.length > prefixInfo.standardLength) {
    cleanNumber = cleanNumber.substring(cleanNumber.length - prefixInfo.standardLength);
  }
  
  return countryPrefix + cleanNumber;
};

// Función auxiliar para detectar y formatear números sin código de país explícito
const detectAndFormatPhoneNumber = (cleanNumber) => {
  // Caso especial - Ecuador: Si tiene 10 dígitos y comienza con 0, asume que es un número ecuatoriano
  if (cleanNumber.length === 10 && cleanNumber.startsWith("0")) {
    // Reemplaza el 0 inicial con el prefijo 593
    return `593${cleanNumber.substring(1)}`;
  }

  // Reglas generales basadas en longitud
  switch (cleanNumber.length) {
    case 9:
      // Números de 9 dígitos son comunes en Ecuador sin el prefijo y sin el 0 inicial
      // Asumiendo Ecuador por defecto para números de 9 dígitos
      return `593${cleanNumber}`;

    case 10:
      // Si comienza con 9 (móviles en muchos países latinoamericanos)
      if (cleanNumber.startsWith("9")) {
        return `593${cleanNumber}`; // Asumiendo Ecuador como predeterminado
      }
      // Si comienza con otros dígitos, podría ser de USA/Canadá o varios otros países
      return `1${cleanNumber}`; // Prefijo de USA/Canadá como valor predeterminado

    case 11:
      // Si ya tiene 11 dígitos y no se detectó un prefijo conocido,
      // podría ser un número brasileño (que tiene 11 dígitos sin prefijo) o un número con prefijo parcial
      if (cleanNumber.startsWith("55")) {
        return cleanNumber; // Probablemente ya tiene el prefijo de Brasil
      }
      return `${cleanNumber}`; // Mantener como está para números de 11 dígitos

    case 12:
      // Si tiene 12 dígitos, probablemente ya incluye un prefijo internacional
      return cleanNumber;

    default:
      // Para otros casos, mantenemos el número tal como está
      return cleanNumber;
  }
};

// Función para extraer código de país y número local de un número de teléfono completo
const splitPhoneNumber = (fullNumber) => {
  if (!fullNumber) return { countryCode: "", phoneNumber: "" };
  
  // Limpiamos el número
  const cleanNumber = fullNumber.replace(/\D/g, "");
  
  // Intentamos extraer el código de país
  for (const [prefix,] of Object.entries(countryPrefixes)) {
    if (cleanNumber.startsWith(prefix)) {
      return {
        countryCode: prefix,
        phoneNumber: cleanNumber.substring(prefix.length)
      };
    }
  }
  
  // Si no encontramos un prefijo conocido, asumimos que es un número local
  return {
    countryCode: "",
    phoneNumber: cleanNumber
  };
};

export {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  formatPhoneNumber,
  splitPhoneNumber,
  countryPrefixes
};