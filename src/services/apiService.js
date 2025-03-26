import { ENV_VARIABLES } from '/config/config';
import { GetCookieItem, RemoveCookieItem } from '../utilities/cookies.js';

let baseURL = ENV_VARIABLES.API_URL;
const baseURL_SM = ENV_VARIABLES.API_URL_SM;

const CustomFetch = async (endpoint, options = {}) => {
  const token = GetCookieItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}`})
  };

  const config = {
    ...options,
    headers: { ...headers, ...options.headers }
  };

  try {
    // Check if the endpoint is for the Smart Messaging API
    const isSmartMessagingEndpoint = endpoint.startsWith('sendmessage');
    if (isSmartMessagingEndpoint) {
      baseURL = baseURL_SM
    }
    const response = await fetch(`${baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        RemoveCookieItem('token');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    return Promise.reject(error);
  }
};

export default CustomFetch;