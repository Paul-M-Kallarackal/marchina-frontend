import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

const VoiceInput = ({ onTranscriptionUpdate, onError, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stopRecording, setStopRecording] = useState(() => () => {});

  const handleVoiceInput = async () => {
    try {
      setIsRecording(true);
      
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
        
        console.log('Cleaning up audio resources');
        
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach(track => track.stop());
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        
        setIsRecording(false);
      };
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
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
            onTranscriptionUpdate(finalText + (currentPartial ? ' ' + currentPartial : ''));
          } else if (data.type === 'error') {
            onError(data.message);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError('Error with transcription service. Please try again.');
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
      console.error('Error with voice recording:', error);
      onError('Error accessing microphone. Please check permissions and try again.');
      setIsRecording(false);
    }
  };

  return (
    <IconButton 
      onClick={isRecording ? stopRecording : handleVoiceInput}
      disabled={disabled}
      title={isRecording ? "Stop Recording" : "Voice Input"}
      sx={{ 
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {isRecording ? <StopIcon /> : <MicIcon />}
    </IconButton>
  );
};

export default VoiceInput; 