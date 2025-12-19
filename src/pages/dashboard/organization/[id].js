'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function OrganizationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user: authUser, getAuthToken } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberRequests, setMemberRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    if (!authUser) {
      // Only redirect if we have a valid ID, otherwise redirect to organization list
      const redirectPath = id && id !== '[id]' 
        ? `/dashboard/organization/${id}` 
        : '/dashboard/organization';
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
    
    if (id && id !== '[id]') {
      fetchOrganizationDetails();
      fetchMemberRequests();
    }
  }, [id, authUser, router]);

  const fetchOrganizationDetails = async () => {
    if (!id || id === '[id]') {
      setError('Invalid organization ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      // Check if user owns this organization
      const userResponse = await axios.get(`${API_URL}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const user = userResponse.data;
      let orgId = id;
      
      // If user has organizationId, use that
      if (user.organizationId && user.organizationId.toString() === id) {
        orgId = user.organizationId;
      } else if (user.schoolId && user.schoolId.toString() === id) {
        orgId = user.schoolId;
      }

      // Try to fetch as organization first, then as school
      let response;
      try {
        response = await axios.get(`${API_URL}/organizations/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrganization(response.data.organization);
        if (response.data.orgUsers) {
          setMembers(response.data.orgUsers);
        }
      } catch (orgErr) {
        // If organization fetch fails, try school
        try {
          response = await axios.get(`${API_URL}/schools/${orgId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOrganization(response.data);
        } catch (schoolErr) {
          throw orgErr; // Throw original error
        }
      }
    } catch (err) {
      console.error('Error fetching organization details:', err);
      if (err.response?.status === 404) {
        setError({ message: 'Organization not found' });
      } else if (err.response?.status === 403) {
        setError({ message: 'You do not have permission to view this organization' });
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberRequests = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/auth/member/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemberRequests(response.data.requests || []);
    } catch (err) {
      console.error('Error fetching member requests:', err);
    }
  };

  const handleApproveMember = async (requestId) => {
    try {
      setProcessingRequest(requestId);
      const token = getAuthToken();
      await axios.post(`${API_URL}/auth/member/requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: 'Member request approved successfully',
        severity: 'success'
      });
      fetchMemberRequests();
      fetchOrganizationDetails();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to approve member request. Please try again.',
        severity: 'error'
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectMember = async (requestId) => {
    try {
      setProcessingRequest(requestId);
      const token = getAuthToken();
      await axios.post(`${API_URL}/auth/member/requests/${requestId}/reject`, { rejectionReason: 'Request rejected by admin' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: 'Member request rejected successfully',
        severity: 'success'
      });
      fetchMemberRequests();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to reject member request. Please try again.',
        severity: 'error'
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', height: '100%', pt: 8 }}>
          <LoadingState message="Loading organization details..." />
        </Box>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '80vh', pt: 8 }}>
          <Container maxWidth="lg">
            <ErrorDisplay error={error} title="Failed to Load Organization" />
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard/organization')}
              sx={{ mt: 2 }}
            >
              Back to Dashboard
            </Button>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          pt: { xs: 20, md: 20 },
          minHeight: '80vh',
          backgroundColor: '#F5F8FB',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              color="inherit"
              href="/dashboard/organization"
              onClick={(e) => {
                e.preventDefault();
                router.push('/dashboard/organization');
              }}
              sx={{ cursor: 'pointer' }}
            >
              Dashboard
            </Link>
            <Typography color="text.primary">Organization Details</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => router.push('/dashboard/organization')}
                sx={{ color: '#0B7897' }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#063C5E',
                  }}
                >
                  {organization.name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {organization.segment && (
                    <Chip
                      label={organization.segment}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  <Chip
                    label={organization.type}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={organization.status || 'prospect'}
                    size="small"
                    color={organization.status === 'active' ? 'success' : 'default'}
                  />
                </Stack>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Organization Information */}
            <Grid item xs={12} md={8}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 3 }}>
                    Organization Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Organization Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {organization.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Organization Type
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {organization.type}
                        {organization.customType && ` (${organization.customType})`}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Unique Code
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#0B7897', mt: 0.5, fontSize: '1.2rem' }}>
                        {organization.uniqueCode}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Box sx={{ ml:2, mt: 0.5 }}>
                        <Chip
                          label={organization.status || 'prospect'}
                          size="small"
                          color={organization.status === 'active' ? 'success' : 'default'}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {new Date(organization.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Primary Contact */}
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 3 }}>
                    Primary Contact
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ color: '#0B7897' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {organization.primaryContact?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ color: '#0B7897' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {organization.primaryContact?.email || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    {organization.primaryContact?.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ color: '#0B7897' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Phone
                          </Typography>
                          <Typography variant="body1">
                            {organization.primaryContact.phone}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {organization.primaryContact?.jobTitle && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Job Title
                        </Typography>
                        <Typography variant="body1">
                          {organization.primaryContact.jobTitle}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 3 }}>
                    Quick Stats
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Members
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#0B7897' }}>
                        {members.length}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Pending Requests
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800' }}>
                        {memberRequests.length}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Custom Packages
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#0B7897' }}>
                        {organization.customPackages?.length || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Member Requests */}
            {memberRequests.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 3 }}>
                      Pending Member Requests
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Requested At</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {memberRequests.map((request) => (
                            <TableRow key={request._id}>
                              <TableCell>{request.user?.name || 'N/A'}</TableCell>
                              <TableCell>{request.user?.email || 'N/A'}</TableCell>
                              <TableCell>
                                {new Date(request.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleApproveMember(request._id)}
                                    disabled={processingRequest === request._id}
                                    startIcon={processingRequest === request._id ? <CircularProgress size={14} /> : null}
                                    sx={{ minWidth: 80 }}
                                  >
                                    {processingRequest === request._id ? 'Processing...' : 'Approve'}
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleRejectMember(request._id)}
                                    disabled={processingRequest === request._id}
                                    startIcon={processingRequest === request._id ? <CircularProgress size={14} /> : null}
                                    sx={{ minWidth: 80 }}
                                  >
                                    {processingRequest === request._id ? 'Processing...' : 'Reject'}
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Members List */}
            {members.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 3 }}>
                      Organization Members
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Joined At</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {members.map((member) => (
                            <TableRow key={member._id || member.id}>
                              <TableCell>{member.userId?.name || member.name || 'N/A'}</TableCell>
                              <TableCell>{member.userId?.email || member.email || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={member.status || 'active'}
                                  size="small"
                                  color={member.status === 'active' ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

