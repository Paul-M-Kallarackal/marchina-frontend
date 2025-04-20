import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { DocumentIcon, ClockIcon } from '@heroicons/react/24/outline';

export const DiagramCard = ({ diagram, projectId }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/projects/${projectId}/diagrams/${diagram.id}`);
    };

    return (
        <Paper
            onClick={handleClick}
            sx={{
                p: 3,
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                },
            }}
        >
            <Box display="flex" alignItems="center" mb={2}>
                <DocumentIcon className="h-6 w-6 text-blue-600 mr-2" />
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    {diagram.name}
                </Typography>
            </Box>

            <Box mb={2}>
                <Chip 
                    label={diagram.type}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            </Box>

            <Box display="flex" alignItems="center" sx={{ color: 'text.secondary' }}>
                <ClockIcon className="h-4 w-4 mr-1" />
                <Typography variant="caption">
                    Created {formatDistanceToNow(new Date(diagram.createdAt), { addSuffix: true })}
                </Typography>
            </Box>

            {diagram.content && (
                <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {diagram.content}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

DiagramCard.propTypes = {
    diagram: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        content: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
    projectId: PropTypes.string.isRequired,
}; 