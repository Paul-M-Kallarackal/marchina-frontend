import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  IconButton, 
  ToggleButton, 
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SaveIcon from '@mui/icons-material/Save';
import mermaid from 'mermaid';
import { getDiagram, updateDiagram } from '../services/api';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

export const DiagramEditor = () => {
  const { projectId, diagramId } = useParams();
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState(null);
  const [diagramCode, setDiagramCode] = useState('');
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('diagram');
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const renderDiagram = useCallback(async (content) => {
    try {
      setRenderError(null);
      const { svg } = await mermaid.render('mermaid-diagram', content);
      setSvg(svg);
    } catch (error) {
      console.error('Error rendering diagram:', error);
      setRenderError('Failed to render diagram. Please check the code view.');
      setSvg('');
    }
  }, []);

  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        setLoading(true);
        const response = await getDiagram(projectId, diagramId);
        setDiagram(response);
        setDiagramCode(response.content || '');
        await renderDiagram(response.content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagram();
  }, [projectId, diagramId, renderDiagram]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await updateDiagram(projectId, diagramId, {
        name: diagram.name,
        type: diagram.type,
        content: diagramCode
      });

      // Update local state
      setDiagram(prev => ({ ...prev, content: diagramCode }));
      await renderDiagram(diagramCode);
      setSaveSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (svg) {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagram.name}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(diagramCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeChange = async (e) => {
    const newCode = e.target.value;
    setDiagramCode(newCode);
    try {
      await renderDiagram(newCode);
      setRenderError(null);
    } catch (error) {
      console.error('Error updating diagram:', error);
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
      <Box p={3}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1400, 
      width: '100%',
      mx: 'auto', 
      p: 3,
      minHeight: '100vh',
    }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(`/projects/${projectId}`)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {diagram.name}
        </Typography>
      </Box>

      <Paper 
        elevation={2}
        sx={{ 
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountTreeIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Edit Diagram
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newValue) => newValue && setViewMode(newValue)}
              size="small"
              sx={{ 
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  px: 2
                }
              }}
            >
              <ToggleButton value="diagram">
                <AccountTreeIcon sx={{ mr: 1 }} /> Diagram
              </ToggleButton>
              <ToggleButton value="code">
                <CodeIcon sx={{ mr: 1 }} /> Code
              </ToggleButton>
            </ToggleButtonGroup>
            
            {viewMode === 'code' ? (
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
            ) : (
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={!svg}
                variant="outlined"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Download SVG
              </Button>
            )}
          </Box>
        </Box>

        {renderError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {renderError}
          </Alert>
        )}

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
              value={diagramCode}
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
            minHeight: 600, 
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
            {svg ? (
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <AccountTreeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  Switch to code view to start editing
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        message="Changes saved successfully"
      />
    </Box>
  );
}; 