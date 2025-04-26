import React from 'react';
import { Button } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const AudioOutput = ({ audioData }) => {
  const handlePlayAudio = () => {
    if (audioData) {
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
  };

  if (!audioData) return null;

  return (
    <Button
      startIcon={<VolumeUpIcon />}
      onClick={handlePlayAudio}
      variant="outlined"
      size="small"
      sx={{ 
        borderRadius: 2
      }}
    >
      Replay Audio
    </Button>
  );
};

export default AudioOutput; 