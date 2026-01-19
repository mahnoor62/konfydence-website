'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';

export default function AmbassadorPopup({ open, onClose }) {
  const router = useRouter();

  const handleContactUs = () => {
    onClose();
    router.push('/contact?topic=partnerships');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#063C5E',
            fontSize: { xs: '1.5rem', md: '1.75rem' },
          }}
        >
          Become a Konfydence Ambassador
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 3,
            color: '#0B7897',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          Help people recognize scam patterns before they get pressured.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              lineHeight: 1.8,
              color: 'text.primary',
              fontSize: '0.95rem',
            }}
          >
            Konfydence works with a small group of trusted people who introduce our tools where they genuinely help — in families, schools, workplaces, and communities.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              lineHeight: 1.8,
              color: 'text.primary',
              fontSize: '0.95rem',
            }}
          >
            This is not affiliate marketing or MLM. There&apos;s no recruiting, no volume targets, and no pressure to promote. Ambassadors are rewarded for real, responsible outcomes — not clicks.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              lineHeight: 1.8,
              color: 'text.primary',
              fontSize: '0.95rem',
            }}
          >
            We review each request to make sure it&apos;s a good fit.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              color: 'text.primary',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          >
            If this sounds aligned, tell us a bit about yourself and especially &quot;How would you introduce Konfydence to someone you trust?&quot;
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Close
        </Button>
        <Button
          onClick={handleContactUs}
          variant="contained"
          sx={{
            backgroundColor: '#FF725E',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              backgroundColor: '#e65a4a',
            },
          }}
        >
          Contact Us
        </Button>
      </DialogActions>
    </Dialog>
  );
}


