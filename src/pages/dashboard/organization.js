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
  Avatar,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const { user: authUser, logout, getAuthToken, requireAuth } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: '',
    type: 'company',
    segment: 'B2B',
    primaryContact: { name: '', email: '', phone: '', jobTitle: '' }
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!authUser && !loading) {
      router.push('/login?redirect=/dashboard/organization');
      return;
    }
    // Redirect B2C users to regular dashboard
    if (authUser && authUser.role === 'b2c_user') {
      router.push('/dashboard');
      return;
    }
    if (authUser) {
      fetchDashboardData();
      fetchOrganizations();
    }
  }, [authUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/user/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/user/organizations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Format organizations for display
      const formattedOrgs = response.data.map(org => ({
        id: org._id || org.id,
        name: org.name,
        type: org.type,
        segment: org.segment,
        status: org.status,
        primaryContact: org.primaryContact,
        customPackagesCount: org.customPackages?.length || 0,
        userCount: org.userCount || 0,
        activeContractsCount: org.activeContractsCount || 0,
        createdAt: org.createdAt
      }));
      setOrganizations(formattedOrgs);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const handleCreateOrg = () => {
    setOrgForm({
      name: '',
      type: authUser?.role === 'b2e_user' ? 'school' : 'company',
      segment: authUser?.role === 'b2e_user' ? 'B2E' : 'B2B',
      primaryContact: {
        name: authUser?.name || '',
        email: authUser?.email || '',
        phone: '',
        jobTitle: ''
      }
    });
    setSelectedOrg(null);
    setOrgDialogOpen(true);
  };

  const handleEditOrg = (org) => {
    setSelectedOrg(org);
    setOrgForm({
      name: org.name || '',
      type: org.type || 'company',
      segment: org.segment || 'B2B',
      primaryContact: {
        name: org.primaryContact?.name || authUser?.name || '',
        email: org.primaryContact?.email || authUser?.email || '',
        phone: org.primaryContact?.phone || '',
        jobTitle: org.primaryContact?.jobTitle || ''
      }
    });
    setOrgDialogOpen(true);
  };

  const handleSaveOrg = async () => {
    try {
      setSubmitting(true);
      const token = getAuthToken();
      
      const orgData = {
        name: orgForm.name,
        type: orgForm.type,
        segment: orgForm.segment,
        primaryContact: orgForm.primaryContact
      };

      if (selectedOrg) {
        await axios.put(`${API_URL}/user/organizations/${selectedOrg.id}`, orgData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: 'Organization updated successfully',
          severity: 'success'
        });
      } else {
        await axios.post(`${API_URL}/user/organizations`, orgData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: 'Organization created successfully',
          severity: 'success'
        });
      }

      setOrgDialogOpen(false);
      fetchOrganizations();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to save organization',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !authUser) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', height: '100%', pt: 8 }}>
          <LoadingState message="Loading dashboard..." />
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
          <ErrorDisplay error={error} title="Failed to Load Dashboard" />
        </Box>
        <Footer />
      </>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { user, organizations: userOrgs } = dashboardData;

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          pt: { xs: 20, md: 20 },
          minHeight: '80vh',
          backgroundColor: '#F5F8FB',
          py: 10,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#063C5E',
              }}
            >
              {user.role === 'b2e_user' ? 'School' : 'Organization'} Dashboard
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateOrg}
              sx={{
                backgroundColor: '#0B7897',
                '&:hover': { backgroundColor: '#063C5E' }
              }}
            >
              Create {user.role === 'b2e_user' ? 'School' : 'Organization'}
            </Button>
          </Box>

          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="My Organizations" />
            <Tab label="Profile" />
          </Tabs>

          {selectedTab === 0 && (
            <Grid container spacing={3}>
              {organizations && organizations.length > 0 ? (
                organizations.map((org) => (
                  <Grid item xs={12} md={6} lg={4} key={org.id}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 1 }}>
                              {org.name}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              <Chip
                                label={org.segment}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                              />
                              <Chip
                                label={org.type}
                                size="small"
                                variant="outlined"
                              />
                            </Stack>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleEditOrg(org)}
                            sx={{ color: '#0B7897' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={1}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Primary Contact
                            </Typography>
                            <Typography variant="body2">
                              {org.primaryContact?.name || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {org.primaryContact?.email || ''}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Users
                            </Typography>
                            <Typography variant="body2">
                              {org.userCount || 0} users
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Custom Packages
                            </Typography>
                            <Typography variant="body2">
                              {org.customPackagesCount || 0} packages
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Status
                            </Typography>
                            <Chip
                              label={org.status || 'prospect'}
                              size="small"
                              color={org.status === 'active' ? 'success' : 'default'}
                            />
                          </Box>
                        </Stack>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<BusinessIcon />}
                          sx={{ mt: 2, borderColor: '#0B7897', color: '#0B7897' }}
                          onClick={() => router.push(`/dashboard/organization/${org.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <BusinessIcon sx={{ fontSize: 60, color: '#0B7897', mb: 2 }} />
                      <Typography variant="h6" sx={{ mb: 1, color: '#063C5E' }}>
                        No {user.role === 'b2e_user' ? 'Schools' : 'Organizations'} Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create your first {user.role === 'b2e_user' ? 'school' : 'organization'} to get started
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateOrg}
                        sx={{
                          backgroundColor: '#0B7897',
                          '&:hover': { backgroundColor: '#063C5E' }
                        }}
                      >
                        Create {user.role === 'b2e_user' ? 'School' : 'Organization'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {selectedTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: '#0B7897',
                          fontSize: '2rem',
                          mr: 2,
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                          {user.name || 'User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Account Status
                        </Typography>
                        <Chip
                          label={user.isActive ? 'Active' : 'Disabled'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 0.5, ml: 2 }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body2">
                          {user.role === 'b2b_user' ? 'Business User (B2B)' : user.role === 'b2e_user' ? 'Education User (B2E)' : 'B2C User'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body2">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>

      {/* Organization Dialog */}
      <Dialog open={orgDialogOpen} onClose={() => setOrgDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedOrg ? 'Edit Organization' : `Create ${user.role === 'b2e_user' ? 'School' : 'Organization'}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={`${user.role === 'b2e_user' ? 'School' : 'Organization'} Name`}
              value={orgForm.name}
              onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              select
              label={`${user.role === 'b2e_user' ? 'School' : 'Organization'} Type`}
              value={orgForm.type}
              onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value })}
              required
              SelectProps={{ native: true }}
            >
              {user.role === 'b2e_user' ? (
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
            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Primary Contact
            </Typography>
            <TextField
              fullWidth
              label="Contact Name"
              value={orgForm.primaryContact.name}
              onChange={(e) => setOrgForm({
                ...orgForm,
                primaryContact: { ...orgForm.primaryContact, name: e.target.value }
              })}
              required
            />
            <TextField
              fullWidth
              label="Contact Email"
              type="email"
              value={orgForm.primaryContact.email}
              onChange={(e) => setOrgForm({
                ...orgForm,
                primaryContact: { ...orgForm.primaryContact, email: e.target.value }
              })}
              required
            />
            <TextField
              fullWidth
              label="Contact Phone"
              value={orgForm.primaryContact.phone}
              onChange={(e) => setOrgForm({
                ...orgForm,
                primaryContact: { ...orgForm.primaryContact, phone: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Job Title"
              value={orgForm.primaryContact.jobTitle}
              onChange={(e) => setOrgForm({
                ...orgForm,
                primaryContact: { ...orgForm.primaryContact, jobTitle: e.target.value }
              })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrgDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveOrg}
            variant="contained"
            disabled={submitting}
            sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
          >
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999,
          }}
        >
          {snackbar.message}
        </Alert>
      )}

      <Footer />
    </>
  );
}

