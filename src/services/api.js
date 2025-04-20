import axios from 'axios';
import { authService } from './authService';
import { buildUrl } from '../constants/api';

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

export const getDiagram = async (projectId, diagramId) => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.get(
      buildUrl(`/projects/${projectId}/diagrams/${diagramId}`),
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching diagram:', error);
    throw error;
  }
};

export const updateDiagram = async (projectId, diagramId, diagramData) => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.put(
      buildUrl(`/projects/${projectId}/diagrams/${diagramId}`),
      diagramData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating diagram:', error);
    throw error;
  }
};

export default api; 