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
  LinearProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

// Password strength checker
const checkPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '#e0e0e0', requirements: {} };
  
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '#e0e0e0', requirements: {} });
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      if (!token) {
        setError('Invalid reset token. Please request a new password reset.');
      }
      setLoading(false);
    }
  }, [router.isReady, token]);

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

    try {
      await axios.post(`${API_URL}/auth/user/reset-password`, {
        token,
        password: formData.password,
      });
      setSuccess(true);
      // Clear form data
      setFormData({ password: '', confirmPassword: '' });
      setPasswordStrength({ strength: 0, label: '', color: '#e0e0e0', requirements: {} });
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          pt: { xs: 20, md: 20 },
          minHeight: '100vh',
          height: '100%',
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
                Reset Password
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 4, textAlign: 'center' }}
              >
                Enter your new password below.
              </Typography>

              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </Box>
              ) : success ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Password reset successfully! Redirecting to login page...
                </Alert>
              ) : (
                <>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      <Box>
                        <TextField
                          fullWidth
                          label="New Password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handlePasswordChange}
                          required
                          autoComplete="new-password"
                          error={formData.password && passwordStrength.strength < 100}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  aria-label="toggle password visibility"
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
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
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        autoComplete="new-password"
                        error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                        helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                aria-label="toggle confirm password visibility"
                              >
                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={submitting || !token}
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
                        {submitting ? 'Resetting...' : 'Reset Password'}
                      </Button>
                    </Stack>
                  </Box>
                </>
              )}

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  <MuiLink
                    href="/login"
                    sx={{ color: '#0B7897', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Back to Login
                  </MuiLink>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}

