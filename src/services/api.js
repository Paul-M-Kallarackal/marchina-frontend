import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://marchina.calmmoss-a81a16c4.eastus.azurecontainerapps.io';

const api = axios.create({
  baseURL: API_URL,
});

export const processRequest = async (description) => {
  try {
    const response = await api.post('/api/agents/process', {
      description: description
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api; 