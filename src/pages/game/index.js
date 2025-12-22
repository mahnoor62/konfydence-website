import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  IconButton,
  Stack,
  Typography,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './game.module.css';

// Confetti function (lightweight implementation) - top-center burst (party-popper style)
const triggerConfetti = () => {
  if (typeof window === 'undefined') return;
  
  const colors = ['#008B8B', '#33BABA', '#FFC247', '#FF725E', '#FFFFFF'];
  const confettiCount = 250;
  const duration = 4000;
  
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  
  // Burst point at top-center of screen
  const burstX = canvas.width / 2;
  const burstY = 50; // Top-center position
  
  // Create particles bursting from top-center in all directions
  for (let i = 0; i < confettiCount; i++) {
    // Random angle for burst effect (spread in all directions)
    const angle = (Math.PI * 2 * i) / confettiCount + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 12 + 8; // Burst speed
    
    particles.push({
      x: burstX,
      y: burstY,
      vx: Math.cos(angle) * speed, // Horizontal velocity based on angle
      vy: Math.sin(angle) * speed + 2, // Vertical velocity (mostly downward but with spread)
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 12 + 6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      gravity: 0.3, // Gravity pulling down
    });
  }
  
  let startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      document.body.removeChild(canvas);
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      particle.vy += particle.gravity; // Apply gravity (accelerates downward)
      
      // Only draw if particle is still visible
      if (particle.y > -50 && particle.y < canvas.height + 50 && 
          particle.x > -50 && particle.x < canvas.width + 50) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();
      }
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

// Code verification component
const CodeVerificationDialog = ({ 
  open, 
  onClose, 
  onVerified, 
  forceOpen = false,
  setTrialInfo,
  setSeatsAvailable,
  setCodeVerified,
  setShowCodeDialog,
  allowCancel = false // New prop to allow cancel button to close dialog
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [trialCode, setTrialCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [codeFromClipboard, setCodeFromClipboard] = useState('');
  const [userCancelled, setUserCancelled] = useState(false); // Track if user clicked cancel

  // Reset userCancelled when dialog opens (when open prop changes from false to true)
  useEffect(() => {
    if (open) {
      console.log('Dialog opening - resetting userCancelled');
      setUserCancelled(false);
    }
  }, [open]);

  // Check clipboard for code when dialog opens
  useEffect(() => {
    if (open && navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(text => {
        const codePattern = /^\d{4}-[A-Z]{3}\d{1}-[A-Z]{1}\d{3}$/;
        if (codePattern.test(text.trim())) {
          setCodeFromClipboard(text.trim());
          setTrialCode(text.trim());
        }
      }).catch(() => {
        // Clipboard read failed, ignore
      });
    }
  }, [open]);

  // REMOVED: Auto-verification from sessionStorage
  // We want to always show the dialog on page load

  const verifyCode = async (codeToVerify) => {
    if (!codeToVerify || codeToVerify.trim() === '') {
      setError('Please enter a code');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      // First check if it's a trial code (FreeTrial table)
      let isTrialCode = false;
      try {
        // Pass userId in query if user is logged in to check if they already played
        const userId = user?._id || user?.id || null;
        const checkUrl = userId 
          ? `${API_URL}/free-trial/check-code/${codeToVerify}?userId=${userId}`
          : `${API_URL}/free-trial/check-code/${codeToVerify}`;
        const checkResponse = await axios.get(checkUrl);
        
        if (checkResponse.data.valid) {
          // It's a valid trial code - process it
          isTrialCode = true;
          const trial = checkResponse.data.trial;
          
          // Check if user already played - show error in dialog but keep dialog open
          if (checkResponse.data.alreadyPlayed || checkResponse.data.seatsFinished) {
            setError('You have already played the game with this code. Your seats are finished. You cannot play the game with any other seat.');
            setVerifying(false);
            // Keep dialog open so user can try another code
            return;
          }
          
          // Check if seats are available before proceeding - show error in dialog but keep dialog open
          if (checkResponse.data.seatsFull || trial.remainingSeats <= 0) {
            const maxSeats = trial.maxSeats || 2;
            setError(`You have only ${maxSeats} seat${maxSeats > 1 ? 's' : ''}. Your seats are completed.`);
            setVerifying(false);
            // Keep dialog open so user can try another code
            return;
          }
          
          // Show trial details to user
          console.log('Trial details:', {
            packageName: trial.packageName,
            remainingSeats: trial.remainingSeats,
            maxSeats: trial.maxSeats,
            expiresAt: trial.expiresAt,
          });

          if (user) {
            const token = localStorage.getItem('token');
            try {
              const useResponse = await axios.post(
                `${API_URL}/free-trial/use-code`,
                { code: codeToVerify },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              // Store trial info for seats display
              const trial = useResponse.data.trial;
              const remainingSeats = trial.remainingSeats || (trial.maxSeats - trial.usedSeats);
              const hasSeats = remainingSeats > 0;
              
              // Check expiry
              const endDate = new Date(trial.endDate || trial.expiresAt);
              const isExpired = new Date() > endDate;
              
              // Handle gamePlays - it could be an array or a number
              const gamePlaysCount = Array.isArray(trial.gamePlays) 
                ? trial.gamePlays.length 
                : (typeof trial.gamePlays === 'number' ? trial.gamePlays : 0);
              
              setTrialInfo({
                _id: trial._id || trial.id, // Store free trial ID for progress saving
                maxSeats: trial.maxSeats,
                usedSeats: trial.usedSeats,
                remainingSeats: remainingSeats,
                codeApplications: trial.codeApplications || 0,
                gamePlays: gamePlaysCount,
                endDate: endDate,
                isExpired: isExpired,
                packageName: trial.packageId?.name || 'Package',
                productId: trial.productId || null
              });
              
              setSeatsAvailable(hasSeats && !isExpired);
              
              // Only save to sessionStorage if seats available
              if (hasSeats && !isExpired) {
                sessionStorage.setItem('codeVerified', 'true');
                sessionStorage.setItem('codeType', 'trial');
                sessionStorage.setItem('code', codeToVerify);
                sessionStorage.setItem('trialData', JSON.stringify(trial));
                // Save packageId and productId for fetching cards
                if (trial.packageId) {
                  const packageId = trial.packageId._id || trial.packageId;
                  sessionStorage.setItem('packageId', packageId.toString());
                }
                if (trial.productId) {
                  const productId = trial.productId._id || trial.productId;
                  sessionStorage.setItem('productId', productId.toString());
                }
                setCodeVerified(true);
                setShowCodeDialog(false);
              } else {
              // Seats full or expired - show error but don't verify
              if (isExpired) {
                setError('Free trial has expired. You cannot play the game.');
              } else {
                const maxSeats = trial.maxSeats || 2;
                setError(`You have only ${maxSeats} seat${maxSeats > 1 ? 's' : ''}. Your seats are completed.`);
              }
                setVerifying(false);
              }
              return;
            } catch (useErr) {
              // Show specific error messages from backend
              console.error('Error using trial code:', useErr.response?.data || useErr.message);
              console.error('Full error:', useErr);
              
              const errorData = useErr.response?.data || {};
              let errorMsg = errorData.error || 'Cannot use this trial code';
              
              // Special handling for specific errors
              if (errorData.alreadyPlayed || errorData.seatsFinished || errorData.error?.includes('seats finish')) {
                errorMsg = errorData.error || 'You have already played the game with this code. Your seats are finished. You cannot play the game with any other seat.';
              } else if (errorData.seatsFull || errorData.error?.includes('seats are completed')) {
                const maxSeats = errorData.maxSeats || trial?.maxSeats || 2;
                errorMsg = errorData.error || `You have only ${maxSeats} seat${maxSeats > 1 ? 's' : ''}. Your seats are completed.`;
              } else if (errorData.error && errorData.error.includes('expired')) {
                errorMsg = 'Free trial has expired. You cannot play the game.';
              } else if (errorData.error && errorData.error.includes('no longer active')) {
                errorMsg = 'This trial code is no longer active.';
              } else if (useErr.response?.status === 404) {
                errorMsg = 'Invalid code. Please check and try again.';
              } else if (useErr.response?.status === 401) {
                errorMsg = 'Authentication failed. Please login again.';
              } else if (useErr.response?.status === 403) {
                // Show backend error message for 403 (member validation errors)
                errorMsg = errorData.error || 'You do not have permission to use this code.';
              } else if (useErr.response?.status === 500) {
                errorMsg = 'Server error. Please try again later.';
              } else if (!errorData.error && useErr.message) {
                errorMsg = `Error: ${useErr.message}. Please try again.`;
              }
              
              setError(errorMsg);
              setVerifying(false);
              return;
            }
          } else {
            setError('Please login to use this trial code');
            router.push(`/login?redirect=${encodeURIComponent('/game')}`);
            setVerifying(false);
            return;
          }
        } else {
          // Trial code is invalid (valid: false) - check reason before trying purchase code
          const errorData = checkResponse.data || {};
          
          // If user already played, show specific message
          if (errorData.alreadyPlayed || errorData.seatsFinished) {
            setError('You have already played the game with this code. Your seats are finished. You cannot play the game with any other seat.');
            setVerifying(false);
            return;
          } else if (errorData.seatsFull) {
            const maxSeats = errorData.maxSeats || 2;
            setError(`You have only ${maxSeats} seat${maxSeats > 1 ? 's' : ''}. Your seats are completed.`);
            setVerifying(false);
            return;
          } else if (errorData.isExpired) {
            setError('Free trial has expired. You cannot play the game.');
            setVerifying(false);
            return;
          } else if (errorData.message && errorData.message.includes('no longer active')) {
            setError('This trial code is no longer active.');
            setVerifying(false);
            return;
          }
          // If it's just an invalid trial code (not found), continue to check purchase code
        }
        // If trial code is invalid (valid: false and not seats/expiry issue), continue to check purchase code
      } catch (trialErr) {
        // Network error or other error checking trial - continue to check purchase code
        console.log('Trial check error, will check purchase code:', trialErr.message);
      }
      
      // If not a trial code, check if it's a purchase code (Transaction table)
      if (!isTrialCode) {
        try {
          const purchaseCheckResponse = await axios.get(`${API_URL}/payments/check-purchase-code/${codeToVerify}`);
          
          if (purchaseCheckResponse.data.valid) {
            // It's a valid purchase code - check details
            const transaction = purchaseCheckResponse.data.transaction;
            
            // Check package type - only allow digital and digital_physical packages - show error in dialog but keep dialog open
            const packageType = transaction.packageType || 'standard';
            if (packageType === 'physical') {
              setError('This package type is physical. You have purchased physical cards, so online game play is not allowed. Please use your physical cards to play.');
              setVerifying(false);
              // Keep dialog open so user can try another code
              return;
            }
            
            // Check if user already played - show error in dialog but keep dialog open
            if (purchaseCheckResponse.data.alreadyPlayed || purchaseCheckResponse.data.seatsFinished) {
              setError('You have already played the game with this code. Your seats are finished. You cannot play the game with any other seat.');
              setVerifying(false);
              // Keep dialog open so user can try another code
              return;
            }
            
            // Check if seats are available before proceeding - show error in dialog but keep dialog open
            if (purchaseCheckResponse.data.seatsFull || !transaction.seatsAvailable || transaction.remainingSeats <= 0) {
              const maxSeats = transaction.maxSeats || 5;
              setError(`You have only ${maxSeats} seat${maxSeats > 1 ? 's' : ''}. Your seats are completed.`);
              setVerifying(false);
              // Keep dialog open so user can try another code
              return;
            }
            
            // Check if expired - show error in dialog but keep dialog open
            if (purchaseCheckResponse.data.isExpired) {
              setError('Purchase code has expired. You cannot play the game.');
              setVerifying(false);
              // Keep dialog open so user can try another code
              return;
            }
            
            if (user) {
              const token = localStorage.getItem('token');
              try {
                const useResponse = await axios.post(
                  `${API_URL}/payments/use-purchase-code`,
                  { code: codeToVerify },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                // Store transaction info for seats display
                const transactionData = useResponse.data.transaction;
                
                // Check package type again (double check from use-purchase-code response)
                const packageType = transactionData.packageType || 'standard';
                if (packageType === 'physical') {
                  setError('This package type is physical. You have purchased physical cards, so online game play is not allowed. Please use your physical cards to play.');
                  setVerifying(false);
                  return;
                }
                
                const remainingSeats = transactionData.remainingSeats || (transactionData.maxSeats - transactionData.usedSeats);
                const hasSeats = remainingSeats > 0;
                
                // Check expiry
                const endDate = transactionData.endDate ? new Date(transactionData.endDate) : null;
                const isExpired = endDate ? new Date() > endDate : false;
                
                // Handle gamePlays - it could be an array or a number
                const gamePlaysCount = Array.isArray(transactionData.gamePlays) 
                  ? transactionData.gamePlays.length 
                  : (typeof transactionData.gamePlays === 'number' ? transactionData.gamePlays : 0);
                
                // Store transactionId for progress saving
                const transactionId = transactionData._id || transactionData.id || null;
                
                setTrialInfo({
                  _id: transactionId, // Store transaction ID for progress saving
                  transactionId: transactionId, // Also store as transactionId for clarity
                  maxSeats: transactionData.maxSeats || 5,
                  usedSeats: transactionData.usedSeats || 0,
                  remainingSeats: remainingSeats,
                  codeApplications: transactionData.codeApplications || 0,
                  gamePlays: gamePlaysCount,
                  endDate: endDate,
                  isExpired: isExpired,
                  packageName: transactionData.packageName || 'Package',
                  productId: transactionData.productId || null
                });
                
                setSeatsAvailable(hasSeats && !isExpired);
                
                // Only save to sessionStorage if seats available
                if (hasSeats && !isExpired) {
                  sessionStorage.setItem('codeVerified', 'true');
                  sessionStorage.setItem('codeType', 'purchase');
                  sessionStorage.setItem('code', codeToVerify);
                  sessionStorage.setItem('transactionData', JSON.stringify(transactionData));
                  // Save packageId and productId for fetching cards
                  if (transactionData.packageId) {
                    const packageId = transactionData.packageId._id || transactionData.packageId;
                    sessionStorage.setItem('packageId', packageId.toString());
                  }
                  if (transactionData.productId) {
                    const productId = transactionData.productId._id || transactionData.productId;
                    sessionStorage.setItem('productId', productId.toString());
                  }
                  setCodeVerified(true);
                  setShowCodeDialog(false);
                } else {
                  // Seats full or expired - show error but don't verify
                  if (isExpired) {
                    setError('Purchase code has expired. You cannot play the game.');
                  } else {
                    setError('All seats have been used. You cannot play the game.');
                  }
                  setVerifying(false);
                }
                return;image.png
              } catch (useErr) {
                const errorData = useErr.response?.data || {};
                let errorMsg = errorData.error || 'Cannot use this purchase code';
                
                // Special handling for specific errors
                if (errorData.alreadyPlayed || errorData.error?.includes('already played')) {
                  errorMsg = errorData.error || 'You have already played the game with this code. Each seat can only be used once.';
                } else if (errorData.seatsFull || errorData.error?.includes('seats are completed')) {
                  const maxSeats = errorData.maxSeats || 5;
                  errorMsg = errorData.error || `You have only ${maxSeats} seat${maxSeats > 1 ? 's' : ''}. Your seats are completed.`;
                } else if (errorData.error && errorData.error.includes('expired')) {
                  errorMsg = 'Purchase code has expired. You cannot play the game.';
                } else if (useErr.response?.status === 404) {
                  errorMsg = 'Invalid code. Please check and try again.';
                } else if (useErr.response?.status === 401) {
                  errorMsg = 'Authentication failed. Please login again.';
                } else if (useErr.response?.status === 403) {
                  // Show backend error message for 403 (member validation errors)
                  errorMsg = errorData.error || 'You do not have permission to use this code.';
                }
                
                setError(errorMsg);
                setVerifying(false);
                return;
              }
            } else {
              setError('Please login to verify your purchase code');
              router.push(`/login?redirect=${encodeURIComponent('/game')}`);
              setVerifying(false);
              return;
            }
          } else {
            // Purchase code check returned valid: false - check the reason
            const errorData = purchaseCheckResponse.data || {};
            
            // Show specific error message from API
            if (errorData.seatsFull) {
              setError('All seats have been used. You cannot play the game.');
            } else if (errorData.isExpired) {
              setError('Purchase code has expired. You cannot play the game.');
            } else {
              // Generic invalid code message
              setError(errorData.message || 'Invalid code');
            }
            setVerifying(false);
            return;
          }
        } catch (purchaseErr) {
          // Network error or other error checking purchase code
          console.error('Error checking purchase code:', purchaseErr);
          
          // Check if it's a 404 or actual error
          if (purchaseErr.response?.status === 404 || purchaseErr.response?.status === 400) {
            setError('Invalid code. Please enter a valid trial code or purchase code.');
          } else {
            setError('Error verifying code. Please try again.');
          }
          setVerifying(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Failed to verify code. Please try again.');
      setVerifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCode(trialCode);
  };

  const handleUseClipboardCode = () => {
    setTrialCode(codeFromClipboard);
    verifyCode(codeFromClipboard);
  };

  // Debug logging
  useEffect(() => {
    console.log('CodeVerificationDialog - open:', open, 'forceOpen:', forceOpen);
  }, [open, forceOpen]);

  // Force open if forceOpen is true, but allow closing if user clicked cancel
  // If user cancelled, always close the dialog regardless of other props
  const dialogOpen = userCancelled ? false : (forceOpen ? true : (open && !userCancelled));

  return (
    <Dialog 
      open={dialogOpen} 
      onClose={() => {
        // If user cancelled, allow closing
        if (userCancelled) {
          console.log('Dialog closing - user clicked cancel/cross');
          if (setShowCodeDialog) {
            setShowCodeDialog(false);
          }
          if (onClose) {
            onClose();
          }
          return;
        }
        // If forceOpen is true and user hasn't cancelled, don't allow closing
        if (forceOpen && !userCancelled) {
          console.log('Dialog close attempted but forceOpen is true - ignoring');
          return;
        }
        // If there's an error, don't allow closing
        if (error) {
          console.log('Dialog close attempted but error exists - keeping dialog open');
          return;
        }
        // Otherwise, allow closing
        if (onClose) {
          onClose();
        }
      }} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={(forceOpen && !userCancelled) || !!error}
      disableBackdropClick={(forceOpen && !userCancelled) || !!error}
      sx={{
        zIndex: 9999,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998,
        },
        '& .MuiDialog-container': {
          zIndex: 9999,
        },
        '& .MuiDialog-paper': {
          zIndex: 9999,
          position: 'relative',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#063C5E' }}>
            Enter Your Code
          </Typography>
          <IconButton
            onClick={() => {
              console.log('Cross button clicked - closing dialog');
              // Set user cancelled flag to allow closing even when forceOpen is true
              setUserCancelled(true);
              // Close the dialog by setting showCodeDialog to false
              if (setShowCodeDialog) {
                setShowCodeDialog(false);
              }
              // Also call onClose if provided - this will handle the close
              if (onClose) {
                onClose();
              }
            }}
            disabled={verifying}
            sx={{
              color: '#063C5E',
              '&:hover': {
                backgroundColor: 'rgba(6, 60, 94, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Please enter your code to access the game. If you have a free trial, enter your trial code. If you made a purchase, enter the code you received after payment.
          </Typography>

          {codeFromClipboard && (
            <Alert 
              severity="info"
              action={
                <Button size="small" onClick={handleUseClipboardCode} disabled={verifying}>
                  Use
                </Button>
              }
            >
              Found code in clipboard: {codeFromClipboard}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Trial Code"
                value={trialCode}
                onChange={(e) => setTrialCode(e.target.value.toUpperCase())}
                placeholder="4573-DTE2-R232"
                fullWidth
                required
                disabled={verifying}
                autoFocus
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  },
                }}
              />

              {error && (
                <Alert severity="error">{error}</Alert>
              )}
            </Stack>
          </form>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        {!forceOpen && !error && (
          <Button
            onClick={onClose}
            disabled={verifying}
            sx={{ 
              color: '#063C5E',
              '&:hover': {
                backgroundColor: 'rgba(6, 60, 94, 0.1)',
              },
            }}
          >
            Close
          </Button>
        )}
        <Button
          onClick={() => {
            console.log('Cancel button clicked - closing dialog');
            // Set user cancelled flag to allow closing even when forceOpen is true
            setUserCancelled(true);
            // Close the dialog by setting showCodeDialog to false
            if (setShowCodeDialog) {
              setShowCodeDialog(false);
            }
            // Also call onClose if provided - this will handle the close
            if (onClose) {
              onClose();
            }
          }}
          disabled={verifying}
          sx={{ 
            color: '#063C5E',
            '&:hover': {
              backgroundColor: 'rgba(6, 60, 94, 0.1)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            verifyCode(trialCode);
          }}
          variant="contained"
          disabled={verifying || !trialCode.trim()}
          sx={{
            backgroundColor: '#0B7897',
            color: 'white',
            fontWeight: 700,
            px: 4,
            '&:hover': {
              backgroundColor: '#063C5E',
            },
          }}
        >
          {verifying ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: 'white' }} />
              Verifying...
            </Box>
          ) : (
            'Verify & Start'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper functionss
const getRiskLevel = (finalScore) => {
  if (finalScore >= 84) return { level: 'Confident', color: '#008B8B' };
  if (finalScore >= 44) return { level: 'Cautious', color: '#FFC247' };
  return { level: 'Vulnerable', color: '#FF725E' };
};

const getSummaryMessage = (finalScore) => {
  if (finalScore >= 84) {
    return 'Excellent work! You demonstrate strong cybersecurity awareness and are well-prepared to handle digital threats.';
  }
  if (finalScore >= 44) {
    return 'Good effort! You have a solid foundation, but there\'s room to improve your cybersecurity knowledge. Keep learning!';
  }
  return 'There\'s significant room for improvement. Consider taking cybersecurity training to better protect yourself online.';
};

export default function GamePage() {
  const router = useRouter();
  const { user } = useAuth();
  // Initialize state - always start with false to avoid hydration mismatch
  // Initialize codeVerified and showCodeDialog from sessionStorage on mount
  // IMPORTANT: Always start with false to ensure dialog shows on page load
  const [codeVerified, setCodeVerified] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(true); // Always start with true to show dialog on load
  const [mounted, setMounted] = useState(false);
  // IMPORTANT: Always start with 'landing' - don't allow game to start without code verification
  const [gameState, setGameState] = useState('landing'); // landing, levelSelect, game, summary
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [availableLevels, setAvailableLevels] = useState([]); // Track which levels are available - start empty until checked
  const [checkingLevels, setCheckingLevels] = useState(false); // Track if we're checking levels
  const [scenarios, setScenarios] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCardLocked, setIsCardLocked] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [howToPlayScreen, setHowToPlayScreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [completedLevels, setCompletedLevels] = useState([]); // Array to track completed levels with their scores
  const [trialInfo, setTrialInfo] = useState(null); // Store trial seats info
  const [seatsAvailable, setSeatsAvailable] = useState(false); // Track if seats are available
  const [errorModal, setErrorModal] = useState({ open: false, message: '', title: 'Error' }); // Error modal state

  // Mark component as mounted (client-side only)
  // IMPORTANT: This runs FIRST on page load/refresh
  useEffect(() => {
    console.log('🚀 Component mounting - ALWAYS show dialog first, then check verification');
    
    // CRITICAL: Always show dialog on page load/refresh FIRST
    // Don't check sessionStorage immediately - let user verify code again
    setCodeVerified(false);
    setShowCodeDialog(true);
    setGameState('landing');
    
    // Mark as mounted
    setMounted(true);
    
    // Then check sessionStorage in background (but don't auto-verify)
    if (typeof window !== 'undefined') {
      const codeVerifiedStorage = sessionStorage.getItem('codeVerified') === 'true';
      const productId = sessionStorage.getItem('productId');
      const packageId = sessionStorage.getItem('packageId');
      const codeType = sessionStorage.getItem('codeType');
      
      console.log('🔍 SessionStorage check (for info only):', {
        codeVerified: codeVerifiedStorage,
        productId,
        packageId,
        codeType
      });
      
      // If we have verified data, restore trialInfo but DON'T auto-verify
      // User must verify code again via dialog
      if (codeVerifiedStorage && (productId || packageId)) {
        console.log('ℹ️ Found verified data in sessionStorage - will restore after user verifies');
        
        // Restore trialInfo if available (for display purposes only)
        if (codeType === 'trial') {
          const trialDataStr = sessionStorage.getItem('trialData');
          if (trialDataStr) {
            try {
              const trialData = JSON.parse(trialDataStr);
              setTrialInfo({
                _id: trialData._id || trialData.id,
                maxSeats: trialData.maxSeats || 2,
                usedSeats: trialData.usedSeats || 0,
                remainingSeats: (trialData.maxSeats || 2) - (trialData.usedSeats || 0),
                codeApplications: trialData.codeApplications || 0,
                gamePlays: trialData.gamePlays || 0,
                endDate: trialData.endDate || trialData.expiresAt,
                isExpired: trialData.isExpired || false,
                packageName: trialData.packageName || 'Package',
                productId: productId || trialData.productId?._id || trialData.productId || null
              });
            } catch (e) {
              console.error('Error parsing trialData:', e);
            }
          }
        } else if (codeType === 'purchase') {
          const transactionDataStr = sessionStorage.getItem('transactionData');
          if (transactionDataStr) {
            try {
              const transactionData = JSON.parse(transactionDataStr);
              setTrialInfo({
                _id: transactionData._id || transactionData.id,
                transactionId: transactionData._id || transactionData.id,
                maxSeats: transactionData.maxSeats || 5,
                usedSeats: transactionData.usedSeats || 0,
                remainingSeats: (transactionData.maxSeats || 5) - (transactionData.usedSeats || 0),
                codeApplications: transactionData.codeApplications || 0,
                gamePlays: transactionData.gamePlays || 0,
                endDate: transactionData.endDate || transactionData.expiresAt,
                isExpired: transactionData.isExpired || false,
                packageName: transactionData.packageName || 'Package',
                productId: productId || transactionData.productId?._id || transactionData.productId || null
              });
            } catch (e) {
              console.error('Error parsing transactionData:', e);
            }
          }
        }
      } else {
        console.log('❌ No verified data found - clearing stale sessionStorage');
        // Clear any stale sessionStorage data
        sessionStorage.removeItem('codeVerified');
        sessionStorage.removeItem('codeType');
        sessionStorage.removeItem('code');
        sessionStorage.removeItem('trialData');
        sessionStorage.removeItem('transactionData');
        setTrialInfo(null);
        setSeatsAvailable(false);
      }
    }
  }, []);

  // This useEffect is removed - all logic moved to mount useEffect above

  // REMOVED: Visibility change handlers - they were causing auto-verification issues
  // Dialog will show on mount and stay until user verifies code manually

  // Ensure dialog stays open when code is not verified and gameState stays on landing
  // REMOVED: This was causing auto-verification from sessionStorage
  // Now we only rely on the mount effect and manual verification

  // Additional safeguard: Block gameState changes if code is not verified
  useEffect(() => {
    if (mounted && !codeVerified && gameState !== 'landing') {
      console.log('🚫 Blocking gameState change - code not verified');
      setGameState('landing');
      setShowCodeDialog(true);
    }
  }, [gameState, codeVerified, mounted]);

  const handleCodeVerified = () => {
    // Code verification is handled in CodeVerificationDialog
    // This function is called after successful verification
    // State is already updated in verifyCode function
  };

  const startGame = useCallback(async () => {
    // CRITICAL: Don't allow game to start without code verification
    if (!codeVerified) {
      console.log('🚫 Game start blocked - code not verified');
      setShowCodeDialog(true);
      setGameState('landing'); // Ensure we stay on landing screen
      return;
    }
    
    // Double-check sessionStorage to ensure code is actually verified
    const codeVerifiedStorage = sessionStorage.getItem('codeVerified') === 'true';
    const productId = sessionStorage.getItem('productId');
    const packageId = sessionStorage.getItem('packageId');
    const isActuallyVerified = codeVerifiedStorage && (productId || packageId);
    
    if (!isActuallyVerified) {
      console.log('🚫 Game start blocked - code verification check failed');
      setShowCodeDialog(true);
      setCodeVerified(false);
      setGameState('landing'); // Ensure we stay on landing screen
      return;
    }
    
    // Check seats availability before starting game
    if (!seatsAvailable) {
      // Show error in code verification dialog instead of separate modal
      setShowCodeDialog(true);
      setCodeVerified(false);
      setGameState('landing'); // Ensure we stay on landing screen
      // Clear sessionStorage to force re-verification
      sessionStorage.removeItem('codeVerified');
      sessionStorage.removeItem('codeType');
      return;
    }

    // Increment seat count when user actually starts playing game
    const code = sessionStorage.getItem('code');
    const codeType = sessionStorage.getItem('codeType');
    const transactionDataStr = sessionStorage.getItem('transactionData');
    
    console.log('Starting game with code:', code, 'codeType:', codeType);
    
    if (!code) {
      console.error('No code found in sessionStorage');
      // Show error in code verification dialog instead of separate modal
      setShowCodeDialog(true);
      setCodeVerified(false);
      return;
    }
    
    // Check package type for purchase codes before starting game
    if (codeType === 'purchase' && transactionDataStr) {
      try {
        const transactionData = JSON.parse(transactionDataStr);
        const packageType = transactionData.packageType || 'standard';
        if (packageType === 'physical') {
          // Show error in code verification dialog instead of separate modal
          setShowCodeDialog(true);
          setCodeVerified(false);
          sessionStorage.removeItem('codeVerified');
          sessionStorage.removeItem('codeType');
          return;
        }
      } catch (e) {
        console.warn('Could not parse transaction data:', e);
      }
    }
    
    if (codeType === 'purchase') {
      // Handle purchase code - Transaction table
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) {
          // Show error in code verification dialog instead of separate modal
          setShowCodeDialog(true);
          setCodeVerified(false);
          return;
        }
        
        console.log('Calling purchase start-game-play API with code:', code);
        const playResponse = await axios.post(
          `${API_URL}/payments/start-purchase-game-play`,
          { code },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        console.log('Purchase game play response:', playResponse.data);
        
        // Update transaction info after seat count increment
        if (playResponse.data && playResponse.data.transaction) {
          const transactionResponse = playResponse.data.transaction;
          // Handle gamePlays - can be array or number
          const gamePlaysCount = Array.isArray(transactionResponse.gamePlays) 
            ? transactionResponse.gamePlays.length 
            : (typeof transactionResponse.gamePlays === 'number' ? transactionResponse.gamePlays : 0);
          
          const updatedTrialInfo = {
            ...trialInfo,
            transactionId: transactionResponse._id || transactionResponse.id || null, // Store transaction ID
            maxSeats: transactionResponse.maxSeats || 5,
            usedSeats: transactionResponse.usedSeats || 0,
            remainingSeats: transactionResponse.remainingSeats || 0,
            gamePlays: gamePlaysCount,
            codeApplications: transactionResponse.codeApplications || 0,
            endDate: transactionResponse.endDate ? new Date(transactionResponse.endDate) : null,
            isExpired: transactionResponse.endDate ? new Date() > new Date(transactionResponse.endDate) : false,
            packageName: transactionResponse.packageName || 'Package'
          };
          setTrialInfo(updatedTrialInfo);
          setSeatsAvailable(updatedTrialInfo.remainingSeats > 0);
          
          console.log('Updated trialInfo for purchase:', updatedTrialInfo);
        }
      } catch (error) {
        console.error('Error starting purchase game play:', error);
        console.error('Error details:', error.response?.data || error.message);
        const errorData = error.response?.data || {};
        if (errorData.noCardsAvailable || errorData.error?.includes('No cards are available')) {
          // Show error modal - cards not available
          setErrorModal({
            open: true,
            title: 'No Cards Available',
            message: 'No cards are available for this product/package. Please contact support to add cards before playing the game.'
          });
          setShowCodeDialog(true);
          setCodeVerified(false);
          sessionStorage.removeItem('codeVerified');
          sessionStorage.removeItem('codeType');
          return;
        }
        if (errorData.seatsFull || errorData.error?.includes('seats are completed')) {
          // Show error in code verification dialog instead of separate modal
          setShowCodeDialog(true);
          setCodeVerified(false);
          setSeatsAvailable(false);
          sessionStorage.removeItem('codeVerified');
          sessionStorage.removeItem('codeType');
          return;
        }
        if (errorData.alreadyPlayed || errorData.seatsFinished || errorData.error?.includes('seats finish')) {
          // Show error in code verification dialog instead of separate modal
          setShowCodeDialog(true);
          setCodeVerified(false);
          // Clear sessionStorage to force re-verification
          sessionStorage.removeItem('codeVerified');
          sessionStorage.removeItem('codeType');
          // Don't show error modal - error will be shown in code verification dialog
          return;
        }
        if (errorData.error) {
          // Show error in code verification dialog instead of separate modal
          setShowCodeDialog(true);
          setCodeVerified(false);
          sessionStorage.removeItem('codeVerified');
          sessionStorage.removeItem('codeType');
          // Don't show error modal - error will be shown in code verification dialog
          return;
        }
        // Continue anyway if there's an error (don't block game start)
        console.warn('Continuing despite error...');
      }
    } else if (codeType === 'trial' || !codeType) {
      // Handle trial code - FreeTrial table
      // Default to trial if codeType is not set (for backward compatibility)
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) {
          // Show error in code verification dialog instead of separate modal
          setShowCodeDialog(true);
          setCodeVerified(false);
          return;
        }
        
        console.log('Calling free-trial start-game-play API with code:', code);
        const playResponse = await axios.post(
          `${API_URL}/free-trial/start-game-play`,
          { code },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        console.log('Trial game play response:', playResponse.data);
        
        // Update trial info after seat count increment
        if (playResponse.data && playResponse.data.trial) {
          const trialResponse = playResponse.data.trial;
          // Handle gamePlays - can be array or number
          const gamePlaysCount = Array.isArray(trialResponse.gamePlays) 
            ? trialResponse.gamePlays.length 
            : (typeof trialResponse.gamePlays === 'number' ? trialResponse.gamePlays : 0);
          
          const updatedTrialInfo = {
            ...trialInfo,
            maxSeats: trialResponse.maxSeats || 2,
            usedSeats: trialResponse.usedSeats || 0,
            remainingSeats: trialResponse.remainingSeats || 0,
            gamePlays: gamePlaysCount,
            codeApplications: trialResponse.codeApplications || 0,
            endDate: trialResponse.endDate ? new Date(trialResponse.endDate) : null,
            isExpired: trialResponse.endDate ? new Date() > new Date(trialResponse.endDate) : false,
            packageName: trialResponse.packageId?.name || 'Package'
          };
          setTrialInfo(updatedTrialInfo);
          setSeatsAvailable(updatedTrialInfo.remainingSeats > 0);
          
          console.log('Updated trialInfo for trial:', updatedTrialInfo);
        }
      } catch (error) {
        console.error('Error starting trial game play:', error);
        console.error('Error details:', error.response?.data || error.message);
        const errorData = error.response?.data || {};
        if (errorData.noCardsAvailable || errorData.error?.includes('No cards are available')) {
          // Show error modal - cards not available
          setErrorModal({
            open: true,
            title: 'No Cards Available',
            message: 'No cards are available for this product/package. Please contact support to add cards before playing the game.'
          });
          setShowCodeDialog(true);
          setCodeVerified(false);
          sessionStorage.removeItem('codeVerified');
          sessionStorage.removeItem('codeType');
          return;
        }
        if (errorData.seatsFull || errorData.error?.includes('seats are completed')) {
          // Show error in code verification dialog instead of separate modal
          setShowCodeDialog(true);
          setCodeVerified(false);
          setSeatsAvailable(false);
          sessionStorage.removeItem('codeVerified');
          sessionStorage.removeItem('codeType');
          return;
        }
        if (errorData.alreadyPlayed || errorData.seatsFinished || errorData.error?.includes('seats finish')) {
          // Show error in code verification dialog instead of separate modal
          setShowCodeDialog(true);
          setCodeVerified(false);
          // Clear sessionStorage to force re-verification
          sessionStorage.removeItem('codeVerified');
          sessionStorage.removeItem('codeType');
          // Don't show error modal - error will be shown in code verification dialog
          return;
        }
        if (errorData.error) {
          // Show error in code verification dialog instead of separate modal
          setShowCodeDialog(true);
          setCodeVerified(false);
          sessionStorage.removeItem('codeVerified');
          sessionStorage.removeItem('codeType');
          // Don't show error modal - error will be shown in code verification dialog
          return;
        }
        // Continue anyway if there's an error (don't block game start)
        console.warn('Continuing despite error...');
      }
    } else {
        console.error('Unknown codeType:', codeType);
        // Show error in code verification dialog instead of separate modal
        setShowCodeDialog(true);
        setCodeVerified(false);
        sessionStorage.removeItem('codeVerified');
        sessionStorage.removeItem('codeType');
        return;
    }
    
    // Only proceed to level selection if we got here successfully
    setGameState('levelSelect');
  }, [codeVerified, seatsAvailable, trialInfo, user]);

  const selectLevel = useCallback(async (level, isFromNextLevel = false) => {
    setSelectedLevel(level);
    setGameState('loading'); // Show loading state
    
    try {
      // Get productId and packageId from sessionStorage if available
      // Priority: productId > packageId
      const productId = sessionStorage.getItem('productId');
      const packageId = sessionStorage.getItem('packageId');
      
      const params = { level };
      if (productId) {
        params.productId = productId;
      } else if (packageId) {
        params.packageId = packageId;
      }
      
      const response = await axios.get(`${API_URL}/cards/public/game`, {
        params
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.questions && response.data.questions.length > 0) {
        const questions = response.data.questions;
        
        // Transform questions to game format
        const formattedScenarios = questions.map((q, idx) => {
          // Ensure answers array exists and has items
          if (!q.answers || q.answers.length === 0) {
            console.warn(`Question ${idx} has no answers`);
            return null;
          }
          
          // Find the answer with highest scoring as correct
          const maxScoring = Math.max(...q.answers.map(a => (a.scoring || 0)));
          const correctAnswerIndex = q.answers.findIndex(a => (a.scoring || 0) === maxScoring);
          
          return {
            id: q._id?.toString() || `q-${idx}`,
            cardId: q.cardId?.toString() || null,
            cardTitle: q.cardTitle || '',
            title: q.cardTitle || q.title || 'Untitled Question',
            description: q.description || '',
            category: q.category || 'General',
            answers: q.answers.map((a, aIdx) => ({
              id: a._id?.toString() || `a-${idx}-${aIdx}`,
              text: a.text || '',
              isCorrect: aIdx === correctAnswerIndex,
              scoring: a.scoring || 0
            })),
            feedback: q.feedback || 'Thank you for your answer!',
            correctAnswerIndex: correctAnswerIndex
          };
        }).filter(Boolean); // Remove null entries
        
        if (formattedScenarios.length === 0) {
          if (isFromNextLevel) {
            // If coming from next level and no scenarios, show a message and go back to level select
            setErrorModal({ open: true, message: `Level ${level} is not available in your purchased package. Please select another level.`, title: 'Level Not Available' });
          } else {
            setErrorModal({ open: true, message: 'No valid scenarios available for this level. Please try another level.', title: 'No Scenarios Available' });
          }
          setGameState('levelSelect');
          setSelectedLevel(null);
          return;
        }
        
        console.log(`Loaded ${formattedScenarios.length} scenarios`);
        setScenarios(formattedScenarios);
        setGameState('game');
        setCurrentCardIndex(0);
        setScore(0);
        setAnswerHistory([]);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setIsCardLocked(false);
      } else {
        if (isFromNextLevel) {
          setErrorModal({ open: true, message: `Level ${level} is not available in your purchased package. Please select another level.`, title: 'Level Not Available' });
        } else {
          setErrorModal({ open: true, message: 'No scenarios available for this level. Please try another level.', title: 'No Scenarios Available' });
        }
        setGameState('levelSelect');
        setSelectedLevel(null);
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      if (isFromNextLevel) {
        setErrorModal({ open: true, message: `Level ${level} is not available in your purchased package. Please select another level.`, title: 'Level Not Available' });
      } else {
        setErrorModal({ open: true, message: `Failed to load game scenarios: ${error.response?.data?.error || error.message}. Please try again.`, title: 'Load Error' });
      }
      setGameState('levelSelect');
      setSelectedLevel(null);
    }
  }, [API_URL]);

  // Check which levels are available for the current product/package
  const checkAvailableLevels = useCallback(async () => {
    if (checkingLevels) return; // Prevent multiple checks
    
    setCheckingLevels(true);
    const productId = sessionStorage.getItem('productId');
    const packageId = sessionStorage.getItem('packageId');
    
    if (!productId && !packageId) {
      // If no product/package, disable all levels
      setAvailableLevels([]);
      setCheckingLevels(false);
      return;
    }

    try {
      const params = {};
      if (productId) {
        params.productId = productId;
      } else if (packageId) {
        params.packageId = packageId;
      }
      
      // Use backend endpoint to get available levels
      const response = await axios.get(`${API_URL}/cards/public/available-levels`, {
        params
      });
      
      if (response.data && response.data.availableLevels) {
        setAvailableLevels(response.data.availableLevels);
      } else {
        setAvailableLevels([]);
      }
    } catch (error) {
      console.error('Error checking available levels:', error);
      // On error, disable all levels
      setAvailableLevels([]);
    } finally {
      setCheckingLevels(false);
    }
  }, [API_URL, checkingLevels]);

  // Check available levels when entering level selection screen
  useEffect(() => {
    if (gameState === 'levelSelect' && codeVerified) {
      checkAvailableLevels();
    }
  }, [gameState, codeVerified, checkAvailableLevels]);

  const handleAnswerClick = useCallback((answerIndex) => {
    if (isCardLocked || !scenarios[currentCardIndex]) return;
    
    const currentScenario = scenarios[currentCardIndex];
    const selectedAnswerObj = currentScenario.answers[answerIndex];
    
    if (!selectedAnswerObj) return;
    
    setSelectedAnswer(answerIndex);
    setIsCardLocked(true);
    
    // Calculate score using actual scoring value from card answer (not hardcoded 4)
    const points = selectedAnswerObj.scoring || 0;
    
    // Calculate max possible points for this question (highest scoring answer)
    const maxPoints = currentScenario.answers.length > 0 
      ? Math.max(...currentScenario.answers.map(a => a.scoring || 0))
      : 0;
    
    setScore(prevScore => prevScore + points);
    
    // Record answer with full question details
    setAnswerHistory(prev => [...prev, {
      cardIndex: currentCardIndex,
      questionId: currentScenario.id,
      cardId: currentScenario.cardId,
      cardTitle: currentScenario.cardTitle,
      questionTitle: currentScenario.title,
      questionDescription: currentScenario.description,
      answerIndex: answerIndex,
      selectedAnswerText: selectedAnswerObj.text,
      selectedAnswerScoring: selectedAnswerObj.scoring,
      isCorrect: selectedAnswerObj.isCorrect,
      points: points, // Use actual scoring value
      maxPoints: maxPoints // Use actual max scoring value
    }]);
    
    // Show feedback after short delay
    setTimeout(() => {
      setShowFeedback(true);
    }, 500);
  }, [isCardLocked, scenarios, currentCardIndex]);

  const saveGameProgress = useCallback(async (levelNum, levelScore, levelAnswerHistory, levelScenarios) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        console.warn('User not logged in, skipping progress save');
        return;
      }

      // Get productId from sessionStorage, trialInfo, or trialData/transactionData
      let storedProductId = sessionStorage.getItem('productId');
      
      // If productId not in sessionStorage, try to get from trialInfo
      if (!storedProductId && trialInfo?.productId) {
        storedProductId = typeof trialInfo.productId === 'object' 
          ? (trialInfo.productId._id || trialInfo.productId.id || trialInfo.productId)
          : trialInfo.productId;
        // Save it back to sessionStorage for future use
        if (storedProductId) {
          sessionStorage.setItem('productId', storedProductId.toString());
        }
      }
      
      // If still not found, try to get from trialData/transactionData in sessionStorage
      if (!storedProductId) {
        const codeType = sessionStorage.getItem('codeType');
        if (codeType === 'trial') {
          const trialDataStr = sessionStorage.getItem('trialData');
          if (trialDataStr) {
            try {
              const trialData = JSON.parse(trialDataStr);
              storedProductId = trialData.productId?._id || trialData.productId?.id || trialData.productId || null;
              if (storedProductId) {
                sessionStorage.setItem('productId', storedProductId.toString());
              }
            } catch (e) {
              console.error('Error parsing trialData for productId:', e);
            }
          }
        } else if (codeType === 'purchase') {
          const transactionDataStr = sessionStorage.getItem('transactionData');
          if (transactionDataStr) {
            try {
              const transactionData = JSON.parse(transactionDataStr);
              storedProductId = transactionData.productId?._id || transactionData.productId?.id || transactionData.productId || null;
              if (storedProductId) {
                sessionStorage.setItem('productId', storedProductId.toString());
              }
            } catch (e) {
              console.error('Error parsing transactionData for productId:', e);
            }
          }
        }
      }
      
      const finalProductId = storedProductId || null;
      
      if (!finalProductId) {
        console.error('❌ No productId found - Cannot save progress!', {
          sessionStorage: sessionStorage.getItem('productId'),
          trialInfo: trialInfo?.productId,
          codeType: sessionStorage.getItem('codeType')
        });
        console.warn('⚠️ No productId found, skipping progress save');
        return;
      }
      
      console.log(`📊 Saving progress for level ${levelNum}:`, {
        productId: finalProductId,
        answerHistoryLength: levelAnswerHistory.length,
        scenariosLength: levelScenarios.length
      });

      // Create a map of scenarios by questionId to find correct answers
      const scenarioMap = new Map();
      levelScenarios.forEach(scenario => {
        if (scenario.id) {
          scenarioMap.set(scenario.id, scenario);
        }
      });

      // Group answers by cardId
      const cardsMap = new Map();
      
      levelAnswerHistory.forEach((answer, index) => {
        const cardId = answer.cardId;
        const scenario = scenarioMap.get(answer.questionId);
        let correctAnswerText = '';
        
        // Find correct answer from scenario
        if (scenario && scenario.answers) {
          const correctAnswerObj = scenario.answers.find(a => a.isCorrect === true);
          if (correctAnswerObj) {
            correctAnswerText = correctAnswerObj.text || '';
          }
        }

        if (!cardsMap.has(cardId)) {
          cardsMap.set(cardId, {
            cardId: cardId,
            cardTitle: answer.cardTitle || '',
            questions: []
          });
        }

        const card = cardsMap.get(cardId);
        
        // Get maxPoints from answer history (stored when answer was clicked)
        const maxPoints = answer.maxPoints || 0;
        
        card.questions.push({
          questionNo: card.questions.length + 1,
          questionId: answer.questionId || answer.cardId + '-' + index,
          questionText: answer.questionTitle || answer.questionDescription || '',
          selectedAnswer: answer.selectedAnswerText || '',
          correctAnswer: correctAnswerText,
          isCorrect: answer.isCorrect || false,
          points: answer.points || 0, // Use actual scoring value from answer
          maxPoints: maxPoints, // Store maxPoints for this question
          answeredAt: new Date().toISOString()
        });
      });

      // Calculate card-wise stats and overall stats
      const cards = Array.from(cardsMap.values()).map(card => {
        // Calculate max score for this card (sum of maxPoints from all questions)
        const cardMaxScore = card.questions.reduce((sum, q) => sum + (q.maxPoints || 0), 0);
        
        // Fallback: If maxPoints not available, calculate from scenarios
        let calculatedMaxScore = 0;
        if (cardMaxScore === 0) {
          const cardScenarios = Array.from(scenarioMap.values()).filter(s => {
            const scenarioCardId = s.cardId?.toString() || s.cardId;
            return scenarioCardId === card.cardId?.toString() || scenarioCardId === card.cardId;
          });
          
          cardScenarios.forEach(scenario => {
            if (scenario.answers && scenario.answers.length > 0) {
              const maxScoring = Math.max(...scenario.answers.map(a => a.scoring || 0));
              calculatedMaxScore += maxScoring;
            }
          });
        }
        
        // Use calculated maxScore if cardMaxScore is 0
        const finalCardMaxScore = cardMaxScore > 0 ? cardMaxScore : calculatedMaxScore;
        
        const cardTotalScore = card.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        const cardCorrectAnswers = card.questions.filter(q => q.isCorrect === true).length;
        const cardTotalQuestions = card.questions.length;
        const cardPercentageScore = finalCardMaxScore > 0 ? Math.round((cardTotalScore / finalCardMaxScore) * 100) : 0;

        return {
          ...card,
          cardTotalScore,
          cardMaxScore: finalCardMaxScore,
          cardCorrectAnswers,
          cardTotalQuestions,
          cardPercentageScore
        };
      });

      // Calculate overall totals
      const totalScore = cards.reduce((sum, card) => sum + card.cardTotalScore, 0);
      const correctAnswers = cards.reduce((sum, card) => sum + card.cardCorrectAnswers, 0);
      const totalQuestions = cards.reduce((sum, card) => sum + card.cardTotalQuestions, 0);
      // Calculate maxScore from sum of all card max scores (not hardcoded 4 per question)
      const maxScore = cards.reduce((sum, card) => sum + card.cardMaxScore, 0);
      const percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      // Save one entry per user per level with cards array (only productId and userId)
      try {
        const progressData = {
          productId: finalProductId,
          levelNumber: levelNum,
          cards: cards,
          totalScore: totalScore,
          maxScore: maxScore,
          correctAnswers: correctAnswers,
          totalQuestions: totalQuestions,
          percentageScore: percentageScore
        };

        console.log(`📤 Sending progress data to API:`, {
          url: `${API_URL}/game-progress`,
          levelNumber: levelNum,
          productId: finalProductId,
          cardsCount: cards.length,
          totalQuestions: totalQuestions,
          totalScore: totalScore
        });

        const response = await axios.post(
          `${API_URL}/game-progress`,
          progressData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
        
        // Check if progress was skipped (trial user)
        if (response.data?.skipped) {
          console.log(`⚠️ Progress skipped for level ${levelNum}: ${response.data.message}`);
          return;
        }
        
        console.log(`✅ Progress saved successfully for level ${levelNum}:`, {
          progressId: response.data?.progress?._id,
          cards: cards.length,
          totalQuestions: totalQuestions,
          totalScore: totalScore,
          percentageScore: percentageScore
        });
      } catch (error) {
        // Log detailed error information
        console.error(`❌ Error saving progress for level ${levelNum}:`, {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });
        
        // If error is about trial user, just log and continue
        if (error.response?.data?.skipped || error.response?.status === 200) {
          console.log(`⚠️ Progress skipped for level ${levelNum}: Trial user or no transaction ID`);
          return;
        }
        
        // Don't throw error - just log it so game can continue
        // But show user-friendly message
        console.warn(`⚠️ Failed to save progress for level ${levelNum}, but game will continue`);
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
      // Don't block game flow if progress save fails
    }
  }, [user, trialInfo, API_URL]);

  const nextCard = useCallback(async () => {
    if (currentCardIndex < scenarios.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCardLocked(false);
    } else {
      // Game complete - save progress before showing summary
      // This ensures progress is saved for ANY level that is completed
      if (selectedLevel && answerHistory.length > 0) {
        try {
          console.log(`💾 Saving progress for level ${selectedLevel} with ${answerHistory.length} answers`);
          
          // Verify productId before saving
          const storedProductId = sessionStorage.getItem('productId');
          if (!storedProductId) {
            console.warn('⚠️ productId missing, attempting to restore...');
            // Try to restore from trialInfo
            if (trialInfo?.productId) {
              const productId = typeof trialInfo.productId === 'object' 
                ? (trialInfo.productId._id || trialInfo.productId.id || trialInfo.productId)
                : trialInfo.productId;
              if (productId) {
                sessionStorage.setItem('productId', productId.toString());
                console.log(`✅ Restored productId: ${productId}`);
              }
            }
          }
          
          await saveGameProgress(selectedLevel, score, answerHistory, scenarios);
          console.log(`✅ Progress saved successfully for level ${selectedLevel}`);
        } catch (error) {
          console.error(`❌ Error saving progress for level ${selectedLevel}:`, error);
          console.error('Error details:', error.response?.data || error.message);
          // Don't block showing summary if save fails, but log the error
          // The backup save in useEffect will try again
        }
      } else {
        console.warn(`⚠️ Cannot save progress: selectedLevel=${selectedLevel}, answerHistory.length=${answerHistory?.length || 0}`);
      }
      setGameState('summary');
    }
  }, [currentCardIndex, scenarios.length, selectedLevel, score, answerHistory, scenarios, saveGameProgress]);

  const playAgain = useCallback(() => {
    setGameState('levelSelect');
    setSelectedLevel(null);
    setScenarios([]);
    setCurrentCardIndex(0);
    setScore(0);
    setAnswerHistory([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCardLocked(false);
  }, []);

  const nextLevel = useCallback(async () => {
    // Save current level completion
    if (selectedLevel) {
      // Save progress to backend
      await saveGameProgress(selectedLevel, score, answerHistory, scenarios);
      
      setCompletedLevels(prev => {
        const existing = prev.find(l => l.level === selectedLevel);
        if (!existing) {
          // Calculate maxScore from scenarios (sum of highest scoring answer for each card)
          const levelMaxScore = scenarios.length > 0
            ? scenarios.reduce((total, scenario) => {
                if (scenario.answers && scenario.answers.length > 0) {
                  const maxScoring = Math.max(...scenario.answers.map(a => a.scoring || 0));
                  return total + maxScoring;
                }
                return total;
              }, 0)
            : (scenarios.length * 4); // Fallback
          
          return [...prev, {
            level: selectedLevel,
            score: score,
            maxScore: levelMaxScore,
            correctAnswers: answerHistory.filter(ans => ans.isCorrect).length,
            totalQuestions: scenarios.length
          }];
        }
        return prev;
      });
    }

    if (selectedLevel && selectedLevel < 3) {
      // Move to next level - pass isFromNextLevel flag
      selectLevel(selectedLevel + 1, true);
    } else {
      // If on level 3 or no level selected, go back to level selection
      setGameState('levelSelect');
      setSelectedLevel(null);
    }
  }, [selectedLevel, selectLevel, score, scenarios.length, answerHistory, saveGameProgress]);

  const currentScenario = scenarios[currentCardIndex];
  const riskLevel = gameState === 'summary' ? getRiskLevel(score) : null;
  const summaryMessage = gameState === 'summary' ? getSummaryMessage(score) : '';
  
  // Calculate performance metrics
  const totalQuestions = scenarios.length;
  const correctAnswers = answerHistory.filter(ans => ans.isCorrect).length;
  
  // Calculate maxScore from actual max scoring values in scenarios (not hardcoded 4 per question)
  // Sum of highest scoring answer for each scenario/card
  const calculateMaxScore = () => {
    if (scenarios.length === 0) return 0;
    
    return scenarios.reduce((total, scenario) => {
      if (scenario.answers && scenario.answers.length > 0) {
        // Find highest scoring answer in this scenario
        const maxScoring = Math.max(...scenario.answers.map(a => a.scoring || 0));
        return total + maxScoring;
      }
      return total;
    }, 0);
  };
  
  const maxScoreFromScenarios = calculateMaxScore();
  
  // Calculate maxScore from actual maxPoints in answerHistory (more accurate if available)
  const maxScoreFromHistory = answerHistory.length > 0 
    ? answerHistory.reduce((sum, ans) => sum + (ans.maxPoints || 0), 0)
    : 0;
  
  // Use maxScoreFromHistory if available (more accurate), otherwise use calculated maxScore
  const maxScore = maxScoreFromHistory > 0 ? maxScoreFromHistory : maxScoreFromScenarios;
  
  const percentageScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100,
    });
  }, []);

  // Refresh AOS when game state changes
  useEffect(() => {
    AOS.refresh();
  }, [gameState]);

  // Trigger confetti when summary screen appears and ensure progress is saved
  useEffect(() => {
    if (gameState === 'summary' && selectedLevel) {
      triggerConfetti();
      // Ensure progress is saved when summary screen appears (backup save)
      // This handles cases where progress might not have been saved in nextCard
      // Only save if we have answer history (user actually played the level)
      if (answerHistory && answerHistory.length > 0) {
        const ensureProgressSaved = async () => {
          try {
            console.log(`🔄 Backup save: Saving progress for level ${selectedLevel} from summary screen`);
            console.log(`📊 Answer history length: ${answerHistory.length}, Score: ${score}`);
            
            // Check productId before saving
            const storedProductId = sessionStorage.getItem('productId');
            const codeType = sessionStorage.getItem('codeType');
            
            if (!storedProductId) {
              console.error('❌ CRITICAL: productId missing in sessionStorage!');
              console.log('Attempting to restore from trialInfo or trialData...');
              
              // Try to restore productId
              if (trialInfo?.productId) {
                const productId = typeof trialInfo.productId === 'object' 
                  ? (trialInfo.productId._id || trialInfo.productId.id || trialInfo.productId)
                  : trialInfo.productId;
                if (productId) {
                  sessionStorage.setItem('productId', productId.toString());
                  console.log(`✅ Restored productId from trialInfo: ${productId}`);
                }
              } else if (codeType === 'trial') {
                const trialDataStr = sessionStorage.getItem('trialData');
                if (trialDataStr) {
                  try {
                    const trialData = JSON.parse(trialDataStr);
                    const productId = trialData.productId?._id || trialData.productId?.id || trialData.productId || null;
                    if (productId) {
                      sessionStorage.setItem('productId', productId.toString());
                      console.log(`✅ Restored productId from trialData: ${productId}`);
                    }
                  } catch (e) {
                    console.error('Error parsing trialData:', e);
                  }
                }
              } else if (codeType === 'purchase') {
                const transactionDataStr = sessionStorage.getItem('transactionData');
                if (transactionDataStr) {
                  try {
                    const transactionData = JSON.parse(transactionDataStr);
                    const productId = transactionData.productId?._id || transactionData.productId?.id || transactionData.productId || null;
                    if (productId) {
                      sessionStorage.setItem('productId', productId.toString());
                      console.log(`✅ Restored productId from transactionData: ${productId}`);
                    }
                  } catch (e) {
                    console.error('Error parsing transactionData:', e);
                  }
                }
              }
            }
            
            await saveGameProgress(selectedLevel, score, answerHistory, scenarios);
            console.log(`✅ Backup progress saved successfully for level ${selectedLevel}`);
          } catch (error) {
            console.error(`❌ Error in backup save for level ${selectedLevel}:`, error);
            console.error('Error details:', error.response?.data || error.message);
            // Show user-friendly error message
            setErrorModal({ open: true, message: 'Warning: Could not save your progress. Please check browser console for details.', title: 'Save Warning' });
          }
        };
        // Add a small delay to ensure state is fully updated
        setTimeout(ensureProgressSaved, 500); // Increased delay to ensure state is ready
      } else {
        console.warn(`⚠️ Cannot backup save: No answer history for level ${selectedLevel}`);
      }
    }
  }, [gameState, selectedLevel, score, answerHistory, scenarios, saveGameProgress, trialInfo]);

  // Trigger confetti when share modal opens
  useEffect(() => {
    if (showShareModal) {
      triggerConfetti();
    }
  }, [showShareModal]);

  // Auto-save progress periodically when user is playing (every 30 seconds)
  // This ensures progress is saved even if user exits early
  useEffect(() => {
    if (selectedLevel && answerHistory && answerHistory.length > 0 && gameState === 'playing') {
      const autoSaveInterval = setInterval(async () => {
        try {
          console.log(`🔄 Auto-saving progress for level ${selectedLevel}`);
          await saveGameProgress(selectedLevel, score, answerHistory, scenarios);
          console.log(`✅ Auto-save completed for level ${selectedLevel}`);
        } catch (error) {
          console.error(`❌ Auto-save failed for level ${selectedLevel}:`, error);
        }
      }, 30000); // Save every 30 seconds

      return () => {
        clearInterval(autoSaveInterval);
      };
    }
  }, [selectedLevel, answerHistory, scenarios, score, gameState, saveGameProgress]);

  // Show code verification dialog if not verified (only after mount to avoid hydration error)
  if (!mounted) {
    // Show loading state during SSR and initial client render
    // Dialog will show automatically once mounted via useEffect
    return (
      <>
        <Head>
          <title>Konfydence - Cybersecurity Training Game</title>
          <meta name="description" content="Test your digital safety skills in 30 quick scenarios" />
        </Head>
        <Header />
        <div className={styles.gameWrapper}>
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <div className={styles.logoContainer}>
                <div className={styles.logoPlaceholder}>KONFYDENCE</div>
              </div>
              <div className={styles.landingContent}>
                <h1 className={styles.landingTitle}>Test Your Digital Safety Skills</h1>
                <p className={styles.landingDescription}>
                  Navigate through 30 quick scenarios and learn how to stay safe online
                </p>
                <div className={styles.buttonGroup}>
                  <button 
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={true}
                    style={{
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    }}
                  >
                    Start Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Show dialog immediately - ALWAYS show on page load */}
        <CodeVerificationDialog 
          open={true}
          onClose={() => {
            // Allow closing when Cancel button is clicked
            console.log('Dialog closed via Cancel button');
            setShowCodeDialog(false);
          }}
          onVerified={handleCodeVerified}
          forceOpen={true}
          setTrialInfo={setTrialInfo}
          setSeatsAvailable={setSeatsAvailable}
          setCodeVerified={setCodeVerified}
          setShowCodeDialog={setShowCodeDialog}
        />
      </>
    );
  }

  // Show code verification dialog - ALWAYS show popup on game page visit if code not verified
  // Show immediately, don't wait for mounted state
  if (!codeVerified) {
    return (
      <>
        <Head>
          <title>Konfydence - Cybersecurity Training Game</title>
          <meta name="description" content="Test your digital safety skills in 30 quick scenarios" />
        </Head>
        <Header />
        <div className={styles.gameWrapper}>
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <div className={styles.logoContainer}>
                <div className={styles.logoPlaceholder}>KONFYDENCE</div>
              </div>
              <div className={styles.landingContent}>
                <h1 className={styles.landingTitle}>Test Your Digital Safety Skills</h1>
                <p className={styles.landingDescription}>
                  Navigate through 30 quick scenarios and learn how to stay safe online
                </p>
                <div className={styles.buttonGroup}>
                  <button 
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={true}
                    style={{
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    }}
                  >
                    Start Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Trial Code Verification Popup - Show when code not verified */}
        <CodeVerificationDialog 
          open={showCodeDialog}
          onClose={() => {
            // Allow closing when Cancel button is clicked
            console.log('Dialog closed via Cancel button');
            setShowCodeDialog(false);
            setGameState('landing'); // Ensure we stay on landing
          }}
          onVerified={handleCodeVerified}
          forceOpen={!codeVerified}
          setTrialInfo={setTrialInfo}
          setSeatsAvailable={setSeatsAvailable}
          setCodeVerified={setCodeVerified}
          setShowCodeDialog={setShowCodeDialog}
        />
        
        {/* Floating button to reopen code dialog when closed */}
        {!showCodeDialog && !codeVerified && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 100,
              right: 30,
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                console.log('Floating button clicked - opening dialog');
                // Ensure dialog opens properly
                setShowCodeDialog(true);
                // Also ensure codeVerified is false to show dialog
                setCodeVerified(false);
              }}
              sx={{
                backgroundColor: '#0B7897',
                color: 'white',
                fontWeight: 700,
                px: 4,
                py: 2,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#063C5E',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
              }}
            >
              Enter Code & Verify to Start
            </Button>
          </Box>
        )}
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Konfydence - Cybersecurity Training Game</title>
        <meta name="description" content="Test your digital safety skills in 30 quick scenarios" />
      </Head>
      <Header />
      
      {/* Show code verification dialog if needed - Always show if not verified */}
      {!codeVerified && (
        <CodeVerificationDialog 
          open={true}
          onClose={() => {
            // Allow closing when Cancel button is clicked
            console.log('Dialog closed via Cancel button');
            setShowCodeDialog(false);
          }}
          onVerified={handleCodeVerified}
          forceOpen={true}
          setTrialInfo={setTrialInfo}
          setSeatsAvailable={setSeatsAvailable}
          setCodeVerified={setCodeVerified}
          setShowCodeDialog={setShowCodeDialog}
        />
      )}
      
      {/* Floating button to reopen code dialog when closed */}
      {!showCodeDialog && !codeVerified && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 30,
            zIndex: 1000,
          }}
        >
          <Button
            variant="contained"
            onClick={() => {
              console.log('Floating button clicked - opening dialog');
              // Ensure dialog opens properly
              setShowCodeDialog(true);
              // Also ensure codeVerified is false to show dialog
              setCodeVerified(false);
            }}
            sx={{
              backgroundColor: '#0B7897',
              color: 'white',
              fontWeight: 700,
              px: 4,
              py: 2,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: '#063C5E',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              },
            }}
          >
            Enter Code & Verify to Start
          </Button>
        </Box>
      )}
      
      <div className={styles.gameWrapper}>
        {/* Landing Screen */}
        {gameState === 'landing' && !howToPlayScreen && (
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <div className={styles.logoContainer} data-aos="zoom-in" data-aos-delay="100">
                <div className={styles.logoPlaceholder}>KONFYDENCE</div>
              </div>
              <div className={styles.landingContent} data-aos="zoom-in" data-aos-delay="200">
                <h1 className={styles.landingTitle}>Test Your Digital Safety Skills</h1>
                <p className={styles.landingDescription}>
                  Navigate through 30 quick scenarios and learn how to stay safe online
                </p>
                {/* Seats Info Display */}
                {codeVerified && trialInfo && (() => {
                  const codeType = sessionStorage.getItem('codeType');
                  const isTrial = codeType === 'trial';
                  return (
                    <Box 
                      sx={{ 
                        mb: 3, 
                        mt: 2,
                        p: 2,
                        backgroundColor: seatsAvailable ? 'rgba(11, 120, 151, 0.1)' : 'rgba(255, 114, 94, 0.1)',
                        borderRadius: 2,
                        border: `2px solid ${seatsAvailable ? '#0B7897' : '#FF725E'}`,
                      }}
                      data-aos="zoom-in" 
                      data-aos-delay="250"
                    >
                      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700, color: '#063C5E' }}>
                        {isTrial ? 'Trial Seats Information' : 'Seats Information'}
                      </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Seats:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{trialInfo.maxSeats}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Used Seats:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{trialInfo.usedSeats}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Remaining Seats:</Typography>
                        <Chip 
                          label={trialInfo.remainingSeats} 
                          color={seatsAvailable ? 'success' : 'error'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Code Applications:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0B7897' }}>
                          {trialInfo.codeApplications || 0} times
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Games Played:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#008B8B' }}>
                          {typeof trialInfo.gamePlays === 'number' ? trialInfo.gamePlays : (Array.isArray(trialInfo.gamePlays) ? trialInfo.gamePlays.length : 0)} times
                        </Typography>
                      </Box>
                      {trialInfo.endDate && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Expiry Date:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {new Date(trialInfo.endDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      )}
                      {!seatsAvailable && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {trialInfo.isExpired 
                            ? (isTrial ? 'Trial code has expired. You cannot play the game.' : 'Purchase code has expired. You cannot play the game.')
                            : 'All seats have been used. You cannot play the game.'}
                        </Alert>
                      )}
                    </Stack>
                  </Box>
                  );
                })()}
                
                <div className={styles.buttonGroup} data-aos="zoom-in" data-aos-delay="300">
                  <button 
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={startGame}
                    disabled={!codeVerified || !seatsAvailable}
                    style={{
                      opacity: (codeVerified && seatsAvailable) ? 1 : 0.5,
                      cursor: (codeVerified && seatsAvailable) ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Start Game
                  </button>
                  <button 
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => setHowToPlayScreen(true)}
                  >
                    How to Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How to Play Screen */}
        {howToPlayScreen && gameState === 'landing' && (
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <h2 className={styles.screenTitle} data-aos="zoom-in" data-aos-delay="100">How to Play</h2>
              <div className={styles.instructionsGrid}>
                <div className={styles.instructionCard} data-aos="zoom-in" data-aos-delay="200">
                  <div className={styles.instructionCardInner}>
                    <div className={styles.instructionCardFront}>
                      <div className={styles.instructionNumber}>1</div>
                      <h3>Choose Your Level</h3>
                      <p>Select from three difficulty levels: Personal Safety, Workplace Compliance, or Social Media & Privacy.</p>
                    </div>
                    <div className={styles.instructionCardBack}>
                      <p>Each level focuses on different aspects of cybersecurity to help you build comprehensive digital safety skills.</p>
                    </div>
                  </div>
                </div>
                <div className={styles.instructionCard}>
                  <div className={styles.instructionCardInner}>
                    <div className={styles.instructionCardFront}>
                      <div className={styles.instructionNumber}>2</div>
                      <h3>Answer Scenarios</h3>
                      <p>You&apos;ll face 30 cybersecurity scenarios. Read each carefully and choose the best response from 4 options.</p>
                    </div>
                    <div className={styles.instructionCardBack}>
                      <p>Each scenario is based on real-world situations you might encounter in your daily digital life.</p>
                    </div>
                  </div>
                </div>
                <div className={styles.instructionCard}>
                  <div className={styles.instructionCardInner}>
                    <div className={styles.instructionCardFront}>
                      <div className={styles.instructionNumber}>3</div>
                      <h3>Learn from Feedback</h3>
                      <p>After each answer, you&apos;ll receive immediate feedback explaining why your choice was correct or incorrect.</p>
                    </div>
                    <div className={styles.instructionCardBack}>
                      <p>Use the feedback to understand cybersecurity best practices and improve your knowledge.</p>
                    </div>
                  </div>
                </div>
                <div className={styles.instructionCard}>
                  <div className={styles.instructionCardInner}>
                    <div className={styles.instructionCardFront}>
                      <div className={styles.instructionNumber}>4</div>
                      <h3>Track Your Score</h3>
                      <p>Earn 4 points for each correct answer. Maximum score depends on number of questions.</p>
                    </div>
                    <div className={styles.instructionCardBack}>
                      <p>Your score reflects your cybersecurity awareness level and helps you identify areas for improvement.</p>
                    </div>
                  </div>
                </div>
                <div className={styles.instructionCard}>
                  <div className={styles.instructionCardInner}>
                    <div className={styles.instructionCardFront}>
                      <div className={styles.instructionNumber}>5</div>
                      <h3>See Your Risk Level</h3>
                      <p>At the end, discover your cybersecurity risk level: Vulnerable, Cautious, or Confident.</p>
                    </div>
                    <div className={styles.instructionCardBack}>
                      <p>Your risk level helps you understand your current cybersecurity posture and guides your learning journey.</p>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  setHowToPlayScreen(false);
                  setGameState('landing');
                }}
              >
                Got It!
              </button>
            </div>
          </div>
        )}

        {/* Level Selection Screen */}
        {gameState === 'levelSelect' && codeVerified && (
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <h2 className={styles.screenTitle} data-aos="zoom-in" data-aos-delay="100">Choose Your Level</h2>
              <div className={styles.levelsGrid}>
                {[1, 2, 3].map((level) => {
                  const isAvailable = availableLevels.includes(level);
                  // Only disable if not available, don't disable during checking
                  const isDisabled = !isAvailable && availableLevels.length > 0;
                  
                  return (
                  <div 
                    key={level}
                    className={styles.levelCard}
                    onClick={() => !isDisabled && selectLevel(level)}
                    data-aos="zoom-in"
                    data-aos-delay={100 + (level * 100)}
                    style={{
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      pointerEvents: isDisabled ? 'none' : 'auto',
                      position: 'relative'
                    }}
                  >
                    <div className={styles.levelCardInner}>
                      <div className={styles.levelCardFront}>
                        <div className={styles.levelIcon}>
                          {level === 1 ? '🛡️' : level === 2 ? '💼' : '🔒'}
                        </div>
                        <h3>Level {level}</h3>
                        <h4>
                          {level === 1 ? 'Personal Safety' : 
                           level === 2 ? 'Workplace Compliance' : 
                           'Social Media & Privacy'}
                        </h4>
                        <p>
                          {level === 1 ? 'Learn the basics of protecting yourself online' :
                           level === 2 ? 'Master security protocols for professional environments' :
                           'Navigate privacy settings and social media risks'}
                        </p>
                      </div>
                      <div className={styles.levelCardBack}>
                        <p>
                          {level === 1 ? 'Start your cybersecurity journey with fundamental personal safety practices' :
                           level === 2 ? 'Understand workplace security requirements and compliance standards' :
                           'Protect your privacy and understand social media security risks'}
                        </p>
                      </div>
                    </div>
                    {isDisabled && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '20px',
                        zIndex: 10
                      }}>
                        <div style={{
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          padding: '20px'
                        }}>
                          Not Available
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setGameState('landing')}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Loading Screen */}
        {gameState === 'loading' && codeVerified && (
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p>Loading scenarios...</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Round Screen */}
        {gameState === 'game' && codeVerified && (
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            {currentScenario ? (
              <div className={styles.gameContainer}>
                <div className={styles.gameHeader}>
                  <div className={styles.progressInfo}>
                    <span>Card {currentCardIndex + 1} / {scenarios.length}</span>
                  </div>
                  <div className={styles.scoreDisplay}>
                    <span>Score: <span>{score}</span> / {maxScore || scenarios.length * 4}</span>
                  </div>
                </div>
                <div className={styles.gameContent}>
                  <div className={`${styles.questionCard} ${showFeedback ? styles.flipped : ''}`}>
                    <div className={styles.questionCardInner}>
                      <div className={styles.questionCardFront}>
                        <div className={styles.threatIllustration}>
                          <div className={styles.bonusBadge}>BONUS</div>
                          <div className={styles.threatIcon}>
                            <div className={styles.folderIcon}>📁</div>
                            <div className={styles.lockIcon}>🔒</div>
                          </div>
                          <div className={styles.coinsContainer}>
                            <span className={styles.coin}>$</span>
                            <span className={styles.coin}>$</span>
                            <span className={styles.coin}>$</span>
                          </div>
                        </div>
                        <div className={styles.threatHeader}>
                          <span className={styles.threatLabel}>THREAT:</span>
                          <h3 className={styles.threatTitle}>{currentScenario.cardTitle || currentScenario.title || 'Untitled Question'}</h3>
                        </div>
                        <p className={styles.threatDescription}>{currentScenario.description}</p>
                        <div className={styles.answersContainer}>
                          {currentScenario.answers && currentScenario.answers.length > 0 ? (
                            currentScenario.answers.map((answer, index) => {
                              const letter = String.fromCharCode(65 + index); // A, B, C, D
                              const isSelected = isCardLocked && selectedAnswer === index;
                              const isCorrectAnswer = answer.isCorrect;
                              return (
                                <button
                                  key={answer.id || index}
                                  className={`${styles.answerOption} ${
                                    isSelected && isCorrectAnswer ? styles.correctHighlight : ''
                                  } ${isSelected && !isCorrectAnswer ? styles.incorrectHighlight : ''}
                                  ${isCardLocked ? styles.disabled : ''}`}
                                  onClick={() => handleAnswerClick(index)}
                                  disabled={isCardLocked}
                                >
                                  <span className={styles.answerLetter}>{letter}</span>
                                  <span className={styles.answerText}>{answer.text}</span>
                                </button>
                              );
                            })
                          ) : (
                            <p>No answers available for this question.</p>
                          )}
                        </div>
                      </div>
                      <div className={styles.questionCardBack}>
                        <div className={styles.feedbackContent}>
                          <div className={styles.feedbackIllustration}>
                            <div className={styles.unlockedPadlock}>🔓</div>
                            <div className={styles.keyIcon}>🗝️</div>
                          </div>
                          <div className={styles.answerSection}>
                            <div className={styles.answerLabel}>YOUR ANSWER:</div>
                            <div className={styles.answerValue}>
                              {selectedAnswer !== null && currentScenario.answers && currentScenario.answers[selectedAnswer] ? (
                                <>
                                  {String.fromCharCode(65 + selectedAnswer)} - Score: {currentScenario.answers[selectedAnswer].scoring || 0}
                                </>
                              ) : (
                                'No answer selected'
                              )}
                            </div>
                            {/* Always show highest scoring answer */}
                            <div className={styles.correctAnswerSection}>
                              <div className={styles.correctAnswerLabel}>HIGHEST SCORING ANSWER:</div>
                              <div className={styles.correctAnswerValue}>
                                {currentScenario.answers
                                  .map((ans, idx) => {
                                    if (ans.isCorrect) {
                                      const letter = String.fromCharCode(65 + idx);
                                      const answerScore = ans.scoring || 0;
                                      return `${letter} - Score: ${answerScore}`;
                                    }
                                    return null;
                                  })
                                  .filter(Boolean)
                                  .join(' OR ')}
                              </div>
                            </div>
                          </div>
                          <div className={styles.rationaleSection}>
                            <div className={styles.rationaleLabel}>RATIONALE:</div>
                            <p className={styles.rationaleText}>
                              {currentScenario.feedback}
                            </p>
                          </div>
                          <div className={styles.branding}>
                            <div className={styles.brandLogo}>🛡️</div>
                            <span className={styles.brandText}>Konfydence – Outsmart Scams</span>
                          </div>
                          <button 
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={nextCard}
                          >
                            {currentCardIndex < scenarios.length - 1 ? 'Next' : 'View Results'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.contentContainer}>
                <p>No scenario available. Please go back and select a level.</p>
                <button 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setGameState('levelSelect')}
                >
                  Back to Level Selection
                </button>
              </div>
            )}
          </div>
        )}

        {/* Summary Screen */}
        {gameState === 'summary' && codeVerified && (
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <div className={styles.summaryContent}>
                <h2 className={styles.completionTitle} data-aos="zoom-in" data-aos-delay="100">Cybersecurity Training Complete!</h2>
                <p className={styles.completionMessage} data-aos="zoom-in" data-aos-delay="200">
                  Congratulations on completing the Konfydence Cybersecurity Training!
                </p>
                
                <div className={styles.resultCard} data-aos="zoom-in" data-aos-delay="300">
                  <div className={styles.scoreIcon} data-aos="zoom-in" data-aos-delay="350">📊</div>
                  <div className={styles.percentageScore} data-aos="zoom-in" data-aos-delay="400">{percentageScore}%</div>
                  <div className={styles.scoreDisplay} data-aos="zoom-in" data-aos-delay="450">
                    <span className={styles.levelScoreLabel}>Level {selectedLevel || 1} Total Score</span>
                    <span className={styles.scoreText}>Score: <strong>{score}</strong> / {maxScore}</span>
                  </div>
                  <p className={styles.scoreMessage} data-aos="zoom-in" data-aos-delay="500">
                    {percentageScore >= 80 ? 'Excellent work! Keep it up!' : 
                     percentageScore >= 60 ? 'Good work! Keep it up!' : 
                     'Good effort! Consider reviewing to improve your understanding.'}
                  </p>
                  <p className={styles.scoreDetails} data-aos="zoom-in" data-aos-delay="550">
                    You answered {correctAnswers} out of {totalQuestions} questions correctly
                  </p>
                  <div className={styles.progressBar} data-aos="zoom-in" data-aos-delay="600">
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${percentageScore}%` }}
                    >
                      <span className={styles.progressLabel}>{correctAnswers}/{totalQuestions} Correct</span>
                    </div>
                  </div>
                  
                  <div className={styles.performanceSummary} data-aos="zoom-in" data-aos-delay="700">
                    <div className={styles.performanceTitle} data-aos="zoom-in" data-aos-delay="750">
                      <span className={styles.performanceIcon}>📈</span>
                      Performance Summary
                    </div>
                    <div className={styles.summaryBoxes}>
                      <div className={styles.summaryBoxCard} data-aos="zoom-in" data-aos-delay="800">
                        <div className={styles.summaryBoxInner}>
                          <div className={`${styles.summaryBox} ${styles.box1} ${styles.summaryBoxFront}`}>
                            <div className={styles.boxNumber}>{selectedLevel || 1}</div>
                            <div className={styles.boxLabel}>Level Completed</div>
                          </div>
                          <div className={`${styles.summaryBox} ${styles.box1} ${styles.summaryBoxBack}`}>
                            <div className={styles.boxLabel}>Level {selectedLevel || 1} Completed</div>
                            <div className={styles.boxNumber}>{selectedLevel || 1}</div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.summaryBoxCard} data-aos="zoom-in" data-aos-delay="900">
                        <div className={styles.summaryBoxInner}>
                          <div className={`${styles.summaryBox} ${styles.box2} ${styles.summaryBoxFront}`}>
                            <div className={styles.boxNumber}>{correctAnswers}</div>
                            <div className={styles.boxLabel}>Questions Correct</div>
                          </div>
                          <div className={`${styles.summaryBox} ${styles.box2} ${styles.summaryBoxBack}`}>
                            <div className={styles.boxLabel}>Questions Correct</div>
                            <div className={styles.boxNumber}>{correctAnswers}</div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.summaryBoxCard} data-aos="zoom-in" data-aos-delay="1000">
                        <div className={styles.summaryBoxInner}>
                          <div className={`${styles.summaryBox} ${styles.box3} ${styles.summaryBoxFront}`}>
                            <div className={styles.boxNumber}>{totalQuestions}</div>
                            <div className={styles.boxLabel}>Total Questions</div>
                          </div>
                          <div className={`${styles.summaryBox} ${styles.box3} ${styles.summaryBoxBack}`}>
                            <div className={styles.boxLabel}>Total Questions</div>
                            <div className={styles.boxNumber}>{totalQuestions}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Show all completed levels if all 3 are completed */}
                    {completedLevels.length === 3 && (
                      <div className={styles.allLevelsSummary} data-aos="zoom-in" data-aos-delay="1100">
                        <div className={styles.allLevelsTitle}>
                          <span className={styles.performanceIcon}>🏆</span>
                          All Levels Completed!
                        </div>
                        <div className={styles.levelsGridSummary}>
                          {completedLevels.sort((a, b) => a.level - b.level).map((levelData, index) => (
                            <div key={levelData.level} className={styles.levelSummaryCard} data-aos="zoom-in" data-aos-delay={1200 + (index * 100)}>
                              <div className={styles.levelSummaryHeader}>
                                <span className={styles.levelSummaryNumber}>Level {levelData.level}</span>
                              </div>
                              <div className={styles.levelSummaryScore}>
                                <span className={styles.levelSummaryScoreValue}>{levelData.score}</span>
                                <span className={styles.levelSummaryScoreMax}>/ {levelData.maxScore}</span>
                              </div>
                              <div className={styles.levelSummaryDetails}>
                                <div>{levelData.correctAnswers} / {levelData.totalQuestions} Correct</div>
                                <div className={styles.levelSummaryPercentage}>
                                  {Math.round((levelData.correctAnswers / levelData.totalQuestions) * 100)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* <div className={styles.riskBadgeContainer} data-aos="zoom-in" data-aos-delay="1100">
                    <div className={styles.riskBadgeCard}>
                      <div className={styles.riskBadgeInner}>
                        <div 
                          className={`${styles.riskBadge} ${styles.riskBadgeFront}`}
                          style={{ backgroundColor: riskLevel?.color || '#ef4444' }}
                        >
                          <span className={styles.riskLabel}>Risk Level</span>
                          <span className={styles.riskValue}>{riskLevel?.level || 'Vulnerable'}</span>
                        </div>
                        <div 
                          className={`${styles.riskBadge} ${styles.riskBadgeBack}`}
                          style={{ backgroundColor: riskLevel?.color || '#ef4444' }}
                        >
                          <span className={styles.riskValue}>{riskLevel?.level || 'Vulnerable'}</span>
                          <span className={styles.riskLabel}>Risk Level</span>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  
                  <div className={styles.actionButtons} data-aos="zoom-in" data-aos-delay="1200">
                    {/* Play Again button commented out */}
                    {/* {(() => {
                      const codeType = sessionStorage.getItem('codeType');
                      const isTrialUser = codeType === 'trial';
                      // For trial users, hide Play Again if they've used a seat (played once)
                      const hasPlayedOnce = trialInfo?.usedSeats >= 1;
                      const shouldHidePlayAgain = isTrialUser && hasPlayedOnce;
                      
                      if (!shouldHidePlayAgain) {
                        return (
                          <button 
                            className={`${styles.btn} ${styles.btnPlayAgain}`}
                            onClick={playAgain}
                          >
                            <span className={styles.btnIcon}>▶</span>
                            Play Again
                          </button>
                        );
                      }
                      return null;
                    })()} */}
                    {(() => {
                      const codeType = sessionStorage.getItem('codeType');
                      const isTrialUser = codeType === 'trial';
                      const seatsUsed = trialInfo?.usedSeats >= 2;
                      const shouldHideNextLevel = isTrialUser && seatsUsed;
                      
                      // Show Next Level button only if:
                      // 1. Not a trial user, OR
                      // 2. Trial user but usedSeats < 2
                      // AND selectedLevel < 3
                      if (selectedLevel && selectedLevel < 3 && !shouldHideNextLevel) {
                        return (
                          <button 
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={nextLevel}
                          >
                            <span className={styles.btnIcon}>➡️</span>
                            Next Level
                          </button>
                        );
                      }
                      return null;
                    })()}
                    <button 
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      onClick={() => setShowShareModal(true)}
                    >
                      <span className={styles.btnIcon}>👁️</span>
                      Share Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Results Modal */}
        {showShareModal && (
          <div className={styles.modal} onClick={() => setShowShareModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <span className={styles.modalClose} onClick={() => setShowShareModal(false)}>&times;</span>
              <h2>Share Your Results</h2>
              <div className={styles.shareContent}>
                <textarea 
                  className={styles.shareText}
                  readOnly
                  value={
                    completedLevels.length === 3
                      ? `I just completed all levels of the Konfydence cybersecurity training game! 🎉

${completedLevels.sort((a, b) => a.level - b.level).map(levelData => 
  `Level ${levelData.level}: Score ${levelData.score}/${levelData.maxScore} (${levelData.correctAnswers}/${levelData.totalQuestions} Correct - ${Math.round((levelData.correctAnswers / levelData.totalQuestions) * 100)}%)`
).join('\n')}

Overall Risk Level: ${riskLevel?.level || 'Vulnerable'}

#Konfydence #CybersecurityTraining`
                      : `I just completed Level ${selectedLevel || 1} of the Konfydence cybersecurity training game! 🎉

Score: ${score}/${maxScore}
Correct Answers: ${correctAnswers}/${totalQuestions} (${percentageScore}%)
Risk Level: ${riskLevel?.level || 'Vulnerable'}

#Konfydence #CybersecurityTraining`
                  }
                />
                {showCopySuccess && (
                  <div className={styles.copySuccessMessage}>
                    <span className={styles.successIcon}>✓</span>
                    Results copied to clipboard!
                  </div>
                )}
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => {
                    const shareText = completedLevels.length === 3
                      ? `I just completed all levels of the Konfydence cybersecurity training game! 🎉

${completedLevels.sort((a, b) => a.level - b.level).map(levelData => 
  `Level ${levelData.level}: Score ${levelData.score}/${levelData.maxScore} (${levelData.correctAnswers}/${levelData.totalQuestions} Correct - ${Math.round((levelData.correctAnswers / levelData.totalQuestions) * 100)}%)`
).join('\n')}

Overall Risk Level: ${riskLevel?.level || 'Vulnerable'}

#Konfydence #CybersecurityTraining`
                      : `I just completed Level ${selectedLevel || 1} of the Konfydence cybersecurity training game! 🎉

Score: ${score}/${maxScore}
Correct Answers: ${correctAnswers}/${totalQuestions} (${percentageScore}%)
Risk Level: ${riskLevel?.level || 'Vulnerable'}

#Konfydence #CybersecurityTraining`;
                    navigator.clipboard.writeText(shareText);
                    setShowCopySuccess(true);
                    setTimeout(() => {
                      setShowCopySuccess(false);
                    }, 3000);
                  }}
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        <Dialog
          open={errorModal.open}
          onClose={() => setErrorModal({ open: false, message: '', title: 'Error' })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px',
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
              {errorModal.title}
            </Typography>
            <IconButton
              onClick={() => setErrorModal({ open: false, message: '', title: 'Error' })}
              size="small"
              sx={{ color: '#666' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorModal.message}
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setErrorModal({ open: false, message: '', title: 'Error' })}
              variant="contained"
              color="error"
              fullWidth
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <Footer />
    </>
  );
}

