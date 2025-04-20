import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';

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
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                </p>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {project.diagramId && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Diagram Available
                            </span>
                        )}
                    </div>
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
        description: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        diagramId: PropTypes.string
    }).isRequired
}; 