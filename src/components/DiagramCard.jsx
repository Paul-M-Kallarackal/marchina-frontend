import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Box } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SchemaIcon from '@mui/icons-material/Schema';
import StorageIcon from '@mui/icons-material/Storage';
import TimelineIcon from '@mui/icons-material/Timeline';
import { motion } from 'framer-motion';

export const getGradientByType = (type) => {
    const types = {
        'Entity Relationship Diagram': {
            gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            icon: <StorageIcon sx={{ fontSize: 32, color: 'white' }} />
        },
        'Flowchart': {
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            icon: <AccountTreeIcon sx={{ fontSize: 32, color: 'white' }} />
        },
        'Sequence Diagram': {
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            icon: <TimelineIcon sx={{ fontSize: 32, color: 'white' }} />
        },
        'Class Diagram': {
            gradient: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
            icon: <SchemaIcon sx={{ fontSize: 32, color: 'white' }} />
        }
    };

    // Find the matching type using includes
    const matchedType = Object.keys(types).find(key => 
        type?.toLowerCase().includes(key.toLowerCase())
    );

    return types[matchedType] || {
        gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
        icon: <AccountTreeIcon sx={{ fontSize: 32, color: 'white' }} />
    };
};

export const DiagramCard = ({ diagram, projectId }) => {
    const navigate = useNavigate();
    const { gradient, icon } = getGradientByType(diagram.type);

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <Paper
                onClick={() => navigate(`/projects/${projectId}/diagrams/${diagram.id}`)}
                sx={{
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    background: gradient,
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        '& .hover-overlay': {
                            opacity: 0.1,
                        }
                    }
                }}
            >
                <Box
                    className="hover-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'white',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                    }}
                />
                
                {icon}
                
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: 'white',
                        fontWeight: 600,
                        textAlign: 'center',
                        mt: 1.5,
                        fontSize: '0.9rem',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {diagram.name}
                </Typography>
                
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(255,255,255,0.8)',
                        textAlign: 'center',
                        mt: 0.5,
                        fontSize: '0.75rem'
                    }}
                >
                    {diagram.type}
                </Typography>
            </Paper>
        </motion.div>
    );
};

DiagramCard.propTypes = {
    diagram: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    }).isRequired,
    projectId: PropTypes.string.isRequired,
}; 