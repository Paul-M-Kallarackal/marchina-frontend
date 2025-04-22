import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { 
    AccountTreeOutlined as SystemIcon,
    AutoGraphOutlined as WorkflowIcon,
    SchemaOutlined as DatabaseIcon
} from '@mui/icons-material';

const DIAGRAM_TYPES = [
    {
        id: 'System Architecture',
        name: 'System Architecture',
        icon: SystemIcon,
        description: 'Design system architecture diagrams with components and their interactions'
    },
    {
        id: 'Workflow',
        name: 'Workflow',
        icon: WorkflowIcon,
        description: 'Create workflow and process flow diagrams'
    },
    {
        id: 'Database Schema',
        name: 'Database Schema',
        icon: DatabaseIcon,
        description: 'Design database schema diagrams with tables and relationships'
    }
];

export const CreateDiagramModal = ({ isOpen, onClose, onSubmit }) => {
    const [selectedType, setSelectedType] = useState('');
    const [requirements, setRequirements] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedType) {
            setError('Please select a diagram type');
            return;
        }
        if (!requirements.trim()) {
            setError('Please enter diagram requirements');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            await onSubmit({
                type: selectedType,
                requirements: requirements.trim()
            });
            setSelectedType('');
            setRequirements('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create diagram');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                            Create New Diagram
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Diagram Type *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {DIAGRAM_TYPES.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setSelectedType(type.id)}
                                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                                                selectedType === type.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                                            }`}
                                        >
                                            <Icon className="h-6 w-6 text-blue-500 mb-2" />
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                                {type.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {type.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Requirements *
                            </label>
                            <textarea
                                id="requirements"
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Describe what you want to include in your diagram..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Diagram'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

CreateDiagramModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
}; 