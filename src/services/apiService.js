import { ENV_VARIABLES } from 'config/config';
import { getLocalStorageItem, removeLocalStorageItem } from '@/utilities';
import { createLogoutAuth } from '../redux/states/auth';

const baseURL = ENV_VARIABLES.API_URL;

const customFetch = async (endpoint, options = {}) => {
  const token = getLocalStorageItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: Bearer ${token} })
  };

  const config = {
    ...options,
    headers: { ...headers, ...options.headers }
  };

  try {
    const response = await fetch(${baseURL}${endpoint}, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        removeLocalStorageItem('token');
        createLogoutAuth();
      }
      throw new Error(Error ${response.status}: ${response.statusText});
    }

    return await response.json();
  } catch (error) {
    return Promise.reject(error);
  }
};

export default customFetch;