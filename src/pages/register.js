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
  Autocomplete,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
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
  const [registrationType, setRegistrationType] = useState('individual'); // individual, b2b, b2e, member
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    userType: 'b2c', // b2c, b2b, b2e
    organizationName: '',
    organizationType: 'company', // company, bank, school, govt, other
    customOrganizationType: '', // Custom type when "other" is selected
    organizationCode: '' // For member registration
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '#e0e0e0', requirements: {} });
  const [emailError, setEmailError] = useState('');
  const [memberContext, setMemberContext] = useState('unknown'); // organization | school | unknown
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { redirect, ref: referralCode } = router.query;

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

  const handleCodeChange = async (code) => {
    if (code.length >= 8) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // Verify code and get organization/school name
        const orgResponse = await fetch(`${API_URL}/api/organizations/code/${code}`);
        const schoolResponse = await fetch(`${API_URL}/api/schools/code/${code}`);
        
        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          setFormData(prev => ({ ...prev, organizationName: orgData.name }));
          setMemberContext('organization');
        } else if (schoolResponse.ok) {
          const schoolData = await schoolResponse.json();
          setFormData(prev => ({ ...prev, organizationName: schoolData.name }));
          setMemberContext('school');
        } else {
          setFormData(prev => ({ ...prev, organizationName: '' }));
          setMemberContext('unknown');
        }
      } catch (err) {
        // Ignore errors
        setFormData(prev => ({ ...prev, organizationName: '' }));
        setMemberContext('unknown');
      }
    } else {
      setFormData(prev => ({ ...prev, organizationName: '' }));
      setMemberContext('unknown');
    }
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

    // Validate organization type for B2B/B2E
    if ((formData.userType === 'b2b' || formData.userType === 'b2e') && !formData.organizationType) {
      setError('Organization type is required');
      return;
    }

    // Validate custom organization type when "other" is selected
    if ((formData.userType === 'b2b' || formData.userType === 'b2e') && formData.organizationType === 'other' && !formData.customOrganizationType.trim()) {
      setError('Please specify your organization type');
      return;
    }

    // Validate organization/institute code for member registration
    if ((registrationType === 'member_org' || registrationType === 'member_institute') &&
        (!formData.organizationCode || formData.organizationCode.trim().length < 8)) {
      const label =
        registrationType === 'member_institute'
          ? 'School or Institute code'
          : registrationType === 'member_org'
            ? 'Organization code'
            : 'Organization or School code';
      setError(`${label} is required`);
      return;
    }

    setSubmitting(true);

    // Handle member registration separately
    if (registrationType === 'member_org' || registrationType === 'member_institute') {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        const response = await fetch(`${API_URL}/api/auth/member/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            organizationCode: formData.organizationCode.toUpperCase()
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Registration failed. Please try again.');
          setSubmitting(false);
          return;
        }

        setSubmitting(false);
        setError('');
        setFormData({ name: '', email: '', password: '', confirmPassword: '', organizationName: '', organizationCode: '' });
        setPasswordStrength({ strength: 0, label: '', color: '#e0e0e0', requirements: {} });

        // Show clear message depending on whether this is organization or institute member
        const defaultMessage =
          registrationType === 'member_institute'
            ? 'Registration successful! Your request has been sent to the institute admin for approval. You will receive an email once your account is approved. After approval, you can log in using your email and password.'
            : 'Registration successful! Your request has been sent to the organization admin for approval. You will receive an email once your account is approved. After approval, you can log in using your email and password.';

        setSnackbar({
          open: true,
          // Use our context-aware message instead of the generic backend text
          message: defaultMessage,
          severity: 'success'
        });
      } catch (err) {
        setError('Registration failed. Please try again.');
        setSubmitting(false);
      }
      return;
    }

    // Prepare registration data for individual/organization registration
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
      // If "other" is selected and custom type is provided, send custom type
      if (formData.organizationType === 'other' && formData.customOrganizationType) {
        registrationData.customOrganizationType = formData.customOrganizationType;
      }
    }

    // Add referral code if present in URL
    if (referralCode) {
      registrationData.referralCode = referralCode;
      console.log('Adding referral code to registration:', referralCode);
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
            {snackbar.open && (
                <Alert 
                  severity={snackbar.severity}
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  sx={{ mb: 3 }}
                >
                  {snackbar.message}
                </Alert>
              )}
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

            

              {/* Registration Type Tabs */}
              <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={registrationType}
                  onChange={(e, newValue) => {
                    setRegistrationType(newValue);
                    setFormData({ 
                      name: '', 
                      email: '', 
                      password: '', 
                      confirmPassword: '',
                      userType: newValue === 'b2b' ? 'b2b' : (newValue === 'b2e' ? 'b2e' : 'b2c'),
                      organizationName: '',
                      organizationType: newValue === 'b2b' ? 'company' : (newValue === 'b2e' ? 'school' : 'company'),
                      customOrganizationType: '',
                      organizationCode: ''
                    });
                    // Set default member context based on tab
                    if (newValue === 'member_org') {
                      setMemberContext('organization');
                    } else if (newValue === 'member_institute') {
                      setMemberContext('school');
                    } else {
                      setMemberContext('unknown');
                    }
                    setError('');
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      minWidth: 'auto',
                      padding: '12px 16px',
                    },
                    '& .MuiTabs-scrollButtons': {
                      '&.Mui-disabled': {
                        opacity: 0.3,
                      },
                    },
                  }}
                >
                  <Tab label="Individual B2C" value="individual" />
                  <Tab label="Business B2B" value="b2b" />
                  <Tab label="Institute B2E" value="b2e" />
                  <Tab label="Member of Organization" value="member_org" />
                  <Tab label="Member of Institute" value="member_institute" />
                </Tabs>
              </Box>

              {/* Member Registration Form */}
              {(registrationType === 'member_org' || registrationType === 'member_institute') && (
                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label={
                        registrationType === 'member_institute'
                          ? 'School or Institute Code'
                          : registrationType === 'member_org'
                            ? 'Organization Code'
                            : 'Organization or School Code'
                      }
                      value={formData.organizationCode}
                      onChange={(e) => {
                        const code = e.target.value.toUpperCase();
                        setFormData({ ...formData, organizationCode: code });
                        handleCodeChange(code);
                      }}
                      required
                      helperText={
                        formData.organizationName
                          ? `${registrationType === 'member_institute' ? 'School/Institute' : 'Organization'}: ${formData.organizationName}`
                          : registrationType === 'member_institute'
                            ? 'Enter the unique code provided by your school or institute (e.g., SCH-XXXX)'
                            : registrationType === 'member_org'
                              ? 'Enter the unique code provided by your organization (e.g., ORG-XXXX)'
                              : 'Enter the unique code provided by your organization or school (e.g., ORG-XXXX or SCH-XXXX)'
                      }
                      placeholder={registrationType === 'member_institute' ? 'e.g., SCH-XXXX' : 'e.g., ORG-XXXX'}
                    />
                    {formData.organizationName && (
                      <Alert severity="info">
                        You are registering as a member of: <strong>{formData.organizationName}</strong>
                      </Alert>
                    )}
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
                      {submitting ? 'Registering...' : 'Register as Member'}
                  </Button>
                  </Stack>
                </Box>
              )}

              {/* Individual Registration Form */}
              {registrationType === 'individual' && (
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
              )}

              {/* Business B2B Registration Form */}
              {registrationType === 'b2b' && (
                <>
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Organization Name"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      required
                      helperText="Enter your organization name"
                    />
                    <Autocomplete
                      freeSolo
                      options={['Company', 'Bank', 'Government', 'Other']}
                      value={(() => {
                        const type = formData.organizationType;
                        if (type === 'company') return 'Company';
                        if (type === 'bank') return 'Bank';
                        if (type === 'govt') return 'Government';
                        if (type === 'other') return 'Other';
                        return type || '';
                      })()}
                      onChange={(event, newValue) => {
                        let value = '';
                        if (typeof newValue === 'string') {
                          if (newValue === 'Company') value = 'company';
                          else if (newValue === 'Bank') value = 'bank';
                          else if (newValue === 'Government') value = 'govt';
                          else if (newValue === 'Other') value = 'other';
                          else value = 'other';
                        } else {
                          value = '';
                        }
                        setFormData({ 
                          ...formData, 
                          organizationType: value,
                          customOrganizationType: value === 'other' && typeof newValue === 'string' && !['Company', 'Bank', 'Government', 'Other'].includes(newValue) 
                            ? newValue 
                            : (value === 'other' ? formData.customOrganizationType : '')
                        });
                      }}
                      onInputChange={(event, newInputValue, reason) => {
                        if (reason === 'input') {
                          let value = '';
                          if (newInputValue === 'Company') value = 'company';
                          else if (newInputValue === 'Bank') value = 'bank';
                          else if (newInputValue === 'Government') value = 'govt';
                          else if (newInputValue === 'Other') value = 'other';
                          else if (newInputValue) value = 'other';
                          setFormData({ 
                            ...formData, 
                            organizationType: value,
                            customOrganizationType: value === 'other' && newInputValue && !['Company', 'Bank', 'Government', 'Other'].includes(newInputValue)
                              ? newInputValue
                              : (value === 'other' ? formData.customOrganizationType : '')
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label="Organization Type"
                          required
                          helperText="Select from dropdown or type your organization type"
                        />
                      )}
                    />
                    {formData.organizationType === 'other' && (
                      <TextField
                        fullWidth
                        label="Specify Organization Type"
                        value={formData.customOrganizationType}
                        onChange={(e) => setFormData({ ...formData, customOrganizationType: e.target.value })}
                        required
                        helperText="Please specify your organization type"
                      />
                    )}
                  </Stack>

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
                </>
              )}

              {/* Institute B2E Registration Form */}
              {registrationType === 'b2e' && (
                <>
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="School Name"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      required
                      helperText="Enter your school name"
                    />
                    <Autocomplete
                      freeSolo
                      options={['School', 'Government Institution', 'Other']}
                      value={(() => {
                        const type = formData.organizationType;
                        if (type === 'school') return 'School';
                        if (type === 'govt') return 'Government Institution';
                        if (type === 'other') return 'Other';
                        return type || '';
                      })()}
                      onChange={(event, newValue) => {
                        let value = '';
                        if (typeof newValue === 'string') {
                          if (newValue === 'School') value = 'school';
                          else if (newValue === 'Government Institution') value = 'govt';
                          else if (newValue === 'Other') value = 'other';
                          else value = 'other';
                        } else {
                          value = '';
                        }
                        setFormData({ 
                          ...formData, 
                          organizationType: value,
                          customOrganizationType: value === 'other' && typeof newValue === 'string' && !['School', 'Government Institution', 'Other'].includes(newValue) 
                            ? newValue 
                            : (value === 'other' ? formData.customOrganizationType : '')
                        });
                      }}
                      onInputChange={(event, newInputValue, reason) => {
                        if (reason === 'input') {
                          let value = '';
                          if (newInputValue === 'School') value = 'school';
                          else if (newInputValue === 'Government Institution') value = 'govt';
                          else if (newInputValue === 'Other') value = 'other';
                          else if (newInputValue) value = 'other';
                          setFormData({ 
                            ...formData, 
                            organizationType: value,
                            customOrganizationType: value === 'other' && newInputValue && !['School', 'Government Institution', 'Other'].includes(newInputValue)
                              ? newInputValue
                              : (value === 'other' ? formData.customOrganizationType : '')
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label="School Type"
                          required
                          helperText="Select from dropdown or type your school type"
                        />
                      )}
                    />
                    {formData.organizationType === 'other' && (
                      <TextField
                        fullWidth
                        label="Specify School Type"
                        value={formData.customOrganizationType}
                        onChange={(e) => setFormData({ ...formData, customOrganizationType: e.target.value })}
                        required
                        helperText="Please specify your school type"
                      />
                    )}
                  </Stack>

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
                </>
              )}


              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

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


      <Footer />
    </>
  );
}

