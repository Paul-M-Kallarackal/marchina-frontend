import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { DashboardLayout } from '../components/DashboardLayout';
import SchoolIcon from '@mui/icons-material/School';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CircleIcon from '@mui/icons-material/Circle';

const UseCases = () => {
  const breadcrumbs = [
    { label: 'Use Cases' }
  ];

  const headerContent = (
    <>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Who Can Benefit from Marchina AI?
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Discover how Marchina AI can transform your workflow, regardless of your role or industry.
      </Typography>
    </>
  );

  const UserGroup = ({ title, icon: Icon, color, items }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: '8px',
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <List>
        {items.map((item, index) => (
          <ListItem key={index} sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              secondary={item.description}
              primaryTypographyProps={{
                fontWeight: 500,
                gutterBottom: true
              }}
              secondaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  const userGroups = [
    {
      title: 'For Students',
      icon: SchoolIcon,
      items: [
        {
          title: 'Academic Projects',
          description: 'Visualize complex algorithms and system architectures for your projects and research papers.'
        },
        {
          title: 'Learning Aid',
          description: 'Understand complex system concepts through visual representation of distributed systems and architectures.'
        }
      ]
    },
    {
      title: 'For Solution Architects',
      icon: ArchitectureIcon,
      items: [
        {
          title: 'Rapid Prototyping',
          description: 'Quickly prototype and iterate on system designs with AI-powered suggestions and optimizations.'
        },
        {
          title: 'Technical Documentation',
          description: 'Create comprehensive system documentation with clear visual representations.'
        }
      ]
    },
    {
      title: 'For Product Managers',
      icon: AccountTreeIcon,
      items: [
        {
          title: 'Technical Communication',
          description: 'Bridge the gap between technical and non-technical stakeholders with clear system visualizations.'
        },
        {
          title: 'Feature Planning',
          description: 'Visualize feature requirements and system impacts before development begins.'
        }
      ]
    },
    {
      title: 'For Statisticians',
      icon: ShowChartIcon,
      items: [
        {
          title: 'Data Flow Visualization',
          description: 'Create clear data flow diagrams and statistical process visualizations for your research.'
        },
        {
          title: 'Research Documentation',
          description: 'Document complex statistical models and analysis processes with clear visual representations.'
        }
      ]
    }
  ];

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      headerContent={headerContent}
    >
      <Grid container spacing={3}>
        {userGroups.map((group, index) => (
          <Grid item xs={12} md={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <UserGroup {...group} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Best Practices
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Getting Started
              </Typography>
              <List>
                {[
                  'Start with a clear description of your system requirements',
                  'Specify key components and their relationships',
                  'Mention any specific technologies or patterns'
                ].map((text, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Advanced Tips
              </Typography>
              <List>
                {[
                  'Use voice input for complex system descriptions',
                  'Iterate on the generated design by modifying the Mermaid code',
                  'Download and share your diagrams for collaboration'
                ].map((text, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </DashboardLayout>
  );
};

export default UseCases; 