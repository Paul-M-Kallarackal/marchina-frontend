import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Snackbar,
  TextField,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import { DashboardLayout } from '../components/DashboardLayout';
import LoadingAnimation from '../components/LoadingAnimation';
import { getDiagram, updateDiagram, getDiagrams } from '../services/api';
import { buildUrl } from '../constants/api';
import { authService } from '../services/authService';
import mermaid from 'mermaid';
import '../styles/mermaid.css';
import { getGradientByType } from '../components/DiagramCard';

// Initialize mermaid with custom theme
mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  themeCSS: `
    g.classGroup rect {
      fill: #282a36;
      stroke: #6272a4;
    } 
    g.classGroup text {
      fill: #f8f8f2;
    }
    g.classGroup line {
      stroke: #f8f8f2;
      stroke-width: 0.5;
    }
    .classLabel .box {
      stroke: #21222c;
      stroke-width: 3;
      fill: #21222c;
      opacity: 1;
    }
    .classLabel .label {
      fill: #f1fa8c;
    }
    .relation {
      stroke: #ff79c6;
      stroke-width: 1;
    }
    #compositionStart, #compositionEnd {
      fill: #bd93f9;
      stroke: #bd93f9;
      stroke-width: 1;
    }
    #aggregationEnd, #aggregationStart {
      fill: #21222c;
      stroke: #50fa7b;
      stroke-width: 1;
    }
    #dependencyStart, #dependencyEnd {
      fill: #00bcd4;
      stroke: #00bcd4;
      stroke-width: 1;
    } 
    #extensionStart, #extensionEnd {
      fill: #f8f8f2;
      stroke: #f8f8f2;
      stroke-width: 1;
    }`,
  fontFamily: "Fira Code"
});

// Mermaid component
class Mermaid extends React.Component {
  componentDidMount() {
    mermaid.contentLoaded();
  }
  render() {
    return (
      <div className={`mermaid ${this.props.noResize ? 'no-resize-mermaid' : ''}`}>
        {this.props.chart}
      </div>
    );
  }
}

export const DiagramEditor = () => {
  const { projectId, diagramId } = useParams();
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState(null);
  const [allDiagrams, setAllDiagrams] = useState([]);
  const [project, setProject] = useState(null);
  const [diagramCode, setDiagramCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('diagram');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [diagramResponse, projectResponse, allDiagramsResponse] = await Promise.all([
          getDiagram(projectId, diagramId),
          fetch(buildUrl(`/projects/${projectId}`), {
            headers: {
              'Authorization': `Bearer ${authService.getToken()}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json()),
          getDiagrams(projectId)
        ]);
        
        setDiagram(diagramResponse);
        setProject(projectResponse);
        setAllDiagrams(allDiagramsResponse);
        setDiagramCode(diagramResponse.content || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, diagramId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await updateDiagram(projectId, diagramId, {
        name: diagram.name,
        type: diagram.type,
        content: diagramCode
      });

      setDiagram(prev => ({ ...prev, content: diagramCode }));
      setSaveSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const svgElement = document.querySelector('.mermaid svg');
    if (svgElement) {
      try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${diagram?.name || 'diagram'}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error downloading SVG:", err);
        setError("Failed to download diagram. Please try again.");
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(diagramCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeChange = (e) => {
    setDiagramCode(e.target.value);
  };

  const handleDiagramClick = (clickedDiagramId) => {
    if (clickedDiagramId !== diagramId) {
        navigate(`/projects/${projectId}/diagrams/${clickedDiagramId}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingAnimation message="Loading diagram..." />
      </DashboardLayout>
    );
  }

  const breadcrumbs = [
    { label: 'Projects', path: '/projects' },
    { label: project?.name || 'Project', path: `/projects/${projectId}` },
    { label: diagram?.name || 'Diagram' }
  ];

  const headerContent = (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          {diagram?.name}
        </Typography>
        {diagram?.type && (
          <Typography variant="body2" color="text.secondary">
            {diagram.type} Diagram
          </Typography>
        )}
      </Box>
    </Box>
  );

  const sidebarContent = (
    <Box sx={{ height: '100%', bgcolor: 'white' }}>
      <Box sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        color: 'white'
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Project Diagrams
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Select diagram to edit
        </Typography>
      </Box>
      
      <List sx={{ px: 2, py: 2 }}>
        {allDiagrams.map((d) => {
          const { icon } = getGradientByType(d.type);
          const isCurrent = d.id === diagramId;
          return (
            <ListItem
              key={d.id}
              button
              selected={isCurrent}
              onClick={() => handleDiagramClick(d.id)}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  bgcolor: !isCurrent ? 'rgba(99, 102, 241, 0.04)' : undefined
                },
                '&.Mui-selected': {
                    bgcolor: 'rgba(99, 102, 241, 0.08)',
                    '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.12)'
                    }
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
                  {React.cloneElement(icon, { sx: { color: 'white', fontSize: '1.2rem' } })}
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary={d.name}
                secondary={d.type}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: isCurrent ? 600 : 500,
                  color: 'text.primary',
                  sx: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  sx: { color: 'text.secondary' }
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      headerContent={headerContent}
      sidebarContent={sidebarContent}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        bgcolor: 'white', 
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid',
          borderColor: alpha('#6366f1', 0.1),
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newValue) => newValue && setViewMode(newValue)}
            size="small"
            sx={{ 
              '& .MuiToggleButton-root': {
                px: 2,
                py: 1,
                borderRadius: '8px !important',
                border: '1px solid',
                borderColor: alpha('#6366f1', 0.2),
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5558e6 0%, #9d47f5 100%)',
                  }
                }
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

          <Box sx={{ flex: 1 }} />

          {viewMode === 'code' ? (
            <>
              <Button
                startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                onClick={handleCopyCode}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  borderColor: alpha('#6366f1', 0.2),
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: '#6366f1',
                    bgcolor: alpha('#6366f1', 0.02)
                  }
                }}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSave}
                variant="contained"
                disabled={saving}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5558e6 0%, #9d47f5 100%)',
                  },
                  '&.Mui-disabled': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    opacity: 0.5
                  }
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                borderColor: alpha('#6366f1', 0.2),
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#6366f1',
                  bgcolor: alpha('#6366f1', 0.02)
                }
              }}
            >
              Download SVG
            </Button>
          )}
        </Box>

        <Box sx={{ p: 3 }}>
          {viewMode === 'code' ? (
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
                  bgcolor: alpha('#6366f1', 0.02),
                  '&:hover': {
                    bgcolor: alpha('#6366f1', 0.03),
                  },
                  '&.Mui-focused': {
                    bgcolor: alpha('#6366f1', 0.03),
                  }
                }
              }}
            />
          ) : (
            <Box 
              sx={{ 
                width: '100%',
                minHeight: '500px',
                p: 3,
                bgcolor: alpha('#6366f1', 0.02),
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'auto',
                '& .mermaid': {
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              }}
            >
              <Mermaid chart={diagramCode} />
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSaveSuccess(false)} 
          severity="success"
          sx={{ 
            width: '100%',
            bgcolor: '#10B981',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          Changes saved successfully
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}; 