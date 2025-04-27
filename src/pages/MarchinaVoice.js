import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AudioOutput from '../components/AudioOutput';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

const Message = ({ content, audioData, isLoading, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="mb-6"
  >
    <div className={`flex items-start ${type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center mx-2
        ${type === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}
      `}>
        {type === 'user' ? <PersonIcon /> : <SmartToyIcon />}
      </div>
      <motion.div
        className={`rounded-2xl p-6 shadow-lg max-w-[80%] ${
          type === 'user' 
            ? 'bg-blue-500 text-white' 
            : 'bg-white text-gray-800'
        }`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <p className="text-lg">{content}</p>
        {audioData && <AudioOutput audioData={audioData} />}
        {isLoading && (
          <motion.div 
            className="flex gap-2 mt-4"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className={`w-2 h-2 ${type === 'user' ? 'bg-white' : 'bg-blue-500'} rounded-full`} />
            <div className={`w-2 h-2 ${type === 'user' ? 'bg-white' : 'bg-blue-500'} rounded-full`} />
            <div className={`w-2 h-2 ${type === 'user' ? 'bg-white' : 'bg-blue-500'} rounded-full`} />
          </motion.div>
        )}
      </motion.div>
    </div>
  </motion.div>
);

export const MarchinaVoice = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: "Hi! I'm Marchina Voice. What would you like to build?",
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

  // Add function to handle audio control
  // Update the handleAudioControl function
  const handleAudioControl = () => {
    console.log("handleAudioControl called, audioRef:", audioRef.current);
    
    if (audioRef.current) {
      try {
        // Try multiple approaches to ensure the audio stops
        audioRef.current.pause();
        console.log("Audio paused");
        
        // Some browsers might need this to fully stop
        audioRef.current.currentTime = 0;
        console.log("Audio position reset");
        
        // Remove event listeners to prevent memory leaks
        const audio = audioRef.current;
        audio.removeEventListener('play', () => setIsPlaying(true));
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.removeEventListener('pause', () => setIsPlaying(false));
        
        // Clear the reference
        audioRef.current = null;
        
        // Update state
        setIsPlaying(false);
        
        console.log("Audio cleanup complete");
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    } else {
      console.log("No audio reference to stop");
    }
  };

  // Function to handle sending messages
  const handleSendMessage = async (message) => {
    // Add user message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: message
    }]);
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add the token from AuthContext
        },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();

      console.log('API response data:', data);
      console.log('Response content:', data.response);
      console.log('Audio data received:', !!data.audioData);
      console.log('Requirements gathered:', data.requirementsGathered);

      
      // Add AI's response to chat
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.response,
        audioData: data.audioData,
        requirementsGathered: data.requirementsGathered,
        projectId: data.projectId
      }]);
      
      // Play audio response
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
      
       
      
      // If final message received, redirect to projects page
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
      
      const ws = new WebSocket('ws://localhost:8080/api/speech/stream');
      
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

        // If we have a final transcription, send it to the AI
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white"
    >
      <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-64px)]">
        {/* Messages Container */}
        <motion.div 
          className="flex-1 overflow-y-auto mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          ref={scrollContainerRef}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <Message
                key={index}
                type={message.type}
                content={message.content}
                audioData={message.audioData}
                isLoading={isProcessing && index === messages.length - 1}
              />
            ))}
            {/* Single message box that handles both states */}
            {isRecording && (
              <Message
                key="recording-message"
                type="user"
                content={wsConnected ? currentTranscription : ""}
                isLoading={wsConnected}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Voice Input */}
        <motion.div 
          className="flex justify-center items-center pb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-blue-500 rounded-full"
              animate={{
                scale: isRecording ? [1, 1.2, 1] : 1,
                opacity: isRecording ? [0.5, 0.3, 0.5] : 0.5
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className={`relative z-10 bg-white rounded-full p-6 shadow-lg cursor-pointer
                ${isRecording ? 'bg-red-50' : 'bg-white'}`}
              animate={{
                boxShadow: isRecording
                  ? '0 0 0 2px rgba(239, 68, 68, 0.5)'
                  : '0 0 0 2px rgba(59, 130, 246, 0.5)'
              }}
            >
              {/* // Update the IconButton render logic */}
              {/* // Replace the IconButton with this updated version */}
              {/* // Update the IconButton click handler */}
              <IconButton
                className={isRecording ? 'text-red-500' : isPlaying ? 'text-purple-500' : 'text-blue-500'}
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
              >
                {isPlaying ? (
                  <StopIcon sx={{ fontSize: 32 }} />
                ) : isRecording && !wsConnected ? (
                  <PendingIcon sx={{ fontSize: 32 }} />
                ) : isRecording ? (
                  <StopIcon sx={{ fontSize: 32 }} />
                ) : (
                  <MicIcon sx={{ fontSize: 32 }} />
                )}
              </IconButton>


            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MarchinaVoice;
