import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const Navigation = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleSignOut = async () => {
        await authService.signOut();
        navigate('/signin');
    };

    return (
        <nav className="bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-white text-xl font-bold">Marchina</span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <a href="/dashboard" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Dashboard
                                </a>
                                {/* Add more navigation items as needed */}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user && (
                            <div className="flex items-center">
                                <span className="text-gray-300 mr-4">{user.name}</span>
                                <button
                                    onClick={handleSignOut}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}; 