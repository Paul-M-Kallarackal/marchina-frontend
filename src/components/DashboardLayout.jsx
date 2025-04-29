import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, NavLink } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    ListItemIcon,
    ListItemText,
    Divider,
    useTheme,
    Breadcrumbs,
    Link,
    Button,
    Avatar,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutIcon from '@mui/icons-material/Logout';
import MicIcon from '@mui/icons-material/Mic';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';
// Add this import at the top
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { authService } from '../services/authService';
import { buildUrl } from '../constants/api';
import { useLocation } from 'react-router-dom';

const drawerWidth = 280;

const ActionButton = ({ to, icon: Icon, children }) => (
    <Button
        component={NavLink}
        to={to}
        variant="contained"
        startIcon={<Icon />}
        sx={{
            background: 'linear-gradient(135deg, #e9d5ff 0%, #fef9c3 100%)',
            '&:hover': {
                background: 'linear-gradient(135deg, #d8b4fe 0%, #fef08a 100%)',
            },
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 1,
            color: '#6b21a8',
            boxShadow: '0 2px 8px rgba(233, 213, 255, 0.3)',
        }}
    >
        {children}
    </Button>
);

export const DashboardLayout = ({ 
    children,
    sidebarContent,
    headerContent,
    actions,
    breadcrumbs = []
}) => {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const theme = useTheme();
    const location = useLocation();

 
    const navigate = useNavigate();
     const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        setUserMenuAnchor(null);
        await signOut();
        navigate('/signin');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            {/* Top Navigation Bar */}
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: theme.zIndex.drawer + 1,
                    bgcolor: '#fafafa',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
            >
                <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {sidebarContent && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={() => setDrawerOpen(!drawerOpen)}
                        >
                            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
                        </IconButton>
                    )}

                    <Typography 
                        variant="h6" 
                        component={Link} 
                        href="/"
                        sx={{ 
                            color: 'text.primary', 
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Marchina
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 3 }}>
                        <Breadcrumbs 
                            separator={<NavigateNextIcon fontSize="small" />}
                            sx={{ 
                                flexGrow: 1
                            }}
                        >
                            {breadcrumbs.map((crumb, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                
                                if (isLast) {
                                    return (
                                        <Typography 
                                            key={crumb.path || index} 
                                            color="text.secondary"
                                        >
                                            {crumb.label}
                                        </Typography>
                                    );
                                }

                                return (
                                    <Link
                                        key={crumb.path || index}
                                        component="button"
                                        onClick={() => navigate(crumb.path)}
                                        sx={{ 
                                            color: 'text.primary',
                                            textDecoration: 'none',
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                    >
                                        {crumb.label}
                                    </Link>
                                );
                            })}
                        </Breadcrumbs>
                    </Box>

                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                        {location.pathname === '/voice' && (
                            <Button
                                onClick={clearConversation}
                                startIcon={<DeleteIcon />}
                                sx={{
                                    background: 'transparent',
                                    color: '#dc2626',
                                    '&:hover': {
                                    background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                                    },
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                                }}
                                >
                                Clear Session
                            </Button>
                        )}
                        <Button
                            component={NavLink}
                            to="/voice"
                            startIcon={<MicIcon />}
                            sx={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5558e6 0%, #9d47f5 100%)',
                                },
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                            }}
                        >
                            Voice
                        </Button>

                        {actions}

                        {user && (
                            <Box sx={{ ml: 2 }}>
                                <Tooltip title="Account">
                                    <IconButton
                                        onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                                        sx={{ 
                                            p: 0,
                                            '&:hover': { 
                                                transform: 'scale(1.05)',
                                                transition: 'transform 0.2s'
                                            }
                                        }}
                                    >
                                        <Avatar 
                                            sx={{ 
                                                width: 40, 
                                                height: 40,
                                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                                            }}
                                        >
                                            {user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    anchorEl={userMenuAnchor}
                                    open={Boolean(userMenuAnchor)}
                                    onClose={() => setUserMenuAnchor(null)}
                                    PaperProps={{
                                        sx: {
                                            mt: 1.5,
                                            minWidth: 200,
                                            borderRadius: 2,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '& .MuiMenuItem-root': {
                                                py: 1.5,
                                                px: 2,
                                                borderRadius: 1,
                                                mx: 1,
                                                mb: 0.5,
                                                '&:hover': {
                                                    bgcolor: 'rgba(99, 102, 241, 0.08)'
                                                }
                                            }
                                        }
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <Box sx={{ px: 2, py: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            {user.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {user.email}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <MenuItem 
                                        onClick={handleSignOut}
                                        sx={{
                                            color: 'error.main',
                                            '&:hover': { 
                                                bgcolor: 'error.lighter',
                                                '& .MuiListItemIcon-root': {
                                                    color: 'error.main'
                                                }
                                            }
                                        }}
                                    >
                                        <ListItemIcon>
                                            <LogoutIcon sx={{ fontSize: 20, color: 'error.main' }} />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Sign Out" 
                                            primaryTypographyProps={{
                                                variant: 'body2'
                                            }}
                                        />
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar - Only render if sidebarContent exists */}
            {sidebarContent && (
                <Drawer
                    variant="temporary"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            bgcolor: 'white',
                            borderRight: 'none',
                            boxShadow: '4px 0 8px rgba(0,0,0,0.05)',
                            mt: '64px',
                            '& .MuiListItem-root': {
                                borderRadius: 1,
                                mx: 1,
                                mb: 0.5,
                                '&:hover': {
                                    bgcolor: 'rgba(99, 102, 241, 0.08)'
                                }
                            },
                            '& .MuiListItemIcon-root': {
                                minWidth: 40,
                                '& .MuiSvgIcon-root': {
                                    fontSize: '1.2rem'
                                }
                            },
                            '& .MuiListItemText-primary': {
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            },
                            '& .MuiListItemText-secondary': {
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontSize: '0.75rem',
                                lineHeight: 1.5,
                                wordWrap: 'break-word'
                            }
                        }
                    }}
                    ModalProps={{
                        keepMounted: true,
                    }}
                >
                    {sidebarContent}
                </Drawer>
            )}

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    position: 'relative',
                    mt: '64px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    width: '100%'
                }}
            >
                {/* Header Content Box */}
                {headerContent && (
                    <Box
                        sx={{
                            px: 3, 
                            py: 2,
                            flexShrink: 0,
                        }}
                    >
                        {headerContent}
                    </Box>
                )}

                {/* Inner Content Box */}
                <Box
                    sx={{
                        p: 2,
                        flexGrow: 1, 
                        maxWidth: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

ActionButton.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    children: PropTypes.node.isRequired
};

DashboardLayout.propTypes = {
    children: PropTypes.node.isRequired,
    sidebarContent: PropTypes.node,
    headerContent: PropTypes.node,
    actions: PropTypes.node,
    breadcrumbs: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            path: PropTypes.string
        })
    )
}; 

  
  const clearConversation = async () => {
    
    try {
        const token = authService.getToken();
        const response = await axios({
            method: 'DELETE',
            url: buildUrl('/chat'),
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            console.log('Conversation cleared successfully');
            window.location.reload();
            // Handle UI updates here
        }
    } catch (error) {
        console.error('Error clearing conversation:', error);
    }
};

// const response = await axios.delete('/api/chat', {
//     headers: {
//         'Authorization': `Bearer ${token}`
//     }
// });

// if (response.status === 200) {
//     console.log('Conversation cleared successfully');
//     // Handle UI updates here
// }
// } catch (error) {
// console.error('Error clearing conversation:', error);
// }