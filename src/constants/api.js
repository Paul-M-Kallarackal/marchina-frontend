
export const API_URL = 'https://marchina.calmmoss-a81a16c4.eastus.azurecontainerapps.io/api';
// export const API_URL = 'http://localhost:8080/api';
export const WSS_URL = 'wss://marchina.calmmoss-a81a16c4.eastus.azurecontainerapps.io/api';

export const getApiUrl = () =>  API_URL;

export const buildUrl = (path) => `${getApiUrl()}${path}`; 