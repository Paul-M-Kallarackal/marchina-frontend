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
  Alert,
  TextField,
  Snackbar
} from '@mui/material';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { DiagramCard } from '../components/DiagramCard';
import { authService } from '../services/authService';
import mermaid from 'mermaid';
import { getDiagram, createDiagram, updateDiagram } from '../services/api';
import { buildUrl } from '../constants/api';
import { CreateDiagramModal } from '../components/CreateDiagramModal';

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
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        const projectResponse = await fetch(
          buildUrl(`/projects/${projectId}`),
          { headers }
        ).then(res => res.json());
        
        setProject(projectResponse);

        // Fetch diagrams for the project
        const diagramsResponse = await fetch(
          buildUrl(`/projects/${projectId}/diagrams`),
          { headers }
        ).then(res => res.json());
        
        setDiagrams(diagramsResponse);
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

  const cleanDiagramCode = (code) => {
    if (!code) return '';
    
    // Remove ```mermaid and ``` tags
    let cleanedCode = code.replace(/```mermaid\n?/g, '').replace(/```/g, '');
    
    // Remove leading and trailing whitespace
    cleanedCode = cleanedCode.trim();
    
    return cleanedCode;
  };

  const handleDiagramClick = async (diagram) => {
    try {
      setLoadingDiagram(true);
      setRenderError(null);
      const diagramData = await getDiagram(projectId, diagram.id);
      
      // Clean the diagram code before setting it
      const cleanedCode = cleanDiagramCode(diagramData.content);
      diagramData.content = cleanedCode;
      
      setSelectedDiagram(diagramData);
      setEditedCode(cleanedCode);
      setViewMode('diagram');
      await renderDiagram(cleanedCode);
    } catch (err) {
      console.error('Error fetching diagram:', err);
      setError('Failed to load diagram details');
    } finally {
      setLoadingDiagram(false);
    }
  };

  const handleCodeChange = async (e) => {
    const newCode = cleanDiagramCode(e.target.value);
    setEditedCode(newCode);
    try {
      await renderDiagram(newCode);
      setRenderError(null);
    } catch (error) {
      console.error('Error updating diagram:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const cleanedCode = cleanDiagramCode(editedCode);

      await updateDiagram(projectId, selectedDiagram.id, {
        name: selectedDiagram.name,
        type: selectedDiagram.type,
        content: cleanedCode
      });

      // Update local state
      setSelectedDiagram(prev => ({ ...prev, content: cleanedCode }));
      setEditedCode(cleanedCode);
      await renderDiagram(cleanedCode);
      setSaveSuccess(true);

      // Update the diagram in the list
      setDiagrams(prevDiagrams => 
        prevDiagrams.map(d => 
          d.id === selectedDiagram.id 
            ? { ...d, content: cleanedCode }
            : d
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseDiagram = () => {
    setSelectedDiagram(null);
    setError(null);
    setDiagramSvg('');
    setViewMode('diagram');
    setRenderError(null);
  };

  const handleCreateDiagram = async (data) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create a new diagram in the project
      const diagramData = {
        type: data.type,
        requirements: data.requirements
      };

      const createResponse = await createDiagram(projectId, diagramData);

      // Add the new diagram to the state
      setDiagrams(prevDiagrams => [...prevDiagrams, createResponse]);
      
      // Close the create diagram modal
      setIsDiagramModalOpen(false);

      // Show the newly created diagram
      handleDiagramClick(createResponse);
    } catch (error) {
      console.error('Error creating diagram:', error);
      setError(error.message || 'Failed to create diagram');
      throw error;
    }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {project.description}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutoGraphIcon />}
                onClick={() => setIsDiagramModalOpen(true)}
                sx={{
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  }
                }}
              >
                Generate Diagram
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Diagrams
            </Typography>

            {diagrams.length === 0 ? (
              <Box 
                sx={{ 
                  py: 6, 
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
              </Box>
            ) : (
              <Grid container spacing={2}>
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
                      {viewMode === 'code' && (
                        <>
                          <Button
                            startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                            onClick={handleCopyCode}
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: 2 }}
                          >
                            {copied ? 'Copied!' : 'Copy Code'}
                          </Button>
                          <Button
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            variant="contained"
                            size="small"
                            disabled={saving}
                            sx={{ 
                              borderRadius: 2,
                              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                              }
                            }}
                          >
                            {saving ? (
                              <span className="loading-dots">Saving</span>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </>
                      )}
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
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Edit the diagram code below
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={20}
                          variant="outlined"
                          value={editedCode}
                          onChange={handleCodeChange}
                          sx={{ 
                            fontFamily: 'monospace',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: '#fff'
                            }
                          }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ 
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
                      }}>
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

          <CreateDiagramModal
            isOpen={isDiagramModalOpen}
            onClose={() => setIsDiagramModalOpen(false)}
            onSubmit={handleCreateDiagram}
          />

          <Snackbar
            open={saveSuccess}
            autoHideDuration={3000}
            onClose={() => setSaveSuccess(false)}
            message="Changes saved successfully"
          />
        </>
      )}
    </Container>
  );
}; 