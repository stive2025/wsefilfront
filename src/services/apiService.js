import { ENV_VARIABLES } from '/config/config';
import { GetCookieItem, RemoveCookieItem } from '../utilities/cookies.js';

const baseURL = ENV_VARIABLES.API_URL;

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