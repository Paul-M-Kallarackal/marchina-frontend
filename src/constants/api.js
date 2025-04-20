export const FALLBACK_API_URL = 'http://localhost:8080/api';
export const API_URL = 'https://marchina.calmmoss-a81a16c4.eastus.azurecontainerapps.io';

export const getApiUrl = () => API_URL || FALLBACK_API_URL;

export const buildUrl = (path) => `${getApiUrl()}${path}`; 