import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Paper, TextField, Button, Typography, IconButton, ToggleButton, ToggleButtonGroup, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import StopIcon from '@mui/icons-material/Stop';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoIcon from '@mui/icons-material/Info';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import SchemaIcon from '@mui/icons-material/Schema';
import { processRequest, createDiagram } from '../services/api';
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

// Helper function to create ER diagram animation frames
const reorganizeErDiagram = (code) => {
  if (!code.trim().toLowerCase().startsWith('erdiagram')) {
    return [code]; // Not an ER diagram, return as single frame
  }
  
  // First, let's find where the entity definitions end and relationships begin
  const fullCode = code.trim();
  const lastBraceIndex = fullCode.lastIndexOf('}');
  
  if (lastBraceIndex === -1) {
    return [code]; // No entity definitions with braces found
  }
  
  // Split the code into the erDiagram declaration, entity definitions, and relationships
  const erDiagramDeclaration = fullCode.split('\n')[0]; // First line with erDiagram
  const relationshipsPart = fullCode.substring(lastBraceIndex + 1).trim();
  const entityDefinitionsPart = fullCode.substring(
    erDiagramDeclaration.length, 
    lastBraceIndex + 1
  ).trim();
  
  // Split entity definitions into individual entities
  const entityDefinitions = [];
  let currentEntity = '';
  let braceCount = 0;
  
  for (const line of entityDefinitionsPart.split('\n')) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (trimmedLine.length === 0) continue;
    
    // Count opening braces
    for (const char of trimmedLine) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    // Add line to current entity
    if (currentEntity.length > 0) {
      currentEntity += '\n' + trimmedLine;
    } else {
      currentEntity = trimmedLine;
    }
    
    // If braces are balanced, we've completed an entity definition
    if (braceCount === 0 && currentEntity.includes('{') && currentEntity.includes('}')) {
      entityDefinitions.push(currentEntity);
      currentEntity = '';
    }
  }
  
  // Create animation frames
  const frames = [];
  
  // First frame: erDiagram declaration + relationships
  frames.push(`${erDiagramDeclaration}\n${relationshipsPart}`);
  
  // Subsequent frames: Add one entity at a time while keeping relationships
  for (let i = 0; i < entityDefinitions.length; i++) {
    const currentEntities = entityDefinitions.slice(0, i + 1).join('\n');
    frames.push(`${erDiagramDeclaration}\n${currentEntities}\n${relationshipsPart}`);
  }
  
  return frames;
};

export default function DiagramGenerator() {
  const [description, setDescription] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [currentAnimatedCode, setCurrentAnimatedCode] = useState('');
  const [svg, setSvg] = useState('');
  const [finalSvg, setFinalSvg] = useState(''); // Store the final SVG for size reference
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('diagram');
  const [copied, setCopied] = useState(false);
  const [diagramId, setDiagramId] = useState('');
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

  // Effect to render the current animated code
  useEffect(() => {
    if (currentAnimatedCode) {
      renderDiagram(currentAnimatedCode).catch(error => {
        console.error('Error during animation rendering:', error);
        // If there's an error during animation, fall back to rendering the full diagram
        if (mermaidCode) {
          renderDiagram(mermaidCode).catch(e => console.error('Fallback rendering failed:', e));
        }
        setIsAnimating(false);
      });
    }
  }, [currentAnimatedCode, renderDiagram, mermaidCode]);

  // Effect to scroll to diagram when it's rendered
  useEffect(() => {
    if (svg && diagramContainerRef.current) {
      diagramContainerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [svg]);

  // Clean up animation timeouts on unmount
  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, []);

  // Effect to ensure diagram updates when container size changes
  useEffect(() => {
    if (mermaidCode && !isAnimating && containerSize.width > 0) {
      renderDiagram(mermaidCode).catch(error => {
        console.error('Error rendering after container resize:', error);
      });
    }
  }, [containerSize, mermaidCode, renderDiagram, isAnimating]);

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

      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Process the request to get Mermaid code
      const mermaidCode = await processRequest(description);
      
      // Create new diagram with the generated code
      const newDiagram = await createDiagram({
        title: 'Generated Diagram',
        description: description,
        mermaidCode: mermaidCode,
        token: token
      });

      // Update UI state
      setMermaidCode(mermaidCode);
      setDiagramId(newDiagram.id);
      setLoading(false);
    } catch (error) {
      console.error('Error creating diagram:', error);
      setError(error.message || 'Failed to create diagram');
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
      // First update the container size based on the new code
      await preRenderFinalDiagram(newCode);
      
      // Then render the diagram with the new code
      await renderDiagram(newCode);
      
      // Clear any animation state
      setIsAnimating(false);
      setCurrentAnimatedCode('');
    } catch (error) {
      console.error('Error updating diagram:', error);
      setError('Error rendering diagram. Please check your syntax.');
    }
  };

  // Add a function to restart the animation
  const handleRestartAnimation = () => {
    if (mermaidCode) {
      animateDiagramRendering(mermaidCode);
    }
  };

  return (
    <Box sx={{  
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

        <form onSubmit={handleCreateDiagram}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Example: Design a microservices architecture for an e-commerce platform with user authentication, product catalog, and payment processing"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || isRecording}
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
                  <span className="loading-dots">Reasoning</span>
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
          ref={diagramContainerRef}
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
    '& .MuiToggleButtonGroup-grouped': {
      borderRadius: 2, // Keep the curved appearance
      mx: 0, // Remove horizontal margin
      border: '1px solid',
      borderColor: theme => theme.palette.divider,
      '&:not(:first-of-type)': {
        borderLeftColor: 'transparent', // Make left border transparent instead of removing it
      },
      '&:first-of-type': {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
      '&:last-of-type': {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      },
      '&:not(:first-of-type):not(:last-of-type)': {
        borderRadius: 0,
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
              
              {/* Add replay animation button
              {mermaidCode && viewMode === 'diagram' && !isAnimating && (
                <Button
                  onClick={handleRestartAnimation}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Replay Animation
                </Button>
              )} */}
              
              {/* Audio replay button */}
              {audioData && (
                <Button
                  startIcon={<VolumeUpIcon />}
                  onClick={() => {
                    const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
                    audio.play().catch(err => console.error('Error replaying audio:', err));
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    borderRadius: 2
                  }}
                >
                  Replay Audio
                </Button>
              )}
              
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
              height: containerSize.height > 0 ? containerSize.height : 400,
              maxWidth: '100%', // Ensure it doesn't overflow the parent
              width: containerSize.width > 0 ? containerSize.width : '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#fff',
              borderRadius: 2,
              p: 2, // Reduced padding from 3 to 2
              border: '1px solid',
              borderColor: 'divider',
              margin: '0 auto',
              position: 'relative',
              overflow: 'auto', // Changed from 'hidden' to 'auto' to allow scrolling if needed
              transition: 'all 0.3s ease-in-out'
            }}>
              {loading ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Thinking about your diagram...
                  </Typography>
                  <Typography color="text.secondary">
                    Our AI is crafting your visualization
                  </Typography>
                </Box>
              ) : svg ? (
                <div 
                  className="mermaid-diagram-container"
                  ref={svgContainerRef}
                  dangerouslySetInnerHTML={{ __html: svg }} 
                  style={{ 
                    transition: 'opacity 0.15s ease-in-out',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    // Remove absolute positioning to prevent overflow issues
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                />
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
          
          {/* Animation status indicator */}
          {isAnimating && viewMode === 'diagram' && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="primary.main">
                Building diagram... {currentAnimatedCode.split('\n').length} of {mermaidCode.split('\n').length} lines
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

