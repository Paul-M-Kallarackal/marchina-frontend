import React from 'react';
import { Box, CircularProgress, Typography, alpha } from '@mui/material';

const LoadingAnimation = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%',
        background: `linear-gradient(135deg, ${alpha('#6366f1', 0.02)} 0%, ${alpha('#a855f7', 0.02)} 100%)`,
        borderRadius: 3,
        p: 4,
      }}
    >
      <CircularProgress
        size={48}
        thickness={4}
        sx={{
          mb: 2,
          color: 'transparent',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
            stroke: 'url(#gradient)',
          },
        }}
      />
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <Typography
        variant="h6"
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          fontWeight: 600,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingAnimation; 