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
  setShowCodeDialog
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [trialCode, setTrialCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [codeFromClipboard, setCodeFromClipboard] = useState('');

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
          
          // Check if user already played
          if (checkResponse.data.alreadyPlayed || checkResponse.data.seatsFinished) {
            setError('You have already played the game with this code. Your seats are finished. You cannot play the game with any other seat.');
            setVerifying(false);
            return;
          }
          
          // Check if seats are available before proceeding
          if (checkResponse.data.seatsFull || trial.remainingSeats <= 0) {
            const maxSeats = trial.maxSeats || 2;
            setError(`You have only ${maxSeats} seat${maxSeats > 1 ? 's' : ''}. Your seats are completed.`);
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
                // Save packageId for fetching cards
                if (trial.packageId) {
                  const packageId = trial.packageId._id || trial.packageId;
                  sessionStorage.setItem('packageId', packageId.toString());
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
              } else if (useErr.response?.status === 401 || useErr.response?.status === 403) {
                errorMsg = 'Authentication failed. Please login again.';
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
            
            // Check package type - only allow digital and digital_physical packages
            const packageType = transaction.packageType || 'standard';
            if (packageType === 'physical') {
              setError('This package type is physical. You have purchased physical cards, so online game play is not allowed. Please use your physical cards to play.');
              setVerifying(false);
              return;
            }
            
            // Check if user already played
            if (purchaseCheckResponse.data.alreadyPlayed || purchaseCheckResponse.data.seatsFinished) {
              setError('You have already played the game with this code. Your seats are finished. You cannot play the game with any other seat.');
              setVerifying(false);
              return;
            }
            
            // Check if seats are available before proceeding
            if (purchaseCheckResponse.data.seatsFull || !transaction.seatsAvailable || transaction.remainingSeats <= 0) {
              const maxSeats = transaction.maxSeats || 5;
              setError(`You have only ${maxSeats} seat${maxSeats > 1 ? 's' : ''}. Your seats are completed.`);
              setVerifying(false);
              return;
            }
            
            // Check if expired
            if (purchaseCheckResponse.data.isExpired) {
              setError('Purchase code has expired. You cannot play the game.');
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
                  // Save packageId for fetching cards
                  if (transactionData.packageId) {
                    const packageId = transactionData.packageId._id || transactionData.packageId;
                    sessionStorage.setItem('packageId', packageId.toString());
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
                return;
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
                } else if (useErr.response?.status === 401 || useErr.response?.status === 403) {
                  errorMsg = 'Authentication failed. Please login again.';
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

  // Force open if forceOpen is true
  const dialogOpen = forceOpen ? true : open;

  return (
    <Dialog 
      open={dialogOpen} 
      onClose={forceOpen ? () => {
        console.log('Dialog close attempted but forceOpen is true');
      } : onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={forceOpen}
      disableBackdropClick={forceOpen}
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
            {!forceOpen && (
              <IconButton
                onClick={onClose}
                sx={{
                  color: '#063C5E',
                  '&:hover': {
                    backgroundColor: 'rgba(6, 60, 94, 0.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
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
        <Button
          onClick={() => router.push('/packages')}
          disabled={verifying}
          sx={{ 
            color: '#0B7897',
            '&:hover': {
              backgroundColor: 'rgba(11, 120, 151, 0.1)',
            },
          }}
        >
          Get Code
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
  const [codeVerified, setCodeVerified] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState('landing'); // landing, levelSelect, game, summary
  const [selectedLevel, setSelectedLevel] = useState(null);
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

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // ALWAYS show trial code verification dialog on page load - REMOVE sessionStorage check
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      // ALWAYS clear sessionStorage and show popup on every page visit
      sessionStorage.removeItem('codeVerified');
      sessionStorage.removeItem('codeType');
      sessionStorage.removeItem('code');
      sessionStorage.removeItem('trialData');
      sessionStorage.removeItem('packageId');
      
      console.log('🔍 Game page loaded - ALWAYS showing verification popup');
      setCodeVerified(false);
      setShowCodeDialog(true);
      setTrialInfo(null);
      setSeatsAvailable(false);
    }
  }, [mounted, router.pathname]); // Re-check when route changes

  // Ensure dialog stays open when code is not verified
  useEffect(() => {
    if (mounted && !codeVerified) {
      console.log('🔓 Code not verified, ensuring dialog is open');
      setShowCodeDialog(true);
    } else if (mounted && codeVerified) {
      console.log('🔒 Code verified, closing dialog');
      setShowCodeDialog(false);
    }
  }, [codeVerified, mounted]);

  const handleCodeVerified = () => {
    // Code verification is handled in CodeVerificationDialog
    // This function is called after successful verification
    // State is already updated in verifyCode function
  };

  const startGame = useCallback(async () => {
    // Don't allow game to start without code verification
    if (!codeVerified) {
      setShowCodeDialog(true);
      return;
    }
    
    // Check seats availability before starting game
    if (!seatsAvailable) {
      if (trialInfo?.isExpired) {
        alert('Trial code has expired. You cannot play the game.');
      } else {
        const maxSeats = trialInfo?.maxSeats || 5;
        alert(`You have only ${maxSeats} seat${maxSeats > 1 ? 's' : ''}. Your seats are completed.`);
      }
      return;
    }

    // Increment seat count when user actually starts playing game
    const code = sessionStorage.getItem('code');
    const codeType = sessionStorage.getItem('codeType');
    const transactionDataStr = sessionStorage.getItem('transactionData');
    
    console.log('Starting game with code:', code, 'codeType:', codeType);
    
    if (!code) {
      console.error('No code found in sessionStorage');
      alert('Code not found. Please verify your code again.');
      return;
    }
    
    // Check package type for purchase codes before starting game
    if (codeType === 'purchase' && transactionDataStr) {
      try {
        const transactionData = JSON.parse(transactionDataStr);
        const packageType = transactionData.packageType || 'standard';
        if (packageType === 'physical') {
          alert('This package type is physical. You have purchased physical cards, so online game play is not allowed. Please use your physical cards to play.');
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
          alert('Please login to play the game.');
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
        if (errorData.seatsFull || errorData.error?.includes('seats are completed')) {
          const errorMsg = errorData.error || `You have only ${errorData.maxSeats || 5} seat${(errorData.maxSeats || 5) > 1 ? 's' : ''}. Your seats are completed.`;
          alert(errorMsg);
          setSeatsAvailable(false);
          return;
        }
        if (errorData.alreadyPlayed || errorData.seatsFinished || errorData.error?.includes('seats finish')) {
          alert(errorData.error || 'You have already played the game with this code. Your seats are finished. You cannot play the game with any other seat.');
          return;
        }
        if (errorData.error) {
          alert(errorData.error);
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
          alert('Please login to play the game.');
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
        if (errorData.seatsFull || errorData.error?.includes('seats are completed')) {
          const errorMsg = errorData.error || `You have only ${errorData.maxSeats || 5} seat${(errorData.maxSeats || 5) > 1 ? 's' : ''}. Your seats are completed.`;
          alert(errorMsg);
          setSeatsAvailable(false);
          return;
        }
        if (errorData.alreadyPlayed || errorData.seatsFinished || errorData.error?.includes('seats finish')) {
          alert(errorData.error || 'You have already played the game with this code. Your seats are finished. You cannot play the game with any other seat.');
          return;
        }
        if (errorData.error) {
          alert(errorData.error);
          return;
        }
        // Continue anyway if there's an error (don't block game start)
        console.warn('Continuing despite error...');
      }
    } else {
        console.error('Unknown codeType:', codeType);
        alert('Invalid code type. Please verify your code again.');
        return;
    }
    
    // Only proceed to level selection if we got here successfully
    setGameState('levelSelect');
  }, [codeVerified, seatsAvailable, trialInfo, user]);

  const selectLevel = useCallback(async (level) => {
    setSelectedLevel(level);
    setGameState('loading'); // Show loading state
    
    try {
      // Get packageId from sessionStorage if available
      const packageId = sessionStorage.getItem('packageId');
      
      const params = { level };
      if (packageId) {
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
            title: q.title || 'Untitled Question',
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
          alert('No valid scenarios available for this level. Please try another level.');
          setGameState('levelSelect');
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
        alert('No scenarios available for this level. Please try another level.');
        setGameState('levelSelect');
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to load game scenarios: ${error.response?.data?.error || error.message}. Please try again.`);
      setGameState('levelSelect');
    }
  }, [API_URL]);

  const handleAnswerClick = useCallback((answerIndex) => {
    if (isCardLocked || !scenarios[currentCardIndex]) return;
    
    const currentScenario = scenarios[currentCardIndex];
    const selectedAnswerObj = currentScenario.answers[answerIndex];
    
    if (!selectedAnswerObj) return;
    
    setSelectedAnswer(answerIndex);
    setIsCardLocked(true);
    
    // Calculate score (4 points for correct, 0 for incorrect)
    const points = selectedAnswerObj.isCorrect ? 4 : 0;
    
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
      points: points,
      maxPoints: 4
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

      // Get IDs from sessionStorage
      const packageId = sessionStorage.getItem('packageId');
      const code = sessionStorage.getItem('code');
      const codeType = sessionStorage.getItem('codeType');
      
      // Get transaction/freeTrial ID from trialInfo or API
      let transactionId = null;
      let freeTrialId = null;
      let productId = null;
      
      // Handle both purchase and trial users
      if (codeType === 'purchase') {
        // Get transactionId from code for purchase users
        if (code) {
          try {
            const transactionResponse = await axios.get(
              `${API_URL}/payments/transaction/${code}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (transactionResponse.data?._id) {
              transactionId = transactionResponse.data._id;
            }
          } catch (error) {
            console.warn('Could not fetch transaction ID:', error);
          }
        }
        
        // If still no transactionId, don't save progress
        if (!transactionId) {
          console.warn('⚠️ No transaction ID found for purchase user, skipping progress save');
          console.warn('Code:', code, 'CodeType:', codeType);
          return;
        } else {
          console.log('✅ Transaction ID found:', transactionId);
        }
      } else if (codeType === 'trial') {
        // Get freeTrialId from code for trial users
        // First try to get from trialInfo (already stored)
        if (trialInfo?._id) {
          freeTrialId = trialInfo._id;
        } else if (code) {
          try {
            const freeTrialResponse = await axios.get(
              `${API_URL}/free-trial/check-code/${code}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (freeTrialResponse.data?.trial?._id) {
              freeTrialId = freeTrialResponse.data.trial._id;
            } else if (freeTrialResponse.data?.trial?.id) {
              freeTrialId = freeTrialResponse.data.trial.id;
            }
          } catch (error) {
            console.warn('Could not fetch free trial ID:', error);
          }
        }
        
        // If still no freeTrialId, don't save progress
        if (!freeTrialId) {
          console.warn('⚠️ No free trial ID found for trial user, skipping progress save');
          console.warn('Code:', code, 'CodeType:', codeType, 'TrialInfo:', trialInfo);
          return;
        } else {
          console.log('✅ Free Trial ID found:', freeTrialId);
        }
      } else {
        console.warn('⚠️ Unknown code type or no code type detected, skipping progress save');
        console.warn('CodeType:', codeType, 'Code:', code);
        return;
      }
      
      console.log(`📊 Saving progress for level ${levelNum}:`, {
        transactionId,
        freeTrialId,
        packageId,
        productId,
        answerHistoryLength: levelAnswerHistory.length,
        scenariosLength: levelScenarios.length
      });

      // Group answers by cardId and calculate summary only (no question details)
      const cardProgressMap = new Map();
      
      levelAnswerHistory.forEach((answer) => {
        const cardId = answer.cardId;
        if (!cardId) return; // Skip if no cardId
        
        if (!cardProgressMap.has(cardId)) {
          cardProgressMap.set(cardId, {
            cardId: cardId,
            totalScore: 0,
            correctAnswers: 0,
            totalQuestions: 0
          });
        }
        
        const cardProgress = cardProgressMap.get(cardId);
        cardProgress.totalScore += answer.points || 0;
        if (answer.isCorrect) {
          cardProgress.correctAnswers += 1;
        }
        cardProgress.totalQuestions += 1;
      });

      // Calculate final scores for each card
      cardProgressMap.forEach((cardProgress, cardId) => {
        const cardMaxScore = cardProgress.totalQuestions * 4;
        cardProgress.maxScore = cardMaxScore;
        cardProgress.percentageScore = cardMaxScore > 0 
          ? Math.round((cardProgress.totalScore / cardMaxScore) * 100) 
          : 0;
      });

      // Save progress for each card (summary only, no question details)
      const savePromises = Array.from(cardProgressMap.entries()).map(async ([cardId, cardProgress]) => {
        try {
          const progressData = {
            cardId: cardId,
            packageId: packageId || null,
            productId: productId || trialInfo?.productId || null,
            transactionId: transactionId || null,
            freeTrialId: freeTrialId || null,
            levelNumber: levelNum,
            totalScore: cardProgress.totalScore,
            maxScore: cardProgress.maxScore,
            correctAnswers: cardProgress.correctAnswers,
            totalQuestions: cardProgress.totalQuestions
          };

          const response = await axios.post(
            `${API_URL}/game-progress`,
            progressData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          // Check if progress was skipped (trial user)
          if (response.data?.skipped) {
            console.log(`Progress skipped for card ${cardId}: ${response.data.message}`);
            return;
          }
          
          console.log(`Progress saved for card ${cardId}, level ${levelNum}`);
        } catch (error) {
          // If error is about trial user, just log and continue
          if (error.response?.data?.skipped || error.response?.status === 200) {
            console.log(`Progress skipped for card ${cardId}: Trial user or no transaction ID`);
            return;
          }
          console.error(`Error saving progress for card ${cardId}:`, error);
          // Don't throw, continue with other cards
        }
      });

      await Promise.all(savePromises);
      console.log('Progress save completed');
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
          console.log(`Saving progress for level ${selectedLevel} with ${answerHistory.length} answers`);
          await saveGameProgress(selectedLevel, score, answerHistory, scenarios);
          console.log(`✅ Progress saved successfully for level ${selectedLevel}`);
        } catch (error) {
          console.error(`❌ Error saving progress for level ${selectedLevel}:`, error);
          console.error('Error details:', error.response?.data || error.message);
          // Don't block showing summary if save fails, but log the error
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
          return [...prev, {
            level: selectedLevel,
            score: score,
            maxScore: scenarios.length * 4,
            correctAnswers: answerHistory.filter(ans => ans.isCorrect).length,
            totalQuestions: scenarios.length
          }];
        }
        return prev;
      });
    }

    if (selectedLevel && selectedLevel < 3) {
      // Move to next level
      selectLevel(selectedLevel + 1);
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
  const percentageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const maxScore = totalQuestions * 4; // 4 points per correct answer
  
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
            await saveGameProgress(selectedLevel, score, answerHistory, scenarios);
            console.log(`✅ Backup progress saved successfully for level ${selectedLevel}`);
          } catch (error) {
            console.error(`❌ Error in backup save for level ${selectedLevel}:`, error);
            console.error('Error details:', error.response?.data || error.message);
          }
        };
        // Add a small delay to ensure state is fully updated
        setTimeout(ensureProgressSaved, 100);
      } else {
        console.warn(`⚠️ Cannot backup save: No answer history for level ${selectedLevel}`);
      }
    }
  }, [gameState, selectedLevel, score, answerHistory, scenarios, saveGameProgress]);

  // Trigger confetti when share modal opens
  useEffect(() => {
    if (showShareModal) {
      triggerConfetti();
    }
  }, [showShareModal]);

  // Show code verification dialog if not verified (only after mount to avoid hydration error)
  if (!mounted) {
    // Show loading state during SSR and initial client render
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
        {/* Show dialog immediately even during mount */}
        <CodeVerificationDialog 
          open={true}
          onClose={() => {}}
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

  // Show code verification dialog - ALWAYS show popup on game page visit
  if (mounted && !codeVerified) {
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
            // Allow dialog to close, but show floating button
            console.log('Dialog closed - showing floating button');
            setShowCodeDialog(false);
          }}
          onVerified={handleCodeVerified}
          forceOpen={false}
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
              onClick={() => setShowCodeDialog(true)}
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
      
      {/* Show code verification dialog if needed */}
      {!codeVerified && (
        <CodeVerificationDialog 
          open={showCodeDialog}
          onClose={() => {
            // Allow dialog to close, but show floating button
            setShowCodeDialog(false);
          }}
          onVerified={handleCodeVerified}
          forceOpen={false}
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
            onClick={() => setShowCodeDialog(true)}
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
        {gameState === 'levelSelect' && (
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            <div className={styles.contentContainer}>
              <h2 className={styles.screenTitle} data-aos="zoom-in" data-aos-delay="100">Choose Your Level</h2>
              <div className={styles.levelsGrid}>
                {[1, 2, 3].map((level) => (
                  <div 
                    key={level}
                    className={styles.levelCard}
                    onClick={() => selectLevel(level)}
                    data-aos="zoom-in"
                    data-aos-delay={100 + (level * 100)}
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
                  </div>
                ))}
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
        {gameState === 'loading' && (
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
        {gameState === 'game' && (
          <div className={`${styles.screen} ${styles.active}`}>
            <div className={styles.parallaxBg}></div>
            {currentScenario ? (
              <div className={styles.gameContainer}>
                <div className={styles.gameHeader}>
                  <div className={styles.progressInfo}>
                    <span>Card {currentCardIndex + 1} / {scenarios.length}</span>
                  </div>
                  <div className={styles.scoreDisplay}>
                    <span>Score: <span>{score}</span> / {scenarios.length * 4}</span>
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
                          <h3 className={styles.threatTitle}>{currentScenario.title}</h3>
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
                                  {String.fromCharCode(65 + selectedAnswer)}
                                  {currentScenario.answers[selectedAnswer].isCorrect ? (
                                    <span className={styles.correctBadge}> ✓ Correct</span>
                                  ) : (
                                    <span className={styles.incorrectBadge}> ✗ Incorrect</span>
                                  )}
                                </>
                              ) : (
                                'No answer selected'
                              )}
                            </div>
                            {selectedAnswer !== null && currentScenario.answers && currentScenario.answers[selectedAnswer] && !currentScenario.answers[selectedAnswer].isCorrect && (
                              <div className={styles.correctAnswerSection}>
                                <div className={styles.correctAnswerLabel}>CORRECT ANSWER:</div>
                                <div className={styles.correctAnswerValue}>
                                  {currentScenario.answers
                                    .map((ans, idx) => {
                                      if (ans.isCorrect) {
                                        return String.fromCharCode(65 + idx);
                                      }
                                      return null;
                                    })
                                    .filter(Boolean)
                                    .join(' OR ')}
                                </div>
                              </div>
                            )}
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
        {gameState === 'summary' && (
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
      </div>
      <Footer />
    </>
  );
}

