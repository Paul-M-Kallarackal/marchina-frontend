import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box,
  IconButton,
  Typography,
  Paper,
  Stack,
  Avatar,
  Container,
  Card,
  CardContent,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import { API_URL, WSS_URL } from '../constants/api';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AudioOutput from '../components/AudioOutput';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';

const Message = ({ content, audioData, isLoading, type, audioRef, setIsPlaying }) => {
  const theme = useTheme();
  
  return (
    <Fade in timeout={400}>
      <Box sx={{ mb: 2.5 }}>
        <Stack
          direction={type === 'user' ? 'row-reverse' : 'row'}
          spacing={2}
          alignItems="flex-start"
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: type === 'user' 
                ? 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'
                : 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
              boxShadow: theme.shadows[2]
            }}
          >
            {type === 'user' ? <PersonIcon sx={{ fontSize: 18 }} /> : <SmartToyIcon sx={{ fontSize: 18 }} />}
          </Avatar>
          
          <Card
            component={motion.div}
            whileHover={{ scale: 1.01 }}
            elevation={0}
            sx={{
              maxWidth: type === 'assistant' ? '70%' : '60%',
              bgcolor: type === 'user' 
                ? alpha(theme.palette.primary.main, 0.04)
                : 'background.paper',
              border: '1px solid',
              borderColor: type === 'user'
                ? alpha(theme.palette.primary.main, 0.1)
                : theme.palette.divider,
              borderRadius: 2,
              position: 'relative',
              overflow: 'visible',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 12,
                [type === 'user' ? 'right' : 'left']: -6,
                width: 12,
                height: 12,
                bgcolor: type === 'user' 
                  ? alpha(theme.palette.primary.main, 0.04)
                  : 'background.paper',
                borderLeft: type === 'user' ? 'none' : `1px solid ${theme.palette.divider}`,
                borderTop: `1px solid ${type === 'user' ? alpha(theme.palette.primary.main, 0.1) : theme.palette.divider}`,
                transform: 'rotate(45deg)',
                [type === 'user' ? 'borderRight' : 'borderLeft']: `1px solid ${type === 'user' ? alpha(theme.palette.primary.main, 0.1) : theme.palette.divider}`,
              }
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.primary',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  fontWeight: 400
                }}
              >
                {content}
              </Typography>
              {audioData && <AudioOutput audioData={audioData} audioRef={audioRef} setIsPlaying={setIsPlaying}/>}
              {isLoading && (
                <Stack 
                  direction="row" 
                  spacing={0.75} 
                  sx={{ mt: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      component={motion.div}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{ 
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: type === 'user' 
                          ? 'primary.main'
                          : 'secondary.main'
                      }}
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Fade>
  );
};

export const MarchinaVoice = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const theme = useTheme();
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: "Hi! I'm Marchina Voice. I can help you create any type of project. Just describe what you'd like to build, and I'll guide you through the process.",
      audioData: null,
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stopRecording, setStopRecording] = useState(() => () => {});
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const scrollContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, currentTranscription]);

  const handleAudioControl = () => {
    console.log("handleAudioControl called, audioRef:", audioRef.current);
    
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        console.log("Audio paused");
        audioRef.current.currentTime = 0;
        console.log("Audio position reset");
        
        const audio = audioRef.current;
        audio.removeEventListener('play', () => setIsPlaying(true));
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.removeEventListener('pause', () => setIsPlaying(false));
        
        audioRef.current = null;
        setIsPlaying(false);
        console.log("Audio cleanup complete");
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    } else {
      console.log("No audio reference to stop");
    }
  };

  const handleSendMessage = async (message) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: message
    }]);
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.response,
        audioData: data.audioData,
        requirementsGathered: data.requirementsGathered,
        projectId: data.projectId
      }]);
      if (data.audioData) {
        try {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioData}`);
          audioRef.current = audio;
          audio.addEventListener('play', () => setIsPlaying(true));
          audio.addEventListener('ended', () => setIsPlaying(false));
          audio.addEventListener('pause', () => setIsPlaying(false));
          await audio.play();
        } catch (error) {
          console.error("Error playing audio:", error);
        }
      }
      if (data.requirementsGathered && data.projectId) {
        navigate(`/projects/${data.projectId}`);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again.",
        audioData: null 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      setIsRecording(true);
      setCurrentTranscription('');
      console.log("Starting voice input...");
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log("Microphone access granted");
      const ws = new WebSocket(`${WSS_URL}/speech/stream`);
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(audioContext.destination);
      let isStopped = false;
      let finalTranscriptions = [];
      let currentPartial = '';
      const cleanup = () => {
        if (isStopped) return;
        isStopped = true;
        setWsConnected(false);
        console.log('Cleaning up audio resources');
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach(track => track.stop());
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        setIsRecording(false);
        if (finalTranscriptions.length > 0 || currentPartial) {
          const finalText = finalTranscriptions.join(' ') + (currentPartial ? ' ' + currentPartial : '');
          if (finalText.trim()) {
            handleSendMessage(finalText.trim());
          }
        }
      };
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setWsConnected(true);
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received transcription:', data);
          if (data.type === 'transcription') {
            if (data.isFinal) {
              finalTranscriptions.push(data.text);
              currentPartial = '';
            } else {
              currentPartial = data.text;
            }
            const finalText = finalTranscriptions.join(' ');
            const fullText = finalText + (currentPartial ? ' ' + currentPartial : '');
            setCurrentTranscription(fullText);
          } else if (data.type === 'error') {
            handleError(data.message);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        handleError('Error with transcription service. Please try again.');
        cleanup();
      };
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        cleanup();
      };
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && !isStopped) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32767)));
          }
          ws.send(pcmData.buffer);
        }
      };
      setStopRecording(() => () => {
        console.log('Manual stop recording triggered');
        cleanup();
      });
    } catch (error) {
      setWsConnected(false);
      console.error('Error with voice recording:', error);
      handleError('Error accessing microphone. Please check permissions and try again.');
      setIsRecording(false);
    }
  };

  const handleError = (error) => {
    setMessages((prev) => [
      ...prev,
      { type: 'assistant', content: `Error: ${error}`, audioData: null },
    ]);
    setIsRecording(false);
  };

  const breadcrumbs = [
    { label: 'Projects', path: '/projects' },
    { label: 'Marchina Voice' }
  ];

  const headerContent = (
    <Box sx={{ maxWidth: '800px', mx: 'auto', mb: { xs: 3, md: 4 } }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 600,
          mb: 1.5,
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}
      >
        Marchina Voice
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ 
          maxWidth: '600px',
          mx: 'auto',
          fontSize: '1rem',
          lineHeight: 1.6,
          textAlign: 'center'
        }}
      >
        Describe your project requirements naturally, and I'll help you create it step by step. 
        Just tap the microphone and start speaking.
      </Typography>
    </Box>
  );

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      headerContent={headerContent}
    >
      <Container 
        maxWidth="md" 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 240px)',
          pb: 3
        }}
      >
        {isProcessing }
        
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: '1px solid',
            borderColor: theme.palette.divider,
            bgcolor: 'background.paper',
            overflow: 'hidden'
          }}
        >
          <Box 
            ref={scrollContainerRef}
            sx={{ 
              flexGrow: 1,
              overflowY: 'auto',
              p: 3
            }}
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <Message
                  key={index}
                  type={message.type}
                  content={message.content}
                  audioData={message.audioData}
                  isLoading={isProcessing && index === messages.length - 1}
                  audioRef={audioRef}
                  setIsPlaying={setIsPlaying}

                />
              ))}
              {isRecording && (
                  <Message
                    key="recording-message"
                    type="user"
                    content={wsConnected ? currentTranscription : "Connecting..."}
                    isLoading={wsConnected}
                  />
              )}
            </AnimatePresence>
          </Box>

          <Box 
            sx={{ 
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{ 
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <Box
                component={motion.div}
                animate={{
                  scale: isRecording ? [1, 1.2, 1] : 1,
                  opacity: isRecording ? [0.3, 0.1, 0.3] : 0.15
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                sx={{
                  position: 'absolute',
                  inset: -6,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                }}
              />
              <Paper
                elevation={3}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: 1.5,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  background: isRecording && !isPlaying
                    ? 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  transition: 'all 0.3s ease'
                }}
              >
                <IconButton
                  onClick={() => {
                    if (isPlaying) {
                      handleAudioControl();
                    } else if (isRecording) {
                      stopRecording();
                    } else {
                      handleVoiceInput();
                    }
                  }}
                  disabled={isProcessing}
                  sx={{
                    color: '#fff',
                    '&:hover': {
                      bgcolor: 'transparent'
                    },
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                >
                  {isPlaying ? (
                    <StopIcon sx={{ fontSize: 28 }} />
                  ) : isRecording && !wsConnected ? (
                    <PendingIcon sx={{ fontSize: 28 }} />
                  ) : isRecording ? (
                    <StopIcon sx={{ fontSize: 28 }} />
                  ) : (
                    <MicIcon sx={{ fontSize: 28 }} />
                  )}
                </IconButton>
              </Paper>
            </Box>
          </Box>
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

export default MarchinaVoice;
