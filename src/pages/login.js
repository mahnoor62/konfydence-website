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
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading, checkAuth } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { redirect } = router.query;

  useEffect(() => {
    if (!authLoading && user) {
      // Get correct dashboard route based on user role
      const getDashboardRoute = () => {
        if (!user) return '/dashboard';
        
        const userRole = user.role;
        const hasOrganizationId = user.organizationId;
        const hasSchoolId = user.schoolId;
        const isMember = hasOrganizationId || hasSchoolId;
        
        // Check if user is a member/student
        if (isMember && (userRole === 'b2b_member' || userRole === 'b2e_member')) {
          return '/dashboard/member';
        }
        
        // Check if user is admin
        if (userRole === 'b2b_user') {
          return '/dashboard/organization';
        }
        
        if (userRole === 'b2e_user') {
          return '/dashboard/institute';
        }
        
        // Default dashboard for regular users
        return '/dashboard';
      };
      
      router.push(redirect || getDashboardRoute());
    }
  }, [user, authLoading, redirect, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Login with email and password only
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      setSubmitting(false);
      
      // Get user data from result
      const userData = result.user;
      const userRole = userData?.role;
      
      // Check if user is a member (has organizationId or schoolId)
      const hasOrganizationId = userData?.organizationId;
      const hasSchoolId = userData?.schoolId;
      const isMember = hasOrganizationId || hasSchoolId;
      
      let redirectPath = redirect || '/dashboard';
      
      // Route based on role and membership
      if (isMember && (userRole === 'b2b_member' || userRole === 'b2e_member')) {
        // User is a member/student - route to member dashboard
        redirectPath = '/dashboard/member';
      } else if (userRole === 'b2b_user') {
        // User is organization admin
        redirectPath = '/dashboard/organization';
      } else if (userRole === 'b2e_user') {
        // User is institute admin
        redirectPath = '/dashboard/institute';
      } else if (userRole === 'b2c_user') {
        // Regular user
        redirectPath = '/dashboard';
      }
      
      router.push(redirectPath);
    } else {
      // Display human-readable error message
      const errorMessage = result.error || 'Login failed. Please try again.';
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
            minHeight: '100vh',
            height: '100%',
          backgroundColor: '#F5F8FB',
          display: 'flex',
          alignItems: 'center',
        //   py: 8,
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
                Login
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 4, textAlign: 'center' }}
              >
                Sign in to access your dashboard
              </Typography>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  action={
                    error.includes('verify your email') && (
                      <Button
                        size="small"
                        href="/resend-verification"
                        sx={{ color: 'inherit', textTransform: 'none' }}
                      >
                        Resend Email
                      </Button>
                    )
                  }
                >
                  {error}
                </Alert>
              )}

              {/* Single Login Form - Email and Password Only */}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
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
                    {submitting ? 'Logging in...' : 'Login'}
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <MuiLink
                    href="/forgot-password"
                    sx={{ color: '#0B7897', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Forgot Password?
                  </MuiLink>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Don&apos;t have an account?{' '}
                  <MuiLink
                    href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                    sx={{ color: '#0B7897', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Register here
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

