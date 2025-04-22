import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export const ProjectCard = ({ project }) => {
    return (
        <Link 
            to={`/projects/${project.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {project.name}
                    </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                </p>
                
                <div className="flex items-center justify-end">
                    <div className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        View Project →
                    </div>
                </div>
            </div>
        </Link>
    );
};

ProjectCard.propTypes = {
    project: PropTypes.shape({
        id: PropTypes.number.isRequired,
        userId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
    }).isRequired
}; 