
export const API_URL = 'https://marchina.calmmoss-a81a16c4.eastus.azurecontainerapps.io/api';

export const getApiUrl = () =>  process.env.REACT_APP_API_URL || API_URL;

export const buildUrl = (path) => `${getApiUrl()}${path}`; 