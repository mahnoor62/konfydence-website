'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Link as MuiLink,
  Stack,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

// Password strength checker
const checkPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '#e0e0e0', requirements: [] };
  
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  
  const metCount = Object.values(requirements).filter(Boolean).length;
  const strength = (metCount / 5) * 100;
  
  let label = '';
  let color = '#e0e0e0';
  
  if (strength < 40) {
    label = 'Weak';
    color = '#f44336';
  } else if (strength < 80) {
    label = 'Medium';
    color = '#ff9800';
  } else {
    label = 'Strong';
    color = '#4caf50';
  }
  
  return { strength, label, color, requirements };
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    userType: 'b2c', // b2c, b2b, b2e
    organizationName: '',
    organizationType: 'company' // company, bank, school, govt, other
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '#e0e0e0', requirements: {} });
  const [emailError, setEmailError] = useState('');
  const { redirect } = router.query;

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirect || '/dashboard');
    }
  }, [user, authLoading, redirect, router]);

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // Validate name
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    // Validate email
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      setError('Please enter a valid email address');
      return;
    }

    // Validate password strength
    const strength = checkPasswordStrength(formData.password);
    if (strength.strength < 100) {
      const missing = [];
      if (!strength.requirements.length) missing.push('at least 8 characters');
      if (!strength.requirements.uppercase) missing.push('one uppercase letter');
      if (!strength.requirements.lowercase) missing.push('one lowercase letter');
      if (!strength.requirements.number) missing.push('one number');
      if (!strength.requirements.special) missing.push('one special character');
      setError(`Password must contain: ${missing.join(', ')}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    // Prepare registration data
    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      userType: formData.userType,
    };

    // Add organization data for B2B/B2E
    if (formData.userType === 'b2b' || formData.userType === 'b2e') {
      registrationData.organizationName = formData.organizationName;
      registrationData.organizationType = formData.organizationType;
    }

    const result = await register(registrationData);
    if (result.success) {
      setSubmitting(false);
      if (result.requiresVerification) {
        // Show verification message instead of redirecting
        setError(''); // Clear any errors
        setEmailError(''); // Clear email error
        // Clear form data
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setPasswordStrength({ strength: 0, label: '', color: '#e0e0e0', requirements: {} });
        
        // Always show success message to check email
        const message = 'Registration successful! Please check your email to verify it.';
        
        setSnackbar({
          open: true,
          message: message,
          severity: 'success'
        });
        // Don't redirect, show success message on same page
      } else {
        router.push(redirect || '/dashboard');
      }
    } else {
      // Display human-readable error message
      const errorMessage = result.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          pt: { xs: 20, md: 20 },
          pb: { xs: 8, md: 10 },
          minHeight: '100vh',
          backgroundColor: '#F5F8FB',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#063C5E',
                  mb: 1,
                  textAlign: 'center',
                }}
              >
                Register
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 4, textAlign: 'center' }}
              >
                Create an account to get started
              </Typography>

              {/* User Type Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#063C5E' }}>
                  I am registering as:
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Button
                    variant={formData.userType === 'b2c' ? 'contained' : 'outlined'}
                    onClick={() => setFormData({ ...formData, userType: 'b2c', organizationName: '', organizationType: 'company' })}
                    sx={{
                      flex: 1,
                      backgroundColor: formData.userType === 'b2c' ? '#0B7897' : 'transparent',
                      color: formData.userType === 'b2c' ? 'white' : '#0B7897',
                      borderColor: '#0B7897',
                      '&:hover': {
                        backgroundColor: formData.userType === 'b2c' ? '#063C5E' : 'rgba(11, 120, 151, 0.1)',
                      },
                    }}
                  >
                    Individual (B2C)
                  </Button>
                  <Button
                    variant={formData.userType === 'b2b' ? 'contained' : 'outlined'}
                    onClick={() => setFormData({ ...formData, userType: 'b2b', organizationName: '', organizationType: 'company' })}
                    sx={{
                      flex: 1,
                      backgroundColor: formData.userType === 'b2b' ? '#0B7897' : 'transparent',
                      color: formData.userType === 'b2b' ? 'white' : '#0B7897',
                      borderColor: '#0B7897',
                      '&:hover': {
                        backgroundColor: formData.userType === 'b2b' ? '#063C5E' : 'rgba(11, 120, 151, 0.1)',
                      },
                    }}
                  >
                    Business (B2B)
                  </Button>
                  <Button
                    variant={formData.userType === 'b2e' ? 'contained' : 'outlined'}
                    onClick={() => setFormData({ ...formData, userType: 'b2e', organizationName: '', organizationType: 'school' })}
                    sx={{
                      flex: 1,
                      backgroundColor: formData.userType === 'b2e' ? '#0B7897' : 'transparent',
                      color: formData.userType === 'b2e' ? 'white' : '#0B7897',
                      borderColor: '#0B7897',
                      '&:hover': {
                        backgroundColor: formData.userType === 'b2e' ? '#063C5E' : 'rgba(11, 120, 151, 0.1)',
                      },
                    }}
                  >
                    School (B2E)
                  </Button>
                </Stack>

                {/* Organization/School Fields for B2B/B2E */}
                {(formData.userType === 'b2b' || formData.userType === 'b2e') && (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label={formData.userType === 'b2e' ? 'School Name' : 'Organization Name'}
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      required
                      helperText={formData.userType === 'b2e' ? 'Enter your school name' : 'Enter your organization name'}
                    />
                    <TextField
                      fullWidth
                      select
                      label={formData.userType === 'b2e' ? 'School Type' : 'Organization Type'}
                      value={formData.organizationType}
                      onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                      required
                      SelectProps={{
                        native: true,
                      }}
                    >
                      {formData.userType === 'b2e' ? (
                        <>
                          <option value="school">School</option>
                          <option value="govt">Government Institution</option>
                          <option value="other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="company">Company</option>
                          <option value="bank">Bank</option>
                          <option value="govt">Government</option>
                          <option value="other">Other</option>
                        </>
                      )}
                    </TextField>
                  </Stack>
                )}
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoComplete="name"
                    error={formData.name && formData.name.trim().length < 2}
                    helperText={formData.name && formData.name.trim().length < 2 ? 'Name must be at least 2 characters' : ''}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    required
                    autoComplete="email"
                    error={!!emailError}
                    helperText={emailError || 'Enter a valid email address'}
                  />
                  <Box>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      required
                      autoComplete="new-password"
                      error={formData.password && passwordStrength.strength < 100}
                    />
                    {formData.password && formData.password.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Password Strength: <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(passwordStrength.strength)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength.strength}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: passwordStrength.color,
                            },
                          }}
                        />
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" component="div" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            Password must contain:
                          </Typography>
                          <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.75rem' }}>
                            <li style={{ color: passwordStrength.requirements.length ? '#4caf50' : '#f44336' }}>
                              At least 8 characters
                            </li>
                            <li style={{ color: passwordStrength.requirements.uppercase ? '#4caf50' : '#f44336' }}>
                              One uppercase letter (A-Z)
                            </li>
                            <li style={{ color: passwordStrength.requirements.lowercase ? '#4caf50' : '#f44336' }}>
                              One lowercase letter (a-z)
                            </li>
                            <li style={{ color: passwordStrength.requirements.number ? '#4caf50' : '#f44336' }}>
                              One number (0-9)
                            </li>
                            <li style={{ color: passwordStrength.requirements.special ? '#4caf50' : '#f44336' }}>
                              One special character (!@#$%^&*...)
                            </li>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    autoComplete="new-password"
                    error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                    helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    sx={{
                      backgroundColor: '#0B7897',
                      color: 'white',
                      fontWeight: 700,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#063C5E',
                      },
                    }}
                  >
                    {submitting ? 'Registering...' : 'Register'}
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <MuiLink
                    href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                    sx={{ color: '#0B7897', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Login here
                  </MuiLink>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={10000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </>
  );
}

