import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Stack
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export const ProjectCard = ({ project }) => {
    return (
        <Link 
            to={`/projects/${project.id}`}
            style={{ textDecoration: 'none' }}
        >
            <MotionCard
                whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }}
                transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                }}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    '&:hover': {
                        '& .hover-gradient': {
                            opacity: 0.05
                        }
                    }
                }}
            >
                <Box
                    className="hover-gradient"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                />
                
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box
                                sx={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    borderRadius: '8px',
                                    p: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <FolderIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                            </Box>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600,
                                color: 'text.primary',
                                fontSize: '1.1rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '100%'
                            }}>
                                {project.name}
                            </Typography>
                        </Box>

                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.6,
                                fontSize: '0.95rem',
                                wordWrap: 'break-word'
                            }}
                        >
                            {project.description}
                        </Typography>
                    </Stack>
                </CardContent>
            </MotionCard>
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