import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert
} from '@mui/material';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import axios from 'axios';
import { DiagramCard } from '../components/DiagramCard';
import { authService } from '../services/authService';
import mermaid from 'mermaid';
import { getDiagram } from '../services/api';
import { buildUrl } from '../constants/api';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

export const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [loadingDiagram, setLoadingDiagram] = useState(false);
  const [viewMode, setViewMode] = useState('diagram');
  const [diagramSvg, setDiagramSvg] = useState('');
  const [renderError, setRenderError] = useState(null);

  const renderDiagram = useCallback(async (content) => {
    try {
      setRenderError(null);
      // First try to render as Mermaid
      try {
        const { svg } = await mermaid.render('mermaid-diagram', content);
        setDiagramSvg(svg);
        return;
      } catch (mermaidError) {
        console.log('Mermaid rendering failed, trying PlantUML:', mermaidError);
        // If Mermaid fails, assume it's PlantUML
        if (content.includes('@startuml') || content.includes('@startmindmap') || content.includes('@startgantt')) {
          setDiagramSvg(`data:image/svg+xml;base64,${content}`);
          return;
        }
        // If neither works, throw error
        throw new Error('Failed to render diagram with both Mermaid and PlantUML');
      }
    } catch (error) {
      console.error('Error rendering diagram:', error);
      setRenderError('Failed to render diagram. Please check the code view for the raw content.');
      setDiagramSvg('');
    }
  }, []);

  useEffect(() => {
    const fetchProjectAndDiagrams = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch project details
        const projectResponse = await axios.get(
          buildUrl(`/projects/${projectId}`),
          { headers }
        );
        setProject(projectResponse.data);

        // Fetch diagrams for the project
        const diagramsResponse = await axios.get(
          buildUrl(`/projects/${projectId}/diagrams`),
          { headers }
        );
        setDiagrams(diagramsResponse.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching project data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndDiagrams();
  }, [projectId]);

  useEffect(() => {
    if (selectedDiagram?.content && viewMode === 'diagram') {
      renderDiagram(selectedDiagram.content);
    }
  }, [selectedDiagram, viewMode, renderDiagram]);

  const handleDiagramClick = async (diagram) => {
    try {
      setLoadingDiagram(true);
      setRenderError(null);
      const diagramData = await getDiagram(projectId, diagram.id);
      setSelectedDiagram(diagramData);
      setViewMode('diagram');
    } catch (err) {
      console.error('Error fetching diagram:', err);
      setError('Failed to load diagram details');
    } finally {
      setLoadingDiagram(false);
    }
  };


  const handleCloseDiagram = () => {
    setSelectedDiagram(null);
    setError(null);
    setDiagramSvg('');
    setViewMode('diagram');
    setRenderError(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {project && (
        <>
          <Box mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {project.description}
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h5" component="h2" gutterBottom>
              Diagrams
            </Typography>
            {diagrams.length === 0 ? (
              <Box 
                sx={{ 
                  py: 8, 
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No diagrams available for this project yet.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => {/* TODO: Add diagram generation logic */}}
                >
                  Generate Diagrams
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {diagrams.map((diagram) => (
                  <Grid item xs={12} md={6} key={diagram.id}>
                    <DiagramCard 
                      diagram={diagram}
                      projectId={projectId}
                      onClick={() => handleDiagramClick(diagram)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          <Dialog
            open={Boolean(selectedDiagram)}
            onClose={handleCloseDiagram}
            maxWidth="lg"
            fullWidth
          >
            {loadingDiagram ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress />
              </Box>
            ) : selectedDiagram && (
              <>
                <DialogTitle>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{selectedDiagram.name}</Typography>
                    <Box display="flex" gap={2}>
                      <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, newValue) => newValue && setViewMode(newValue)}
                        size="small"
                      >
                        <ToggleButton value="diagram">
                          <AccountTreeIcon sx={{ mr: 1 }} /> Diagram
                        </ToggleButton>
                        <ToggleButton value="code">
                          <CodeIcon sx={{ mr: 1 }} /> Code
                        </ToggleButton>
                      </ToggleButtonGroup>
                      <IconButton onClick={handleCloseDiagram} size="small">
                        <XMarkIcon className="h-5 w-5" />
                      </IconButton>
                    </Box>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  {renderError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {renderError}
                    </Alert>
                  )}
                  <Box sx={{ mt: 2 }}>
                    {viewMode === 'code' ? (
                      <pre style={{ 
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        backgroundColor: '#f5f5f5',
                        padding: '1rem',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {selectedDiagram.content}
                      </pre>
                    ) : (
                      <Box 
                        sx={{ 
                          minHeight: 400,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#fff',
                          borderRadius: 2,
                          p: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          overflow: 'auto'
                        }}
                      >
                        {diagramSvg ? (
                          <div dangerouslySetInnerHTML={{ __html: diagramSvg }} />
                        ) : !renderError && (
                          <CircularProgress />
                        )}
                      </Box>
                    )}
                  </Box>
                </DialogContent>
              </>
            )}
          </Dialog>
        </>
      )}
    </Container>
  );
}; 