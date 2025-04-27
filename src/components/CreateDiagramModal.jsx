import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    Button,
    TextField,
    Grid,
    Alert,
    Paper,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
        description: 'System components and interactions',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
    },
    {
        id: 'Workflow',
        name: 'Workflow',
        icon: WorkflowIcon,
        description: 'Process flows and workflows',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
    },
    {
        id: 'Database Schema',
        name: 'Database Schema',
        icon: DatabaseIcon,
        description: 'Database structure and relations',
        gradient: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)'
    }
];

export const CreateDiagramModal = ({ isOpen, onClose, onSubmit }) => {
    const [selectedType, setSelectedType] = useState('');
    const [requirements, setRequirements] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (!selectedType) {
            setError('Please select a diagram type');
            return;
        }
        if (!requirements.trim()) {
            setError('Please enter requirements for the diagram');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({
                type: selectedType,
                requirements: requirements.trim()
            });
            setSelectedType('');
            setRequirements('');
            onClose();
        } catch (err) {
            console.error("Diagram creation error in modal:", err);
            setError(err instanceof Error ? err.message : 'Failed to create diagram');
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setSelectedType('');
            setRequirements('');
            setIsSubmitting(false);
            setError('');
        }
    }, [isOpen]);

    const handleActualClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    return (
        <Dialog
            open={isOpen}
            onClose={handleActualClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                }
            }}
        >
            <DialogTitle sx={{ 
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    New Diagram
                </Typography>
                <IconButton
                    onClick={handleActualClose}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {error && (
                <Alert severity="error" sx={{ mx: 2, mb: 1 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} id="create-diagram-form">
                <DialogContent sx={{ p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                            Select Type
                        </Typography>
                        <Grid container spacing={1}>
                            {DIAGRAM_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedType === type.id;
                                
                                return (
                                    <Grid item xs={4} key={type.id}>
                                        <Paper
                                            onClick={() => setSelectedType(type.id)}
                                            sx={{
                                                p: 1.5,
                                                cursor: 'pointer',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                border: '2px solid',
                                                borderColor: isSelected ? 'transparent' : 'divider',
                                                background: isSelected ? type.gradient : 'none',
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: isSelected ? 4 : 1
                                                }
                                            }}
                                        >
                                            <Icon sx={{ 
                                                fontSize: 24,
                                                mb: 0.5,
                                                color: isSelected ? 'white' : type.gradient.split(',')[1].split(' ')[1]
                                            }} />
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    color: isSelected ? 'white' : 'text.primary',
                                                    mb: 0.5
                                                }}
                                            >
                                                {type.name}
                                            </Typography>
                                            <Typography 
                                                variant="caption"
                                                sx={{ 
                                                    display: 'block',
                                                    color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                                                }}
                                            >
                                                {type.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                            Requirements
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            placeholder="Describe the diagram you want to create..."
                            disabled={isSubmitting}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1.5
                                }
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleActualClose}
                        size="small"
                        disabled={isSubmitting}
                        sx={{ color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="create-diagram-form"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                            minWidth: '160px',
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5558e6 0%, #9d47f5 100%)',
                            }
                        }}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Diagram'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

CreateDiagramModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
}; 