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
  
  const colors = ['#000B3D', '#000B3D', '#FFC247', '#FF725E', '#FFFFFF'];
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
  allowCancel = false, // New prop to allow cancel button to close dialog
  codeVerified = false // Add codeVerified prop to check if code is already verified
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

  const verifyCode = async (codeToVerify, isAutoVerify = false) => {
    if (!codeToVerify || codeToVerify.trim() === '') {
      setError('Please enter a code');
      return;
    }

    setVerifying(true);
    setError(null);
    
    // If auto-verifying, don't show dialog
    if (isAutoVerify) {
      setShowCodeDialog(false);
    }

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
          
          // Check if expired first
          if (checkResponse.data.isExpired) {
            setError('Demo has expired. You cannot play the game.');
            setVerifying(false);
            return;
          }
          
          // Check if user has used their seat but seats are still available
          if (checkResponse.data.userSeatUsed && !checkResponse.data.seatsFull) {
            const remainingSeats = checkResponse.data.remainingSeats || 0;
            setError(`You have used all your seats. ${remainingSeats} seat${remainingSeats !== 1 ? 's' : ''} remaining.`);
            setVerifying(false);
            return;
          }
          
          // Check if all seats are used
          if (checkResponse.data.seatsFull) {
            setError('All seats have been used.');
            setVerifying(false);
            return;
          }
          
          // Check if user already played and seats finished
          if (checkResponse.data.alreadyPlayed || checkResponse.data.seatsFinished) {
            setError('All seats have been used.');
            setVerifying(false);
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
              
              // Check expiry (compare dates, not times)
              const endDate = new Date(trial.endDate || trial.expiresAt);
              endDate.setHours(23, 59, 59, 999); // Set to end of day
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
                // Store trial data including isDemo flag and productId for easy tracking
                const productId = trial.productId?._id || trial.productId || null;
                sessionStorage.setItem('trialData', JSON.stringify({
                  ...trial,
                  isDemo: trial.isDemo || false, // Include isDemo flag from API
                  targetAudience: trial.targetAudience || null, // Store targetAudience
                  productId: productId // Store productId for loading product cards
                }));
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
                // Call onVerified callback to notify parent component
                if (onVerified) {
                  onVerified();
                }
              } else {
              // Seats full or expired - show error but don't verify
              if (isExpired) {
                setError('Demo has expired. You cannot play the game.');
              } else if (!hasSeats) {
                // Check if user used their seat or all seats used
                const errorData = useResponse.data?.error || {};
                if (errorData.userSeatUsed && !errorData.seatsFull) {
                  const remainingSeats = errorData.remainingSeats || 0;
                  setError(`You have used all your seats. ${remainingSeats} seat${remainingSeats !== 1 ? 's' : ''} remaining.`);
                } else {
                  setError('All seats have been used.');
                }
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
              if (errorData.isExpired || (errorData.error && errorData.error.includes('expired'))) {
                errorMsg = 'Demo has expired. You cannot play the game.';
              } else if (errorData.userSeatUsed && !errorData.seatsFull) {
                const remainingSeats = errorData.remainingSeats || 0;
                errorMsg = `You have used all your seats. ${remainingSeats} seat${remainingSeats !== 1 ? 's' : ''} remaining.`;
              } else if (errorData.seatsFull || errorData.alreadyPlayed || errorData.seatsFinished || errorData.error?.includes('seats')) {
                errorMsg = errorData.error || 'All seats have been used.';
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
            router.push(`/login?redirect=${encodeURIComponent('/play')}`);
            setVerifying(false);
            return;
          }
        } else {
          // Trial code is invalid (valid: false) - check reason before trying purchase code
          const errorData = checkResponse.data || {};
          
          // Check errors in order: expired, user seat used, all seats used
          if (errorData.isExpired) {
            setError('Demo has expired. You cannot play the game.');
            setVerifying(false);
            return;
          } else if (errorData.userSeatUsed && !errorData.seatsFull) {
            const remainingSeats = errorData.remainingSeats || 0;
            setError(`You have used all your seats. ${remainingSeats} seat${remainingSeats !== 1 ? 's' : ''} remaining.`);
            setVerifying(false);
            return;
          } else if (errorData.seatsFull || errorData.alreadyPlayed || errorData.seatsFinished) {
            setError('All seats have been used.');
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
            
            // Check if expired first
            if (purchaseCheckResponse.data.isExpired) {
              setError('Purchase code has expired. You cannot play the game.');
              setVerifying(false);
              return;
            }
            
            // Check if user has used their seat but seats are still available
            if (purchaseCheckResponse.data.userSeatUsed && !purchaseCheckResponse.data.seatsFull) {
              const remainingSeats = purchaseCheckResponse.data.remainingSeats || 0;
              setError(`You have used all your seats. ${remainingSeats} seat${remainingSeats !== 1 ? 's' : ''} remaining.`);
              setVerifying(false);
              return;
            }
            
            // Check if all seats are used
            if (purchaseCheckResponse.data.seatsFull || !transaction.seatsAvailable || transaction.remainingSeats <= 0) {
              setError('All seats have been used.');
              setVerifying(false);
              return;
            }
            
            // Check if user already played and seats finished
            if (purchaseCheckResponse.data.alreadyPlayed || purchaseCheckResponse.data.seatsFinished) {
              setError('All seats have been used.');
              setVerifying(false);
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
                  // Call onVerified callback to notify parent component
                  if (onVerified) {
                    onVerified();
                  }
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
              router.push(`/login?redirect=${encodeURIComponent('/play')}`);
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
  // Also close if code is verified (to prevent reopening)
  const dialogOpen = userCancelled ? false : (codeVerified ? false : (forceOpen ? true : (open && !userCancelled)));

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
          pointerEvents: dialogOpen ? 'auto' : 'none',
        },
        '& .MuiDialog-container': {
          zIndex: 9999,
          pointerEvents: dialogOpen ? 'auto' : 'none',
        },
        '& .MuiDialog-paper': {
          zIndex: 9999,
          position: 'relative',
          pointerEvents: dialogOpen ? 'auto' : 'none',
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
        {/* Only show "Code forgotten?" line for purchased users, not demo/trial users */}
        {(() => {
          // Check if we're in browser (not SSR)
          if (typeof window === 'undefined') {
            return null;
          }
          
          // Check code type - only show for purchase codes, not trial codes
          const codeType = sessionStorage.getItem('codeType');
          
          // If code type is 'trial', it's a demo/trial code - don't show the line
          if (codeType === 'trial') {
            return null;
          }
          
          // Check if user is a demo user by checking trialData
          // Demo users (B2C, B2B, B2E) have isDemo=true or targetAudience in trialData
          let isDemoUser = false;
          const trialDataStr = sessionStorage.getItem('trialData');
          if (trialDataStr) {
            try {
              const trialData = JSON.parse(trialDataStr);
              // Check isDemo field first (more reliable), fallback to targetAudience
              // Demo users have isDemo=true or targetAudience (B2C, B2B, B2E)
              if (trialData.isDemo === true || trialData.targetAudience) {
                isDemoUser = true;
              }
            } catch (e) {
              // If parsing fails, assume not demo user
            }
          }
          
          // If it's a demo user, don't show the line
          if (isDemoUser) {
            return null;
          }
          
          // Only show for purchased users (codeType === 'purchase')
          // If codeType is not set yet, don't show (wait for verification)
          if (codeType === 'purchase') {
            return (
              <Typography variant="body1" color="text.secondary" sx={{fontWeight:600}}>
                Code forgotton?Check the email you recieved after purchase/demo request.
              </Typography>
            );
          }
          
          // Don't show if codeType is not set (not yet verified)
          return null;
        })()}
          <Typography variant="body1" color="text.secondary">
            Please enter your code to access the game. If you have a free trial, enter your trial code. If you made a purchase, enter the code you received after payment.
          </Typography>

          {codeFromClipboard && (
            <Alert 
              severity="info"
              action={
                <Button size="large" onClick={handleUseClipboardCode} disabled={verifying}>
                  Use
                </Button>
              }
            >
              
              <strong style={{ fontSize: '1.1rem', fontWeight: 700 }}>  Found code in clipboard: {codeFromClipboard}</strong>
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
            backgroundColor: '#000B3D',
            color: 'white',
            fontWeight: 700,
            px: 4,
            '&:hover': {
              backgroundColor: '#000B3D',
              color:'white'
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
  if (finalScore >= 84) return { level: 'Confident', color: '#000B3D' };
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
  const [gameState, setGameState] = useState('landing'); // landing, demoCardSelect, levelSelect, game, summary
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [resumeLevel, setResumeLevel] = useState(null); // Store resume level from query parameter
  const [availableLevels, setAvailableLevels] = useState([]); // Track which levels are available - start empty until checked
  const [checkingLevels, setCheckingLevels] = useState(false); // Track if we're checking levels
  const [demoCompletedLevels, setDemoCompletedLevels] = useState([]); // Track completed levels for demo users
  const [isDemoUser, setIsDemoUser] = useState(false); // Track if current user is demo user
  const [demoTargetAudience, setDemoTargetAudience] = useState(null); // Track demo target audience
  const [demoCards, setDemoCards] = useState([]); // Store demo cards for slider display
  const [currentCardSliderIndex, setCurrentCardSliderIndex] = useState(0); // Current card in slider
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [completedLevels, setCompletedLevels] = useState([]); // Array to track completed levels with their scores
  const [trialInfo, setTrialInfo] = useState(null); // Store trial seats info
  const [seatsAvailable, setSeatsAvailable] = useState(false); // Track if seats are available
  const [errorModal, setErrorModal] = useState({ open: false, message: '', title: 'Error' }); // Error modal state
  const [questionTimer, setQuestionTimer] = useState(180); // 3 minutes = 180 seconds
  const [timerInterval, setTimerInterval] = useState(null); // Store interval ID

  // Auto-submit function when timer expires
  const handleTimerExpire = useCallback(() => {
    if (isCardLocked || !scenarios[currentCardIndex]) return;
    
    const currentScenario = scenarios[currentCardIndex];
    
    // Auto-submit with score 0 (no answer selected)
    setSelectedAnswer(null);
    setIsCardLocked(true);
    
    // Record answer with 0 points (time expired)
    setAnswerHistory(prev => [...prev, {
      cardIndex: currentCardIndex,
      questionId: currentScenario.id,
      cardId: currentScenario.cardId,
      cardTitle: currentScenario.cardTitle,
      questionTitle: currentScenario.title,
      questionDescription: currentScenario.description,
      answerIndex: null, // No answer selected
      selectedAnswerText: 'Time Expired - 0 Score',
      selectedAnswerScoring: 0,
      isCorrect: false,
      points: 0, // Score 0 for time expired
      maxPoints: currentScenario.answers.length > 0 
        ? Math.max(...currentScenario.answers.map(a => a.scoring || 0))
        : 0
    }]);
    
    // Show feedback after short delay
    setTimeout(() => {
      setShowFeedback(true);
    }, 500);
  }, [isCardLocked, scenarios, currentCardIndex]);

  // Start timer when question appears (gameState is 'game' and currentCardIndex changes)
  useEffect(() => {
    // Only start timer when in game state and question is available
    if (gameState === 'game' && scenarios.length > 0 && scenarios[currentCardIndex] && !isCardLocked) {
      // Clear any existing timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      // Reset timer to 180 seconds
      setQuestionTimer(180);
      
      // Start countdown timer
      const interval = setInterval(() => {
        setQuestionTimer(prev => {
          if (prev <= 1) {
            // Timer expired - auto-submit
            clearInterval(interval);
            setTimerInterval(null);
            handleTimerExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      // Cleanup on unmount or when question changes
      return () => {
        clearInterval(interval);
      };
    }
  }, [gameState, currentCardIndex, scenarios.length, isCardLocked, handleTimerExpire]);

  // Mark component as mounted (client-side only)
  // Check for resume query parameter
  useEffect(() => {
    if (router.isReady && router.query.resume) {
      const resumeLevelParam = parseInt(router.query.resume);
      if (resumeLevelParam >= 1 && resumeLevelParam <= 3) {
        console.log(`🔄 Resume level detected: ${resumeLevelParam}`);
        setResumeLevel(resumeLevelParam);
      }
    }
  }, [router.isReady, router.query.resume]);

  // IMPORTANT: This runs FIRST on page load/refresh
  useEffect(() => {
    console.log('🚀 Component mounting - ALWAYS show dialog first, then check verification');
    
    // Mark as mounted
    setMounted(true);

    // Check if user has a referrer and try to use their code, or check for demo code
    const checkReferrerCode = async () => {
      if (!user || !mounted) return;
      
      // First check for demo code in query params
      if (router.isReady && router.query.demoCode) {
        const demoCode = router.query.demoCode;
        console.log('✅ Found demo code in URL, auto-verifying:', demoCode);
        await verifyCode(demoCode, true); // Pass true to indicate it's auto-verification
        // Remove demoCode from URL to clean it up
        router.replace('/play', undefined, { shallow: true });
        return; // Exit early if demo code was used
      }
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Check if user has referrer and get their code
        const referrerResponse = await axios.get(
          `${API_URL}/payments/referrer-code`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (referrerResponse.data.uniqueCode) {
          // Auto-verify with referrer's code
          console.log('✅ Found referrer code, auto-verifying:', referrerResponse.data.uniqueCode);
          const referrerCode = referrerResponse.data.uniqueCode;
          
          // Use the same verification logic as manual code entry
          await verifyCode(referrerCode, true); // Pass true to indicate it's auto-verification
          return; // Exit early if referral code was used
        }
      } catch (error) {
        // User doesn't have referrer or referrer has no code - continue normally
        console.log('No referrer code available, showing code dialog');
      }

      // CRITICAL: Always show dialog on page load/refresh FIRST
      // Don't check sessionStorage immediately - let user verify code again
      setCodeVerified(false);
      setShowCodeDialog(true);
      setGameState('landing');
    };

    // Only check referrer/demo code if router is ready
    if (router.isReady) {
      checkReferrerCode();
    }
    
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
  }, [user]);

  // Clean up any lingering backdrops/overlays that might block clicks on Header
  useEffect(() => {
    const cleanupBackdrops = () => {
      // Remove any backdrop overlays when code is verified or dialog is closed
      if (codeVerified || !showCodeDialog) {
        const backdrops = document.querySelectorAll('.MuiBackdrop-root');
        backdrops.forEach(backdrop => {
          if (backdrop && backdrop.parentElement) {
            const computedStyle = window.getComputedStyle(backdrop);
            // Only remove if it's not currently being used by an open dialog
            const dialogOpen = backdrop.parentElement.querySelector('.MuiDialog-root[aria-hidden="false"]');
            if (!dialogOpen) {
              backdrop.style.display = 'none';
              backdrop.style.pointerEvents = 'none';
              backdrop.style.opacity = '0';
            }
          }
        });
      }
    };
    
    cleanupBackdrops();
    
    // Clean up periodically to catch any lingering overlays
    const interval = setInterval(cleanupBackdrops, 300);
    
    return () => clearInterval(interval);
  }, [codeVerified, showCodeDialog]);

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

  // Static array of demo card images from public/images folder
  const demoCardImages = [
    '/images/1Bank.png',
    '/images/2delivery.png',
    '/images/5lottery.png',
    '/images/7friend.png',
    '/images/15grandchild.png'
  ];

  // Load demo cards for slider display - use static images array
  const loadDemoCardsForSlider = useCallback(async () => {
    try {
      // Get target audience from trialData
      const trialDataStr = typeof window !== 'undefined' ? sessionStorage.getItem('trialData') : null;
      let targetAudience = null;
      if (trialDataStr) {
        try {
          const trialData = JSON.parse(trialDataStr);
          targetAudience = trialData.targetAudience; // B2C, B2B, or B2E
        } catch (e) {
          console.error('Error parsing trialData for targetAudience:', e);
        }
      }
      
      if (!targetAudience) {
        console.error('Target audience not found for demo cards');
        return;
      }
      
      // Limit images based on target audience
      // B2C: 30 cards maximum, B2B/B2E: 90 cards maximum
      let cardLimit = 30; // Default for B2C
      if (targetAudience === 'B2B' || targetAudience === 'B2E') {
        cardLimit = 90; // B2B/B2E get 90 cards maximum
      }
      
      // Use static images array, limit to cardLimit
      const limitedImages = demoCardImages.slice(0, Math.min(cardLimit, demoCardImages.length));
      
      // Convert images to card-like objects for consistency
      const cards = limitedImages.map((imagePath, index) => ({
        _id: `demo-card-${index}`,
        cardId: `demo-card-${index}`,
        cardTitle: `Demo Card ${index + 1}`,
        imagePath: imagePath
      }));
      
      setDemoCards(cards);
      console.log(`✅ Loaded ${cards.length} demo card images for slider (${targetAudience})`);
    } catch (error) {
      console.error('Error loading demo cards for slider:', error);
      setDemoCards([]);
    }
  }, []);

  const startGame = useCallback(async () => {
    // CRITICAL: Don't allow game to start without code verification
    if (!codeVerified) {
      console.log('🚫 Game start blocked - code not verified');
      setShowCodeDialog(true);
      setGameState('landing'); // Ensure we stay on landing screen
      return;
    }
    
    // Check if user is demo user FIRST (before productId check)
    const demoCodeType = sessionStorage.getItem('codeType');
    let isDemo = false;
    let targetAudience = null;
    
    if (demoCodeType === 'trial') {
      const trialDataStr = sessionStorage.getItem('trialData');
      if (trialDataStr) {
        try {
          const trialData = JSON.parse(trialDataStr);
          if (trialData.targetAudience) {
            isDemo = true;
            targetAudience = trialData.targetAudience;
          }
        } catch (e) {
          console.error('Error parsing trialData for demo check:', e);
        }
      }
    }
    
    // Double-check sessionStorage to ensure code is actually verified
    // For demo users, skip productId/packageId check
    const codeVerifiedStorage = sessionStorage.getItem('codeVerified') === 'true';
    const productId = sessionStorage.getItem('productId');
    const packageId = sessionStorage.getItem('packageId');
    const isActuallyVerified = isDemo ? codeVerifiedStorage : (codeVerifiedStorage && (productId || packageId));
    
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
        // Check if this is a demo user - skip "No Cards Available" modal for demo users
        const isDemoUser = (() => {
          const codeType = sessionStorage.getItem('codeType');
          if (codeType === 'trial') {
            const trialDataStr = sessionStorage.getItem('trialData');
            if (trialDataStr) {
              try {
                const trialData = JSON.parse(trialDataStr);
                return !!(trialData.targetAudience);
              } catch (e) {
                return false;
              }
            }
          }
          return false;
        })();
        
        if (errorData.noCardsAvailable || errorData.error?.includes('No cards are available')) {
          // Skip "No Cards Available" modal for demo users - they use demo cards directly
          if (isDemoUser) {
            console.log('🎮 Demo user - skipping "No Cards Available" modal, will load demo cards directly');
            // Continue to demo card loading (handled later in the function)
          } else {
            // Show error modal - cards not available (only for non-demo users)
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
        // Check if this is a demo user - skip "No Cards Available" modal for demo users
        const isDemoUser = (() => {
          const trialDataStr = sessionStorage.getItem('trialData');
          if (trialDataStr) {
            try {
              const trialData = JSON.parse(trialDataStr);
              return !!(trialData.targetAudience);
            } catch (e) {
              return false;
            }
          }
          return false;
        })();
        
        if (errorData.noCardsAvailable || errorData.error?.includes('No cards are available')) {
          // Skip "No Cards Available" modal for demo users - they use demo cards directly
          if (isDemoUser) {
            console.log('🎮 Demo user - skipping "No Cards Available" modal, will load demo cards directly');
            // Continue to demo card loading (handled later in the function)
          } else {
            // Show error modal - cards not available (only for non-demo users)
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
    
    // Use the demo check we already did at the start of the function
    // If not set yet, check again
    if (!isDemo) {
      const demoCodeType = sessionStorage.getItem('codeType');
      if (demoCodeType === 'trial') {
        const trialDataStr = sessionStorage.getItem('trialData');
        if (trialDataStr) {
          try {
            const trialData = JSON.parse(trialDataStr);
            if (trialData.targetAudience) {
              isDemo = true;
              targetAudience = trialData.targetAudience;
            }
          } catch (e) {
            console.error('Error parsing trialData for demo check:', e);
          }
        }
      }
    }
    
    // Set demo user state
    setIsDemoUser(isDemo);
    setDemoTargetAudience(targetAudience);
    
    // For demo users, check completed levels from localStorage AND backend
    if (isDemo) {
      // First, load from localStorage (for quick access)
      const storedCompletedLevels = localStorage.getItem(`demoCompletedLevels_${targetAudience}`);
      if (storedCompletedLevels) {
        try {
          const completed = JSON.parse(storedCompletedLevels);
          setDemoCompletedLevels(completed);
          console.log(`🎮 Demo user (${targetAudience}) - Completed levels from localStorage:`, completed);
        } catch (e) {
          console.error('Error parsing completed levels:', e);
        }
      }
      
      // Also fetch from backend GameProgress to ensure accuracy
      if (user && targetAudience) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const progressResponse = await axios.get(`${API_URL}/game-progress/user`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (progressResponse.data) {
              const progress = progressResponse.data;
              
              // Extract completed levels from the response structure
              // The API returns level1Stats, level2Stats, level3Stats with completedAt
              const completedLevels = [];
              
              if (progress.level1Stats && progress.level1Stats.completedAt) {
                completedLevels.push(1);
              }
              if (progress.level2Stats && progress.level2Stats.completedAt) {
                completedLevels.push(2);
              }
              if (progress.level3Stats && progress.level3Stats.completedAt) {
                completedLevels.push(3);
              }
              
              if (completedLevels.length > 0) {
                setDemoCompletedLevels(completedLevels);
                // Update localStorage with backend data
                localStorage.setItem(`demoCompletedLevels_${targetAudience}`, JSON.stringify(completedLevels));
                console.log(`🎮 Demo user (${targetAudience}) - Completed levels from backend:`, completedLevels);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching completed levels from backend:', error);
          // Continue with localStorage data if backend fetch fails
        }
      }
    }
    
    // For ALL users (demo and regular), show level selection
    // Demo users will see restricted levels based on targetAudience
    // B2C: Only Level 1
    // B2B/B2E: Sequential unlock (Level 1 -> Level 2 -> Level 3)
    setGameState('levelSelect');
  }, [codeVerified, seatsAvailable, trialInfo, user, loadDemoCardsForSlider]);

  // Load demo cards directly (skip level selection)
  const loadDemoCards = useCallback(async (cardLimit) => {
    try {
      setGameState('loading');
      
      // Get target audience from trialData
      const trialDataStr = sessionStorage.getItem('trialData');
      let targetAudience = null;
      if (trialDataStr) {
        try {
          const trialData = JSON.parse(trialDataStr);
          targetAudience = trialData.targetAudience; // B2C, B2B, or B2E
        } catch (e) {
          console.error('Error parsing trialData for targetAudience:', e);
        }
      }
      
      if (!targetAudience) {
        setErrorModal({ 
          open: true, 
          message: 'Target audience not found. Please contact support.', 
          title: 'Error' 
        });
        setGameState('landing');
        return;
      }
      
      // For demo users, fetch product cards if productId available, otherwise fallback to isDemo cards
      // Get productId from trialData if available
      let productId = null;
      if (trialDataStr) {
        try {
          const trialData = JSON.parse(trialDataStr);
          productId = trialData.productId || null;
        } catch (e) {
          console.error('Error parsing trialData for productId:', e);
        }
      }
      
      const params = {
        isDemo: 'true',
        targetAudience: targetAudience,
        level: '1' // For B2C, always Level 1; for B2B/B2E, will use level selection
      };
      
      // Add productId if available (so demo users see product cards)
      if (productId) {
        params.productId = productId;
      }
      
      console.log(`🎮 Fetching demo cards for ${targetAudience}, limit: ${cardLimit} (max ${targetAudience === 'B2C' ? 30 : 90} cards), productId: ${productId || 'none'}`);
      
      // Fetch demo cards (will use product cards if productId provided)
      const response = await axios.get(`${API_URL}/cards/public/game`, {
        params: params
      });
      
      console.log('Demo cards API Response:', response.data);
      
      if (response.data && response.data.questions && response.data.questions.length > 0) {
        let questions = response.data.questions;
        
        // Limit to cardLimit (30 for B2C, 90 for B2B/B2E) - maximum cards for demo users
        questions = questions.slice(0, cardLimit);
        
        // Transform questions to game format
        const formattedScenarios = questions.map((q, idx) => {
          if (!q.answers || q.answers.length === 0) {
            console.warn(`Question ${idx} has no answers`);
            return null;
          }
          
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
        }).filter(Boolean);
        
        if (formattedScenarios.length === 0) {
          // For demo users, try to load cards anyway (don't show error modal)
          // This allows demo users to proceed even if API returns no cards
          console.warn('⚠️ No demo cards found, but continuing for demo user');
          setGameState('landing');
          return;
        }
        
        console.log(`✅ Loaded ${formattedScenarios.length} demo cards (limit: ${cardLimit})`);
        setScenarios(formattedScenarios);
        setGameState('game');
        setCurrentCardIndex(0);
        setScore(0);
        setAnswerHistory([]);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setIsCardLocked(false);
        setSelectedLevel(null); // No level for demo users
      } else {
        // For demo users, don't show error modal - just go back to landing
        console.warn('⚠️ No demo cards found in API response, but continuing for demo user');
        setGameState('landing');
      }
    } catch (error) {
      console.error('Error loading demo cards:', error);
      // For demo users, don't show error modal - just log and go back to landing
      console.warn('⚠️ Error loading demo cards, but continuing for demo user:', error.message);
      setGameState('landing');
    }
  }, [API_URL]);

  const selectLevel = useCallback(async (level, isFromNextLevel = false) => {
    // CRITICAL: Check if level is locked for B2B/B2E demo users before allowing selection
    if (isDemoUser && (demoTargetAudience === 'B2B' || demoTargetAudience === 'B2E')) {
      // Level 1 is always available
      if (level === 1) {
        // Allow Level 1
      } else if (level === 2) {
        // Level 2 requires Level 1 completion
        if (!demoCompletedLevels.includes(1)) {
          console.warn('⚠️ Level 2 is locked - Complete Level 1 first');
          setErrorModal({ 
            open: true, 
            message: 'Level 2 is locked. Please complete Level 1 first.', 
            title: 'Level Locked' 
          });
          return;
        }
      } else if (level === 3) {
        // Level 3 requires Level 1 and 2 completion
        if (!demoCompletedLevels.includes(1) || !demoCompletedLevels.includes(2)) {
          console.warn('⚠️ Level 3 is locked - Complete Level 1 and 2 first');
          setErrorModal({ 
            open: true, 
            message: 'Level 3 is locked. Please complete Level 1 and Level 2 first.', 
            title: 'Level Locked' 
          });
          return;
        }
      }
    }
    
    setSelectedLevel(level);
    setGameState('loading'); // Show loading state
    
    try {
      // Check if this is a demo user
      const codeType = sessionStorage.getItem('codeType');
      let isDemo = false;
      let targetAudience = null;
      
      if (codeType === 'trial') {
        const trialDataStr = sessionStorage.getItem('trialData');
        if (trialDataStr) {
          try {
            const trialData = JSON.parse(trialDataStr);
            if (trialData.targetAudience) {
              isDemo = true;
              targetAudience = trialData.targetAudience;
            }
          } catch (e) {
            console.error('Error parsing trialData:', e);
          }
        }
      }
      
      // For demo users, fetch demo cards with limits based on target audience
      if (isDemo) {
        // Get productId from trialData if available (for demo users to see product cards)
        const trialDataStr = sessionStorage.getItem('trialData');
        let productId = null;
        if (trialDataStr) {
          try {
            const trialData = JSON.parse(trialDataStr);
            productId = trialData.productId || null;
          } catch (e) {
            console.error('Error parsing trialData for productId:', e);
          }
        }
        
        const params = {
          isDemo: 'true',
          targetAudience: targetAudience,
          level: level.toString() // Pass level to get cards for this level
        };
        
        // Add productId if available (so demo users see product cards)
        if (productId) {
          params.productId = productId;
        }
        
        // Card limits: B2C = 30 max, B2B/B2E = 90 max total
        const maxCardsPerLevel = targetAudience === 'B2C' ? 30 : 30; // 30 per level, but B2B/B2E can have multiple levels up to 90 total
        const totalMaxCards = targetAudience === 'B2C' ? 30 : 90;
        
        console.log(`🎮 Demo user (${targetAudience}) - Loading Level ${level} cards (max ${totalMaxCards} total)...`);
        
        const response = await axios.get(`${API_URL}/cards/public/game`, {
          params
        });
        
        console.log('Demo cards API Response:', response.data);
        
        if (response.data && response.data.questions && response.data.questions.length > 0) {
          let questions = response.data.questions;
          
          // Limit cards per level: B2C gets 30 max, B2B/B2E gets 30 per level (up to 90 total across all levels)
          questions = questions.slice(0, maxCardsPerLevel);
          
          // Transform questions to game format
          const formattedScenarios = questions.map((q, idx) => {
            if (!q.answers || q.answers.length === 0) {
              console.warn(`Question ${idx} has no answers`);
              return null;
            }
            
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
          }).filter(Boolean);
          
          if (formattedScenarios.length === 0) {
            // For demo users, don't show error modal - just go back to level select
            console.warn('⚠️ No demo cards found for this level, but continuing for demo user');
            setGameState('levelSelect');
            setSelectedLevel(null);
            return;
          }
          
          console.log(`✅ Loaded ${formattedScenarios.length} demo cards for Level ${level}`);
          setScenarios(formattedScenarios);
          setGameState('game');
          setCurrentCardIndex(0);
          setScore(0);
          setAnswerHistory([]);
          setSelectedAnswer(null);
          setShowFeedback(false);
          setIsCardLocked(false);
          return;
        } else {
          // For demo users, check if productId was provided
          // If productId was provided but no cards found, show error
          const trialDataStr = sessionStorage.getItem('trialData');
          let hasProductId = false;
          if (trialDataStr) {
            try {
              const trialData = JSON.parse(trialDataStr);
              if (trialData.productId) {
                hasProductId = true;
              }
            } catch (e) {
              console.error('Error parsing trialData:', e);
            }
          }
          
          if (hasProductId) {
            // Product has no cards for this level - show error
            setErrorModal({ 
              open: true, 
              message: `No cards are available for this product/package at Level ${level}. Please contact support to add cards before playing the game.`, 
              title: 'No Cards Available' 
            });
          } else {
            // No productId - fallback to demo cards (shouldn't happen but handle gracefully)
            console.warn('⚠️ No demo cards found in API response for this level, but continuing for demo user');
          }
          setGameState('levelSelect');
          setSelectedLevel(null);
          return;
        }
      }
      
      // Regular users - use product/package logic
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

  // Auto-start resume level when code is verified and resume level is set
  useEffect(() => {
    if (codeVerified && resumeLevel && gameState === 'levelSelect') {
      console.log(`🎮 Auto-starting resume level: ${resumeLevel}`);
      selectLevel(resumeLevel);
    }
  }, [codeVerified, resumeLevel, gameState, selectLevel]);

  const handleAnswerClick = useCallback((answerIndex) => {
    if (isCardLocked || !scenarios[currentCardIndex]) return;
    
    // Clear timer when answer is clicked
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
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
  }, [isCardLocked, scenarios, currentCardIndex, timerInterval]);

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
      
      // Calculate risk level based on percentage score
      let riskLevel = 'Vulnerable';
      if (percentageScore >= 84) {
        riskLevel = 'Confident';
      } else if (percentageScore >= 44) {
        riskLevel = 'Cautious';
      }

      // Check if this is a demo play (for tracking purposes only)
      // CRITICAL: Demo users MUST save progress so backend can verify all levels are completed
      const codeType = sessionStorage.getItem('codeType');
      let isDemo = false;
      if (codeType === 'trial') {
        // Check if trialData has targetAudience (demo indicator)
        const trialDataStr = sessionStorage.getItem('trialData');
        if (trialDataStr) {
          try {
            const trialData = JSON.parse(trialDataStr);
            // If targetAudience exists, it's a demo (B2C, B2B, B2E)
            isDemo = !!(trialData.targetAudience);
          } catch (e) {
            console.error('Error parsing trialData for isDemo:', e);
          }
        }
      }
      
      // NOTE: We no longer skip progress saving for demo users
      // Demo users need to save progress so backend can verify all levels are completed

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
          percentageScore: percentageScore,
          riskLevel: riskLevel,
          isDemo: isDemo
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
    // Clear timer when moving to next card
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    if (currentCardIndex < scenarios.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCardLocked(false);
      setQuestionTimer(180); // Reset timer for next question
    } else {
      // Game complete
      // Check if this is a demo user
      const codeType = sessionStorage.getItem('codeType');
      let isDemoUser = false;
      if (codeType === 'trial') {
        const trialDataStr = sessionStorage.getItem('trialData');
        if (trialDataStr) {
          try {
            const trialData = JSON.parse(trialDataStr);
            isDemoUser = !!(trialData.targetAudience);
          } catch (e) {
            console.error('Error parsing trialData:', e);
          }
        }
      }
      
      // Save progress for all users (including demo users)
      // Demo users MUST save progress so backend can verify all levels are completed
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
          
          // For demo users, check if all required levels are completed AFTER saving progress
          // Backend will verify using GameProgress records
          if (isDemoUser) {
            // Get target audience
            let targetAudience = 'B2C';
            const trialDataStr = sessionStorage.getItem('trialData');
            if (trialDataStr) {
              try {
                const trialData = JSON.parse(trialDataStr);
                targetAudience = trialData.targetAudience || 'B2C';
              } catch (e) {
                console.error('Error parsing trialData:', e);
              }
            }
            
            // Check if this was the last required level
            // B2C: Level 1 is the last required
            // B2B/B2E: Level 3 is the last required
            let shouldIncrementSeat = false;
            
            if (targetAudience === 'B2C' && selectedLevel === 1) {
              // B2C: Level 1 completed
              shouldIncrementSeat = true;
            } else if ((targetAudience === 'B2B' || targetAudience === 'B2E') && selectedLevel === 3) {
              // B2B/B2E: Level 3 completed - backend will verify all 3 levels are in GameProgress
              shouldIncrementSeat = true;
            }
            
            if (shouldIncrementSeat) {
              try {
                const token = localStorage.getItem('token');
                const code = sessionStorage.getItem('code');
                if (token && code) {
                  // Add a small delay to ensure GameProgress is saved in database
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  console.log(`🎮 Demo user (${targetAudience}) completed level ${selectedLevel} - calling increment API...`);
                  // Call API to increment seat - backend will verify all required levels are completed
                  // Backend will prevent duplicate increments if user has already completed
                  try {
                    await axios.post(
                      `${API_URL}/free-trial/increment-seat-on-completion`,
                      { code },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    console.log('✅ Seat incremented for demo user');
                  } catch (incrementError) {
                    // If error is "already completed", that's expected for "Play Again" scenario
                    if (incrementError.response?.data?.alreadyPlayed || incrementError.response?.data?.seatsFinished) {
                      console.log(`ℹ️ Demo user (${targetAudience}) has already completed - seat not incremented (this is expected for "Play Again")`);
                    } else {
                      console.error('Error incrementing seat for demo user:', incrementError);
                      console.error('Error details:', incrementError.response?.data || incrementError.message);
                    }
                    // Don't block showing summary - user can still see results
                  }
                }
              } catch (error) {
                console.error('Error in seat increment flow:', error);
                // Don't block showing summary
              }
            }
          }
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
    // Check if this is a demo user
    const codeType = sessionStorage.getItem('codeType');
    let isDemo = false;
    let targetAudience = null;
    
    if (codeType === 'trial') {
      const trialDataStr = sessionStorage.getItem('trialData');
      if (trialDataStr) {
        try {
          const trialData = JSON.parse(trialDataStr);
          if (trialData.targetAudience) {
            isDemo = true;
            targetAudience = trialData.targetAudience;
          }
        } catch (e) {
          console.error('Error parsing trialData:', e);
        }
      }
    }
    
    // For demo users, mark level as completed and unlock next level
    if (isDemo && selectedLevel) {
      // Mark current level as completed
      setDemoCompletedLevels(prev => {
        if (!prev.includes(selectedLevel)) {
          const updated = [...prev, selectedLevel];
          // Save to localStorage
          localStorage.setItem(`demoCompletedLevels_${targetAudience}`, JSON.stringify(updated));
          console.log(`✅ Demo user (${targetAudience}) - Level ${selectedLevel} completed. Completed levels:`, updated);
          return updated;
        }
        return prev;
      });
      
      // For B2C: Only Level 1, so go back to level selection after completion
      if (targetAudience === 'B2C') {
        setGameState('levelSelect');
        setSelectedLevel(null);
        setScenarios([]);
        setCurrentCardIndex(0);
        setScore(0);
        setAnswerHistory([]);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setIsCardLocked(false);
        return;
      }
      
      // For B2B/B2E: Move to next level if available
      if (targetAudience === 'B2B' || targetAudience === 'B2E') {
        // If on level 3, go back to level selection
        if (selectedLevel >= 3) {
          setGameState('levelSelect');
          setSelectedLevel(null);
          setScenarios([]);
          setCurrentCardIndex(0);
          setScore(0);
          setAnswerHistory([]);
          setSelectedAnswer(null);
          setShowFeedback(false);
          setIsCardLocked(false);
          return;
        }
        
        // Move to next level
        const nextLevelNum = selectedLevel + 1;
        selectLevel(nextLevelNum, true);
        return;
      }
    }
    
    // Regular users - save progress and move to next level
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
  
  // Calculate risk level based on percentage score
  const riskLevel = gameState === 'summary' ? getRiskLevel(percentageScore) : null;
  const summaryMessage = gameState === 'summary' ? getSummaryMessage(percentageScore) : '';
  
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

  // Play win/lose sound and trigger confetti when summary screen appears
  useEffect(() => {
    if (gameState === 'summary' && selectedLevel) {
      // Calculate percentage score to determine win/lose
      const currentPercentageScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      
      // Play sound based on win/lose condition (>= 60% is considered a win)
      const playSound = () => {
        try {
          const audio = new Audio();
          
          if (currentPercentageScore >= 60) {
            // Win sound
            audio.src = '/sounds/win.mp3';
            audio.volume = 0.5; // Set volume to 50%
          } else {
            // Lose sound
            audio.src = '/sounds/lose.mp3';
            audio.volume = 0.5; // Set volume to 50%
          }
          
          audio.play().catch(err => {
            // Silently handle audio play errors (user interaction required, etc.)
            console.log('Audio play failed (this is normal on some browsers):', err);
          });
        } catch (error) {
          // Silently handle any audio errors
          console.log('Audio error (this is normal if audio files are missing):', error);
        }
      };
      
      // Play sound with a small delay to ensure summary screen is rendered
      const soundTimeout = setTimeout(() => {
        playSound();
      }, 300);
      
      triggerConfetti();
      
      // Cleanup timeout on unmount or state change
      return () => {
        clearTimeout(soundTimeout);
      };
    }
  }, [gameState, selectedLevel, score, maxScore]);
  
  // Ensure progress is saved when summary screen appears (backup save)
  useEffect(() => {
    if (gameState === 'summary' && selectedLevel) {
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
          <title>Konfydence Play</title>
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
          codeVerified={codeVerified}
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
          codeVerified={codeVerified}
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
              backgroundColor: ' #000B3D !important',
             color: 'white',
              fontWeight: 700,
              px: 4,
              py: 2,
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0, 11, 61, 0.4)',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: '#000B3D !important',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 11, 61, 0.6)',
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
            // Force remove any lingering backdrop/overlays
            setTimeout(() => {
              const backdrops = document.querySelectorAll('.MuiBackdrop-root');
              backdrops.forEach(backdrop => {
                if (backdrop.parentElement) {
                  backdrop.style.display = 'none';
                  backdrop.style.pointerEvents = 'none';
                }
              });
            }, 100);
          }}
          onVerified={handleCodeVerified}
          forceOpen={true}
          setTrialInfo={setTrialInfo}
          setSeatsAvailable={setSeatsAvailable}
          setCodeVerified={setCodeVerified}
          setShowCodeDialog={setShowCodeDialog}
        />
      )}
      
      {/* Ensure no backdrop blocks clicks when dialog is closed */}
      {codeVerified && (
        <style jsx global>{`
          .MuiBackdrop-root {
            display: none !important;
            pointer-events: none !important;
          }
        `}</style>
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
              backgroundColor: '#000B3D',
              color: 'white',
              fontWeight: 700,
              px: 4,
              py: 2,
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0, 11, 61, 0.4)',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: '#000B3D',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 11, 61, 0.6)',
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
                <div className={styles.logoPlaceholder}>KONFYDENCE - 90+ real life scenarios</div>
              </div>
              <div className={styles.landingContent} data-aos="zoom-in" data-aos-delay="200">
                <h1 className={styles.landingTitle}>Strengthen Your Digital Safety Skills</h1>
                <p className={styles.landingDescription}>
                  Experience the pause. Practice &ldquo;H.A.C.K&rdquo; calmly and confidently.
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
                        border: `2px solid ${seatsAvailable ? '#000B3D' : '#000B3D'}`,
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
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#000B3D' }}>
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
                    {resumeLevel ? 'Resume Game' : 'BEGIN TRAINING'}
                  </button>
                  <button 
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => setHowToPlayScreen(true)}
                  >
                    HOW IT WORKS
                  </button>
                </div>
                <p className={styles.safeSpaceText} data-aos="fade-up" data-aos-delay="400">
                  No pressure. Just a safe space to learn.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How to Play Screen */}
        {howToPlayScreen && gameState === 'landing' && (
          <div className={`${styles.screen} ${styles.active} ${styles.howToPlayScreen}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <h2 className={styles.screenTitle} data-aos="zoom-in" data-aos-delay="100">How to Play</h2>
              
              {/* Commented out instruction cards */}
              {/* <div className={styles.instructionsGrid}>
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
              </div> */}
              
              {/* Guide Images Section */}
              <div className={styles.howToPlayImages} data-aos="fade-up" data-aos-delay="200">
                <div className={styles.guideImageContainer}>
                  <img 
                    src="/images/gameplay.png" 
                    alt="Guide Image 1" 
                    className={styles.guideImage}
                  />
                </div>
                <div className={styles.guideImageContainer}>
                  <img 
                    src="/images/setup.png" 
                    alt="Guide Image 2" 
                    className={styles.guideImage}
                  />
                </div>
              </div>
              <div style={{ marginBottom:100 }}>
              <button 
              // style={{ marginBottom:100 }}
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
          </div>
        )}

        {/* Demo Card Selection Screen (B2C Demo Users) */}
        {gameState === 'demoCardSelect' && codeVerified && (
          <div className={`${styles.screen} ${styles.active} ${styles.demoCardSelectScreen}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <h2 className={styles.screenTitle} data-aos="zoom-in" data-aos-delay="100">
                Welcome to Your Demo Experience
              </h2>
              <p className={styles.screenDescription} data-aos="fade-in" data-aos-delay="200">
                {demoTargetAudience === 'B2C' 
                  ? 'Explore 30 cybersecurity scenarios designed to enhance your digital safety awareness. Each card presents a real-world situation to help you make safer decisions online.'
                  : 'Explore 90 cybersecurity scenarios designed to enhance your digital safety awareness. Each card presents a real-world situation to help you make safer decisions online.'
                }
              </p>
              
              {/* Card Slider - Show 4 images on large screen, only images */}
              <div className={styles.cardSliderContainer} data-aos="fade-up" data-aos-delay="300">
                <button 
                  className={styles.sliderArrow}
                  onClick={() => {
                    setCurrentCardSliderIndex(prev => 
                      prev > 0 ? prev - 1 : (demoCards.length > 0 ? Math.max(0, Math.ceil(demoCards.length / 4) - 1) : 0)
                    );
                  }}
                  aria-label="Previous images"
                >
                  ‹
                </button>
                
                <div className={styles.cardSlider}>
                  {demoCards.length > 0 ? (
                    <div 
                      className={styles.cardSliderTrack}
                      style={{
                        transform: `translateX(-${currentCardSliderIndex * 25}%)`
                      }}
                    >
                      {demoCards.map((card, index) => {
                        const cardNumber = index + 1;
                        const imagePath = card.imagePath || `/images/${cardNumber}.png`;
                        return (
                          <div key={card._id || card.cardId || index} className={styles.demoCardSlide}>
                            <div className={styles.demoCardImage}>
                              <img 
                                src={imagePath}
                                alt={`Card ${cardNumber}`}
                                onError={(e) => {
                                  // Fallback: try just number.png
                                  const fallbackSrc = `/images/${cardNumber}.png`;
                                  if (e.target.src !== fallbackSrc) {
                                    e.target.src = fallbackSrc;
                                  } else {
                                    // If still fails, hide image and show placeholder
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) {
                                      e.target.nextSibling.style.display = 'flex';
                                    }
                                  }
                                }}
                              />
                              <div className={styles.demoCardPlaceholder} style={{ display: 'none' }}>
                                <div className={styles.demoCardIcon}>
                                  {cardNumber}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.noCardsMessage}>
                      <p>Loading images...</p>
                    </div>
                  )}
                </div>
                
                <button 
                  className={styles.sliderArrow}
                  onClick={() => {
                    const maxIndex = Math.max(0, Math.ceil(demoCards.length / 4) - 1);
                    setCurrentCardSliderIndex(prev => 
                      prev < maxIndex ? prev + 1 : 0
                    );
                  }}
                  aria-label="Next images"
                >
                  ›
                </button>
              </div>
              
              {/* Card Counter */}
              {demoCards.length > 0 && (
                <div className={styles.cardCounter} data-aos="fade-in" data-aos-delay="400">
                  <span>
                    {Math.min(currentCardSliderIndex * 4 + 1, demoCards.length)} - {Math.min((currentCardSliderIndex + 1) * 4, demoCards.length)} / {demoCards.length}
                  </span>
                </div>
              )}
              
              {/* Action Buttons - All 3 in one row on large screen */}
              <div className={styles.demoActionButtons} data-aos="zoom-in" data-aos-delay="500">
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={async () => {
                    // Start game with demo cards - limit based on target audience
                    const cardLimit = demoTargetAudience === 'B2C' ? 30 : 90;
                    await loadDemoCards(cardLimit);
                  }}
                  disabled={demoCards.length === 0}
                >
                  Play Game
                </button>
                <button 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setHowToPlayScreen(true)}
                >
                  How to Play
                </button>
                <button 
                  className={`${styles.btn} ${styles.btnTertiary}`}
                  onClick={() => setGameState('landing')}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level Selection Screen */}
        {gameState === 'levelSelect' && codeVerified && (
          <div className={`${styles.screen} ${styles.active} ${styles.levelSelectScreen}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <h2 className={styles.screenTitle} data-aos="zoom-in" data-aos-delay="100">Choose Your Level</h2>
              <div className={styles.levelsGrid}>
                {[1, 2, 3].map((level) => {
                  // For demo users, determine availability based on user type and completed levels
                  let isAvailable = false;
                  let isDisabled = false;
                  let disabledMessage = 'Not Available';
                  let shouldHide = false; // For B2C, hide Level 2 and 3
                  
                  if (isDemoUser) {
                    if (demoTargetAudience === 'B2C') {
                      // B2C: Only Level 1 is available, hide Level 2 and 3
                      if (level === 1) {
                        isAvailable = true;
                        isDisabled = false;
                      } else {
                        shouldHide = true; // Hide Level 2 and 3 for B2C
                      }
                    } else if (demoTargetAudience === 'B2B' || demoTargetAudience === 'B2E') {
                      // B2B/B2E: Sequential unlocking - show all levels but disable based on completion
                      if (level === 1) {
                        isAvailable = true; // Level 1 always available
                        isDisabled = false;
                      } else if (level === 2) {
                        isAvailable = demoCompletedLevels.includes(1); // Level 2 available after completing Level 1
                        isDisabled = !demoCompletedLevels.includes(1);
                        disabledMessage = 'Complete Level 1 first';
                      } else if (level === 3) {
                        isAvailable = demoCompletedLevels.includes(1) && demoCompletedLevels.includes(2); // Level 3 available after completing Level 1 and 2
                        isDisabled = !(demoCompletedLevels.includes(1) && demoCompletedLevels.includes(2));
                        disabledMessage = 'Complete Level 1 and 2 first';
                      }
                    }
                  } else {
                    // Regular users - use existing logic
                    isAvailable = availableLevels.includes(level);
                    isDisabled = !isAvailable && availableLevels.length > 0;
                  }
                  
                  // Hide Level 2 and 3 for B2C demo users
                  if (shouldHide) {
                    return null;
                  }
                  
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
                          {disabledMessage}
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
                  <div className={styles.timerDisplay} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: questionTimer <= 30 ? '#ff4444' : questionTimer <= 60 ? '#ff8800' : '#000B3D'
                  }}>
                    <span>⏱️</span>
                    <span>{Math.floor(questionTimer / 60)}:{(questionTimer % 60).toString().padStart(2, '0')}</span>
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
                                answerHistory.length > 0 && answerHistory[answerHistory.length - 1]?.selectedAnswerText === 'Time Expired - 0 Score' ? (
                                  '0 Score'
                                ) : (
                                  'No answer selected'
                                )
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
          <div className={`${styles.screen} ${styles.active} ${styles.summaryScreen}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <div className={styles.summaryContent}>
                <h2 className={styles.completionTitle} data-aos="zoom-in" data-aos-delay="100" style={{ marginTop: '100px' }}>Cybersecurity Training Complete!</h2>
                <p className={styles.completionMessage} data-aos="zoom-in" data-aos-delay="200">
                  {percentageScore >= 60 ? (
                    <>Congratulations! You have completed {totalQuestions} {totalQuestions === 1 ? 'card' : 'cards'}.</>
                  ) : (
                    <>Oh no, you lost! You completed {totalQuestions} {totalQuestions === 1 ? 'card' : 'cards'}.</>
                  )}
                </p>
                
                <div className={styles.resultCard} data-aos="zoom-in" data-aos-delay="300">
                  {/* Win/Defeat Badge */}
                  {/* {percentageScore >= 60 ? (
                    <div className={styles.winDefeatBadgeContainer} data-aos="zoom-in" data-aos-delay="320">
                      <div className={`${styles.winDefeatBadge} ${styles.victoryBadge}`}>
                        <div className={styles.shield}>
                          <div className={styles.shieldRim}></div>
                          <div className={styles.shieldCenter}>
                            <div className={styles.stars}>
                              <span className={styles.star}>⭐</span>
                              <span className={styles.star}>⭐</span>
                              <span className={styles.star}>⭐</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.ribbon}>VICTORY</div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.winDefeatBadgeContainer} data-aos="zoom-in" data-aos-delay="320">
                      <div className={`${styles.winDefeatBadge} ${styles.defeatBadge}`}>
                        <div className={styles.shield}>
                          <div className={styles.shieldRim}></div>
                          <div className={`${styles.shieldCenter} ${styles.brokenShield}`}>
                            <div className={styles.crack}></div>
                            <div className={styles.bloodSplatter}></div>
                          </div>
                        </div>
                        <div className={styles.ribbon}>DEFEAT</div>
                      </div>
                    </div>
                  )}
                   */}
                  <div className={styles.riskBadgeContainer} data-aos="zoom-in" data-aos-delay="350">
                    <div className={styles.riskBadgeCard}>
                      <div className={styles.riskBadgeInner}>
                        <div 
                          className={`${styles.riskBadge} ${styles.riskBadgeFront}`}
                          style={{ backgroundColor: '#FFD700' }}
                        >
                          <span className={styles.riskLabel}>Risk Level</span>
                          <span className={styles.riskValue}>{riskLevel?.level || 'Vulnerable'}</span>
                        </div>
                        <div 
                          className={`${styles.riskBadge} ${styles.riskBadgeBack}`}
                          style={{ backgroundColor: '#FFD700' }}
                        >
                          <span className={styles.riskValue}>{riskLevel?.level || 'Vulnerable'}</span>
                          <span className={styles.riskLabel}>Risk Level</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  
                  <div className={styles.actionButtons} data-aos="zoom-in" data-aos-delay="1200">
                    {/* Next Level button - show only if level < 3 and seats available, and NOT B2C demo user */}
                    {(() => {
                      const codeType = sessionStorage.getItem('codeType');
                      const isTrialUser = codeType === 'trial';
                      const seatsUsed = trialInfo?.usedSeats >= 2;
                      
                      // Check if B2C demo user
                      let isB2CDemo = false;
                      if (isTrialUser) {
                        const trialDataStr = sessionStorage.getItem('trialData');
                        if (trialDataStr) {
                          try {
                            const trialData = JSON.parse(trialDataStr);
                            if (trialData.targetAudience === 'B2C') {
                              isB2CDemo = true;
                            }
                          } catch (e) {
                            console.error('Error parsing trialData:', e);
                          }
                        }
                      }
                      
                      const shouldHideNextLevel = (isTrialUser && seatsUsed) || isB2CDemo;
                      
                      // Show Next Level button only if:
                      // 1. Not a trial user, OR
                      // 2. Trial user but usedSeats < 2 AND not B2C demo
                      // AND selectedLevel < 3
                      if (selectedLevel && selectedLevel < 3 && !shouldHideNextLevel) {
                        return (
                          <button 
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={nextLevel}
                          >
                            {/* <span className={styles.btnIcon}>➡️</span> */}
                            Next Level
                          </button>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Play Again button - Always show */}
                    <button 
                      className={`${styles.btn} ${styles.btnPlayAgain}`}
                      onClick={playAgain}
                    >
                      {/* <span className={styles.btnIcon}>▶</span> */}
                      Play Again
                    </button>
                    
                    {/* Join Membership button - Show for trial users with seats used or all levels completed */}
                    {(() => {
                      const codeType = sessionStorage.getItem('codeType');
                      const isTrialUser = codeType === 'trial';
                      const allLevelsCompleted = completedLevels.length === 3 || (selectedLevel === 3);
                      const seatsUsed = trialInfo?.usedSeats >= 2;
                      
                      // Show "Join Membership" if trial user and seats used or all levels completed
                      if (isTrialUser && (seatsUsed || allLevelsCompleted)) {
                        return (
                          <button 
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => router.push('/packages')}
                            style={{ whiteSpace: 'normal', textAlign: 'center', lineHeight: '1.4' }}
                          >
                            <span>Join the Konfydence Membership for the Full Experience</span>
                          </button>
                        );
                      }
                      
                      return null;
                    })()}
                    
                    {/* Share Results button */}
                    <button 
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      onClick={() => setShowShareModal(true)}
                    >
                      {/* <span className={styles.btnIcon}>👁️</span> */}
                      Share Results
                    </button>
                    
                    {/* Invite a Friend button */}
                    <button 
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      onClick={() => setShowInviteModal(true)}
                    >
                      {/* <span className={styles.btnIcon}>👥</span> */}
                      Invite a Friend & Earn
                    </button>
                  </div>
                  
                  {/* Demo User Promotional Card - Show at bottom after action buttons */}
                  {(() => {
                    const codeType = sessionStorage.getItem('codeType');
                    const isDemoUser = codeType === 'trial';
                    if (!isDemoUser) return null;
                    
                    return (
                      <div className={styles.demoPromoCard} data-aos="zoom-in" data-aos-delay="1250">
                        <div className={styles.demoPromoContent}>
                          <div className={styles.demoPromoLeft}>
                            <div className={styles.germanFlagIcon}>
                              <div className={styles.flagBlack}></div>
                              <div className={styles.flagRed}>
                                <span className={styles.madeInGermany}>Made in Germany</span>
                              </div>
                              <div className={styles.flagYellow}></div>
                            </div>
                            <span className={styles.demoOnlyText}>only for demos</span>
                          </div>
                          <div className={styles.demoPromoCenter} style={{ marginTop: '20px' }}>
                            <h3 className={styles.demoPromoTitle}>
                              Want to master all 90 scenarios? Get the full Physical Kit & unlimited digital access.
                            </h3>
                            <button 
                              className={styles.demoPromoButton}
                              onClick={() => router.push('/packages')}
                            >
                              Unlock Full Power →
                            </button>
                          </div>
                          <div className={styles.demoPromoRight}>
                            <div className={styles.kidsLogo}>
                              <div className={styles.kidsShield}>🛡️</div>
                              <div className={styles.kidsText}>
                                <span className={styles.kidsBrand}>Konfydence</span>
                                <span className={styles.kidsFor}>for Kids</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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

        {/* Invite a Friend Modal */}
        {showInviteModal && (
          <div className={styles.modal} onClick={() => setShowInviteModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <span className={styles.modalClose} onClick={() => setShowInviteModal(false)}>&times;</span>
              <h2>Invite a Friend & Earn Rewards</h2>
              <div className={styles.shareContent}>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                  Share your referral link with friends and earn rewards when they join Konfydence!
                </Typography>
                <TextField
                  fullWidth
                  label="Your Referral Link"
                  value={typeof window !== 'undefined' && user ? `${window.location.origin}/register?ref=${user.id || user._id}` : (typeof window !== 'undefined' ? `${window.location.origin}/register` : '')}
                  readOnly
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            const referralLink = user ? `${window.location.origin}/register?ref=${user.id || user._id}` : `${window.location.origin}/register`;
                            navigator.clipboard.writeText(referralLink);
                            setShowCopySuccess(true);
                            setTimeout(() => setShowCopySuccess(false), 3000);
                          }
                        }}
                        size="small"
                        sx={{ mr: -1 }}
                      >
                        Copy
                      </Button>
                    ),
                  }}
                />
                {showCopySuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Referral link copied to clipboard!
                  </Alert>
                )}
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#F5F8FB', 
                  borderRadius: 2,
                  mb: 2 
                }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    How it works:
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                    • Share your referral link with friends
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                    • When they sign up and make a purchase, you earn rewards
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                    • Earn up to $50 per successful referral
                  </Typography>
                  <Typography variant="body2" component="div">
                    • Rewards are credited to your account automatically
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const referralLink = user ? `${window.location.origin}/register?ref=${user.id || user._id}` : `${window.location.origin}/register`;
                      const shareText = `Join Konfydence - Interactive Cybersecurity Training! 🛡️\n\nUse my referral link: ${referralLink}\n\nLearn to outsmart scams with fun, game-based training!`;
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join Konfydence',
                          text: shareText,
                          url: referralLink,
                        });
                      } else {
                        navigator.clipboard.writeText(shareText);
                        setShowCopySuccess(true);
                        setTimeout(() => setShowCopySuccess(false), 3000);
                      }
                    }
                  }}
                  sx={{
                    backgroundColor: '#0B7897',
                    '&:hover': { backgroundColor: '#063C5E' },
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  Share Referral Link
                </Button>
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
      <Footer  />
    </>
  );
}

