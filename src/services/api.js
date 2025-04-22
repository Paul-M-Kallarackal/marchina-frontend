import axios from 'axios';
import { authService } from './authService';
import { buildUrl } from '../constants/api';

const API_URL = process.env.REACT_APP_API_URL || 'https://marchina.calmmoss-a81a16c4.eastus.azurecontainerapps.io/api';

const api = axios.create({
  baseURL: API_URL,
});

export const processRequest = async (description) => {
  try {
    const response = await api.post('/agents/process', {
      description: description
    });

    const data = response.data;
    
    // Handle direct mermaid code response
    if (data.mermaidCode) {
      return data.mermaidCode;
    }
    
    // Handle markdown response with embedded mermaid code
    if (data.content) {
      const mermaidMatch = data.content.match(/```mermaid\n([\s\S]*?)```/);
      if (mermaidMatch && mermaidMatch[1]) {
        return mermaidMatch[1].trim();
      }
    }
    
    throw new Error('No valid Mermaid code found in response');
  } catch (error) {
    console.error('Error processing request:', error);
    throw error;
  }
};

export const createDiagram = async (projectId, data) => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const payload = {
      generalType: data.type,
      requirement: data.requirements
    };

    const response = await axios.post(
      buildUrl(`/projects/${projectId}/diagrams`),
      payload,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating diagram:', error);
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