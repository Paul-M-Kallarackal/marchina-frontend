import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import PropTypes from 'prop-types';

const CreateProjectModal = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({ name, description });
        } catch (err) {
            console.error("Submission error caught in modal handler:", err);
            setError(err instanceof Error ? err.message : 'Failed to create project');
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setDescription('');
            setIsSubmitting(false);
            setError('');
        }
    }, [isOpen]);

    const handleActualClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleActualClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Project</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        label="Project Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        required
                        margin="dense"
                        id="description"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleActualClose} disabled={isSubmitting}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                            minWidth: '150px',
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5558e6 0%, #9d47f5 100%)',
                            }
                        }}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Project'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

CreateProjectModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default CreateProjectModal; 