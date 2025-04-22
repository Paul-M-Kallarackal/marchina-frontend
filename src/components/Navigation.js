import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navigation = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        signOut();
        navigate('/signin');
    };

    const navLinkClass = ({ isActive }) => 
        `px-3 py-2 rounded-md text-sm font-medium ${
            isActive 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;

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
                                <NavLink to="/projects" className={navLinkClass}>
                                    Projects
                                </NavLink>
                                <NavLink to="/use-cases" className={navLinkClass}>
                                    Use Cases
                                </NavLink>
                            </div>
                        </div>
                    </div>
                    
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
        </nav>
    );
}; 