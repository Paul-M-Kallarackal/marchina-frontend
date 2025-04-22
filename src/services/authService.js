import axios from 'axios';
import { buildUrl } from '../constants/api';

class AuthService {
    async login(email, password) {
        const response = await axios.post(buildUrl('/auth/login'), {
            email,
            password,
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    }

    async loginAsGuest() {
        const response = await axios.post(buildUrl('/auth/guest'));
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    }

    logout() {
        localStorage.removeItem('user');
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    getToken() {
        const token = localStorage.getItem('token');
        console.log('token', token);
        return token;
    }
}

export const authService = new AuthService(); 