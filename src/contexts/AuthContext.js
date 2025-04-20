import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

const API_URL = process.env.REACT_APP_API_URL || 'https://marchina.calmmoss-a81a16c4.eastus.azurecontainerapps.io';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const handleAuthResponse = (response) => {
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
    };

    const signIn = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/users/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Sign in failed');
            }

            const data = await response.json();
            handleAuthResponse(data);
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const loginAsGuest = async () => {
        try {
            const response = await fetch(`${API_URL}/users/guest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Guest login failed');
            }

            const data = await response.json();
            handleAuthResponse(data);
        } catch (error) {
            console.error('Guest login error:', error);
            throw error;
        }
    };

    const signOut = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            signIn, 
            loginAsGuest, 
            signOut, 
            isAuthenticated 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 