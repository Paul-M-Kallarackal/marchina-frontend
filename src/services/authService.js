const API_URL = 'http://localhost:8080/api/users';

export const authService = {
    signIn: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Sign in failed');
            }

            const data = await response.json();
            if (data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return data;
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error during sign in:', error);
            throw error;
        }
    },

    loginAsGuest: async () => {
        try {
            const response = await fetch(`${API_URL}/guest`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Guest login failed');
            }

            const data = await response.json();
            if (data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return data;
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error during guest login:', error);
            throw error;
        }
    },

    signOut: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_URL}/signout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Sign-out failed:', response.status);
            }
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
}; 