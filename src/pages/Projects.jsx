import React, { useState, useEffect } from 'react';
import { 
    Box,
    Typography,
    Button,
    Grid,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import { ProjectCard } from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import LoadingAnimation from '../components/LoadingAnimation';

export const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const fetchProjects = async () => {
            // Original simple check: only fetch if token exists
            if (!token) return; 
            
            try {
                // Set loading true before fetch
                setIsLoading(true); 
                setError('');
                const data = await projectService.getProjects(token);
                setProjects(data);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setError('Failed to fetch projects');
            } finally {
                // Always set loading false after attempt
                setIsLoading(false); 
            }
        };

        fetchProjects();
    // Original dependency: only run when token changes
    }, [token]);

    const handleCreateProject = async (projectData) => {
        try {
            setError('');
            await projectService.createProject(projectData, token);
            const data = await projectService.getProjects(token);
            setProjects(data);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating project:', error);
            setError('Failed to create project. Please try again.');
            throw error;
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingAnimation message="Loading projects..." />
            </DashboardLayout>
        );
    }

    const sidebarContent = (
        <Box sx={{ height: '100%', bgcolor: 'white' }}>
            <Box sx={{ 
                p: 3,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: 'white'
            }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Projects
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Select a project to view its details
                </Typography>
            </Box>
            
            <List sx={{ px: 2, py: 2 }}>
                {projects.map((project) => (
                    <ListItem
                        key={project.id}
                        button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            '&:hover': {
                                bgcolor: 'rgba(99, 102, 241, 0.04)'
                            }
                        }}
                    >
                        <ListItemIcon>
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
                                <FolderIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                            </Box>
                        </ListItemIcon>
                        <ListItemText 
                            primary={project.name}
                            secondary={project.description}
                            primaryTypographyProps={{
                                variant: 'body2',
                                fontWeight: 500,
                                color: 'text.primary'
                            }}
                            secondaryTypographyProps={{
                                variant: 'caption',
                                sx: {
                                    color: 'text.secondary',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const actions = (
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{
                borderRadius: 2,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: 'white',
                '&:hover': {
                    background: 'linear-gradient(135deg, #5558e6 0%, #9d47f5 100%)',
                },
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                px: 3,
                py: 1
            }}
        >
            New Project
        </Button>
    );

    const breadcrumbs = [
        { label: 'Projects', path: '/projects' }
    ];

    return (
        <DashboardLayout
            sidebarContent={sidebarContent}
            actions={actions}
            breadcrumbs={breadcrumbs}
        >
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {projects.length === 0 ? (
                <Paper 
                    sx={{ 
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: 'background.paper'
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                        No Projects Created Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Get started by creating your first project
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsModalOpen(true)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5558e6 0%, #9d47f5 100%)',
                            }
                        }}
                    >
                        Create a Project
                    </Button>
                </Paper>
            ) : (
                <Grid
                    container
                    spacing={0}
                    sx={{
                        width: '100%',
                        ml: 0
                    }}
                >
                    {projects.map(project => (
                        <Grid
                            item
                            key={project.id}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={4}
                            sx={{ p: 0.5 }}
                        >
                            <ProjectCard project={project} />
                        </Grid>
                    ))}
                </Grid>
            )}

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProject}
            />
        </DashboardLayout>
    );
}; 