import React, { useState, useCallback } from 'react';
import { Box, Paper, TextField, Button, Typography, IconButton, ToggleButton, ToggleButtonGroup, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoIcon from '@mui/icons-material/Info';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import SchemaIcon from '@mui/icons-material/Schema';
import { processRequest } from '../services/api';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

const extractMermaidCode = (markdownText) => {
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/;
  const match = markdownText.match(mermaidRegex);
  return match ? match[1].trim() : null;
};

export default function DiagramGenerator() {
  const [description, setDescription] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('diagram');
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stopRecording, setStopRecording] = useState(() => () => {});

  const renderDiagram = useCallback(async (diagramText) => {
    try {
      const { svg } = await mermaid.render('mermaid-diagram', diagramText);
      setSvg(svg);
    } catch (error) {
      console.error('Error rendering diagram:', error);
      throw error;
    }
  }, []);

  const handleVoiceInput = async () => {
      try {
        // Set recording state
        setIsRecording(true);
        setError(null);
        
        console.log("Starting voice input...");
        
        // Create an AudioContext
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000 // Standard sample rate for speech recognition
        });
        
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        console.log("Microphone access granted");
        
        // Create a WebSocket connection
        const ws = new WebSocket('ws://localhost:8080/api/speech/stream');
        
        // Create a MediaStreamSource from the microphone stream
        const source = audioContext.createMediaStreamSource(stream);
        
        // Create a ScriptProcessorNode for audio processing
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        // Connect the source to the processor
        source.connect(processor);
        
        // Connect the processor to the destination (required for the processor to work)
        processor.connect(audioContext.destination);
        
        // Flag to track if we've manually stopped recording
        let isStopped = false;
        
        // Keep track of final transcriptions and current partial transcription
        let finalTranscriptions = [];
        let currentPartial = '';
        
        // Function to clean up resources
        const cleanup = () => {
          if (isStopped) return;
          isStopped = true;
          
          console.log('Cleaning up audio resources');
          
          // Disconnect audio nodes
          processor.disconnect();
          source.disconnect();
          
          // Stop all tracks on the stream to release the microphone
          stream.getTracks().forEach(track => track.stop());
          
          // Close WebSocket if still open
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
          
          setIsRecording(false);
        };
        
        // Handle WebSocket events
        ws.onopen = () => {
          console.log('WebSocket connection established');
          
          // Initialize with existing description if any
          if (description) {
            finalTranscriptions = [description];
          }
        };
        
        // Handle WebSocket messages
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received transcription:', data);
            
            if (data.type === 'transcription') {
              if (data.isFinal) {
                // Add this final transcription to our collection
                finalTranscriptions.push(data.text);
                // Clear the current partial
                currentPartial = '';
              } else {
                // Update the current partial transcription
                currentPartial = data.text;
              }
              
              // Update the description with all final transcriptions followed by the current partial
              const finalText = finalTranscriptions.join(' ');
              setDescription(finalText + (currentPartial ? ' ' + currentPartial : ''));
            } else if (data.type === 'error') {
              setError(data.message);
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Error with transcription service. Please try again.');
          cleanup();
        };
        
        ws.onclose = () => {
          console.log('WebSocket connection closed');
          cleanup();
        };
        
        // Process audio data
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN && !isStopped) {
            // Get the PCM audio data from the input buffer
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Convert Float32Array to Int16Array (16-bit PCM)
            const pcmData = new Int16Array(inputData.length);
            
            for (let i = 0; i < inputData.length; i++) {
              // Convert from [-1.0, 1.0] to [-32768, 32767]
              pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32767)));
            }
            
            // Send the audio data
            ws.send(pcmData.buffer);
          }
        };
        
        // Set up the stop recording function
        setStopRecording(() => () => {
          console.log('Manual stop recording triggered');
          cleanup();
        });
        
      } catch (error) {
        console.error('Error with voice recording:', error);
        setError('Error accessing microphone. Please check permissions and try again.');
        setIsRecording(false);
      }
    };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await processRequest(description);
      console.log('API Response:', response);
      
      if (response.success && response.result) {
        const code = extractMermaidCode(response.result);
        if (code) {
          setMermaidCode(code);
          await renderDiagram(code);
        } else {
          setError('Could not extract diagram code from response');
        }
      } else {
        setError(response.message || 'Failed to generate diagram');
      }
    } catch (error) {
      console.error('Error details:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred while generating the diagram');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (svg) {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'diagram.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeChange = async (e) => {
    const newCode = e.target.value;
    setMermaidCode(newCode);
    try {
      await renderDiagram(newCode);
    } catch (error) {
      console.error('Error updating diagram:', error);
    }
  };

  return (
    <Box sx={{  
      maxWidth: 1400, 
      width: '100%',
      mx: 'auto', 
      p: 3,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(33, 150, 243, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
        zIndex: -1,
      }
    }}>
      <Box 
        sx={{ 
          mb: 6, 
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}
          >
            Visualize Your Project Vision
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto', 
              mb: 3,
              fontWeight: 400
            }}
          >
            Transform ideas into professional diagrams in seconds
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Chip
            icon={<ArchitectureIcon />}
            label="System Architecture"
            sx={{ 
              px: 2,
              bgcolor: 'rgba(25, 118, 210, 0.08)',
              color: 'primary.main',
              '& .MuiChip-icon': {
                color: 'primary.main'
              }
            }}
          />
          <Chip
            icon={<AutoGraphIcon />}
            label="Workflows"
            sx={{ 
              px: 2,
              bgcolor: 'rgba(25, 118, 210, 0.08)',
              color: 'primary.main',
              '& .MuiChip-icon': {
                color: 'primary.main'
              }
            }}
          />
          <Chip
            icon={<SchemaIcon />}
            label="Database Schemas"
            sx={{ 
              px: 2,
              bgcolor: 'rgba(25, 118, 210, 0.08)',
              color: 'primary.main',
              '& .MuiChip-icon': {
                color: 'primary.main'
              }
            }}
          />
        </Box>
      </Box>

      <Paper 
        elevation={1}
        sx={{ 
          p: 4, 
          mb: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <AutoGraphIcon sx={{ mt: 0.5, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              Describe Your Vision
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Let AI transform your description into a professional diagram
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Example: Design a microservices architecture for an e-commerce platform with user authentication, product catalog, and payment processing"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || isRecording}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#fff'
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !description.trim() || isRecording}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                color: '#fff',
                transition: 'all 0.2s ease-in-out',
                '&.MuiButton-contained': {
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                },
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(25, 118, 210, 0.25)'
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 4px rgba(25, 118, 210, 0.25)'
                },
                '&.Mui-disabled': {
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  opacity: 0.6,
                  color: '#fff'
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span className="loading-dots">Generating</span>
                </Box>
              ) : (
                'Generate Diagram'
              )}
            </Button>
            {isRecording ? (
              <IconButton 
                onClick={stopRecording} 
                title="Stop Recording"
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <StopIcon />
              </IconButton>
            ) : (
              <IconButton 
                onClick={handleVoiceInput} 
                disabled={loading || isRecording}
                title="Voice Input"
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <MicIcon />
              </IconButton>
            )}
            <Box sx={{ flex: 1 }} />
            <Link to="/use-cases" style={{ textDecoration: 'none' }}>
              <Button 
                startIcon={<InfoIcon />} 
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Learn More
              </Button>
            </Link>
            </Box>
        </form>
      </Paper>

      {error && (
        <Paper 
          elevation={0}
          sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'error.light',
            color: 'white',  // Changed to white for better visibility
            borderRadius: 2
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      )}

      {(mermaidCode || svg) && (
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
                Your Diagram
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
                <Button
                  startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                  onClick={handleCopyCode}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
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

          {viewMode === 'code' ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Edit the Mermaid code to customize your diagram
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                variant="outlined"
                value={mermaidCode}
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
              borderColor: 'divider'
            }}>
              {loading ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Generating your diagram...
                  </Typography>
                  <Typography color="text.secondary">
                    Our AI is crafting your visualization
                  </Typography>
                </Box>
              ) : svg ? (
                <div dangerouslySetInnerHTML={{ __html: svg }} />
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <AccountTreeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    Your diagram will appear here
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

