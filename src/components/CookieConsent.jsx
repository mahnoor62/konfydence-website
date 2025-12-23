import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Link,
  Slide,
  useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const CookieConsent = () => {
  const theme = useTheme();
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a small delay for better UX
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
    }));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
    }));
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSavePreferences = (preferences) => {
    localStorage.setItem('cookieConsent', 'customized');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setShowBanner(false);
    setShowCustomize(false);
  };

  const handleClose = () => {
    // Don't save preference, just hide for now
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <Slide direction="up" in={showBanner} mountOnEnter unmountOnExit>
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          bottom: { xs: 0, sm: 20 },
          right: { xs: 0, sm: 20 },
          zIndex: 9999,
          borderRadius: { xs: '20px 0 0 0', sm: '20px' },
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,248,250,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: { xs: `3px solid ${theme.palette.primary.main}`, sm: `2px solid ${theme.palette.primary.main}` },
          borderLeft: { xs: `3px solid ${theme.palette.primary.main}`, sm: 'none' },
          border: { xs: 'none', sm: `2px solid ${theme.palette.primary.main}` },
          p: { xs: 2.5, sm: 3 },
          maxWidth: { xs: '100%', sm: '400px' },
          width: { xs: '100%', sm: '400px' },
          boxShadow: '0 -10px 40px rgba(15,31,43,0.15)',
        }}
      >
        {!showCustomize ? (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                We value your privacy
              </Typography>
              <Button
                onClick={handleClose}
                sx={{
                  minWidth: 'auto',
                  width: 32,
                  height: 32,
                  p: 0,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Close fontSize="small" />
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 3,
                lineHeight: 1.7,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
            </Typography>

            <Link
              href="/privacy"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                mb: 3,
                display: 'inline-block',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Cookie Policy
            </Link>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1.5, sm: 1.5 },
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCustomize}
                sx={{
                  flex: { xs: '1', sm: '0 0 auto' },
                  minWidth: { xs: 'auto', sm: '100px' },
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  px: { xs: 2, sm: 2 },
                  py: { xs: 1, sm: 1 },
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: theme.palette.primary.light + '15',
                  },
                }}
              >
                Customize
              </Button>
              <Button
                variant="outlined"
                onClick={handleRejectAll}
                sx={{
                  flex: { xs: '1', sm: '0 0 auto' },
                  minWidth: { xs: 'auto', sm: '100px' },
                  borderColor: theme.palette.text.secondary,
                  color: theme.palette.text.secondary,
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  px: { xs: 2, sm: 2 },
                  py: { xs: 1, sm: 1 },
                  '&:hover': {
                    borderColor: theme.palette.text.primary,
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                Reject All
              </Button>
              <Button
                variant="contained"
                onClick={handleAcceptAll}
                sx={{
                  flex: { xs: '1', sm: '1' },
                  minWidth: { xs: 'auto', sm: '120px' },
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  px: { xs: 2, sm: 2 },
                  py: { xs: 1, sm: 1 },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                  },
                }}
              >
                Accept All
              </Button>
            </Box>
          </>
        ) : (
          <CustomizeView
            onSave={handleSavePreferences}
            onCancel={() => setShowCustomize(false)}
            theme={theme}
          />
        )}
      </Paper>
    </Slide>
  );
};

const CustomizeView = ({ onSave, onCancel, theme }) => {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  const handleToggle = (key) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.primary,
          mb: 2,
        }}
      >
        Customize Cookie Preferences
      </Typography>

      <Box sx={{ mb: 3 }}>
        <CookieOption
          title="Necessary Cookies"
          description="Essential cookies required for the website to function properly. These cannot be disabled."
          enabled={preferences.necessary}
          onToggle={() => handleToggle('necessary')}
          disabled={true}
          theme={theme}
        />
        <CookieOption
          title="Analytics Cookies"
          description="Help us understand how visitors interact with our website by collecting and reporting information anonymously."
          enabled={preferences.analytics}
          onToggle={() => handleToggle('analytics')}
          theme={theme}
        />
        <CookieOption
          title="Marketing Cookies"
          description="Used to deliver personalized advertisements and track campaign performance."
          enabled={preferences.marketing}
          onToggle={() => handleToggle('marketing')}
          theme={theme}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            flex: { xs: '1', sm: '0 0 auto' },
            borderColor: theme.palette.text.secondary,
            color: theme.palette.text.secondary,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            flex: { xs: '1', sm: '1' },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            },
          }}
        >
          Save Preferences
        </Button>
      </Box>
    </>
  );
};

const CookieOption = ({ title, description, enabled, onToggle, disabled = false, theme }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        p: 2,
        mb: 2,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Box sx={{ flex: 1, mr: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.85rem',
          }}
        >
          {description}
        </Typography>
      </Box>
      <Box
        onClick={disabled ? undefined : onToggle}
        sx={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: enabled
            ? theme.palette.primary.main
            : theme.palette.action.disabledBackground,
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            opacity: disabled ? 1 : 0.8,
          },
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: '#fff',
            position: 'absolute',
            top: 2,
            left: enabled ? 22 : 2,
            transition: 'left 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
      </Box>
    </Box>
  );
};

export default CookieConsent;

