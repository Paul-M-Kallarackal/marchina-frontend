import axios from 'axios';
import { buildUrl } from '../constants/api';

class ProjectService {
    async getProjects(token) {
        const response = await axios.get(buildUrl('/projects'), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }

    async createProject(projectData, token) {
        const response = await axios.post(buildUrl('/projects'), projectData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }

    async getProject(id, token) {
        const response = await axios.get(buildUrl(`/projects/${id}`), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }

    async updateProject(id, projectData, token) {
        const response = await axios.put(buildUrl(`/projects/${id}`), projectData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }

    async deleteProject(id, token) {
        const response = await axios.delete(buildUrl(`/projects/${id}`), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
}

export const projectService = new ProjectService(); 