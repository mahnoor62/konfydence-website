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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, logout, getAuthToken, requireAuth } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!authUser && !loading) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    if (authUser) {
      // Check if user is a member (has organizationId or schoolId)
      const hasOrganizationId = authUser.organizationId;
      const hasSchoolId = authUser.schoolId;
      const isMember = hasOrganizationId || hasSchoolId;
      
      // Redirect members to member dashboard
      if (isMember && (authUser.role === 'b2b_member' || authUser.role === 'b2e_member')) {
        router.push('/dashboard/member');
        return;
      }
      
      // Redirect B2B users to Organization dashboard and B2E users to Institute dashboard
      if (authUser.role === 'b2b_user') {
        router.push('/dashboard/organization');
        return;
      }
      if (authUser.role === 'b2e_user') {
        router.push('/dashboard/institute');
        return;
      }
      fetchDashboardData();
    }
  }, [authUser, router]);

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

  const getProfilePhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return null;
    if (profilePhoto.startsWith('http')) return profilePhoto;
    const apiBase = API_BASE_URL || 'http://localhost:5000';
    const normalizedApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    return `${normalizedApiBase}${profilePhoto}`;
  };

  const handleEditProfile = () => {
    setEditForm({ 
      name: dashboardData?.user?.name || '', 
      email: dashboardData?.user?.email || '' 
    });
    setProfilePhotoFile(null);
    // Set preview to current profile photo if exists
    const currentPhotoUrl = getProfilePhotoUrl(dashboardData?.user?.profilePhoto);
    setProfilePhotoPreview(currentPhotoUrl);
    setEditDialogOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Please select an image file',
          severity: 'error'
        });
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size must be less than 5MB',
          severity: 'error'
        });
        return;
      }

      setProfilePhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setUploadingPhoto(true);
      const token = getAuthToken();
      await axios.delete(`${API_URL}/profile/photo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSnackbar({
        open: true,
        message: 'Profile photo deleted successfully',
        severity: 'success'
      });

      setProfilePhotoPreview(null);
      setProfilePhotoFile(null);
      fetchDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to delete profile photo',
        severity: 'error'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSubmitting(true);
      const token = getAuthToken();
      
      // Upload photo first if selected
      if (profilePhotoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('photo', profilePhotoFile);

        await axios.post(
          `${API_URL}/profile/photo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setUploadingPhoto(false);
      }

      // Update profile
      await axios.put(
        `${API_URL}/user/profile`,
        { 
          name: editForm.name,
          email: editForm.email 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      setEditDialogOpen(false);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
      fetchDashboardData();
    } catch (err) {
      setUploadingPhoto(false);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAccount = async () => {
    try {
      const token = getAuthToken();
      await axios.put(
        `${API_URL}/user/account/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: dashboardData?.user?.isActive
          ? 'Account disabled successfully'
          : 'Account enabled successfully',
        severity: 'success',
      });
      fetchDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to toggle account',
        severity: 'error',
      });
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

  // Show loading if redirecting B2B/B2E users
  if (authUser && (authUser.role === 'b2b_user' || authUser.role === 'b2e_user')) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', height: '100%', pt: 8 }}>
          <LoadingState message="Redirecting to organization dashboard..." />
        </Box>
        <Footer />
      </>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { user, membership, allMemberships, activePackages, progress, transactions, gameProgress, organizations } = dashboardData;

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
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#063C5E',
              mb: 4,
            }}
          >
            Dashboard
          </Typography>

          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {/* Profile Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={getProfilePhotoUrl(user.profilePhoto)}
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

                  <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'space-between' }}>
                    <Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Account Status
                        </Typography>
                        <Chip
                          label={user.isActive ? 'Active' : 'Disabled'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 0.5  , ml:2 }}
                        />
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body2">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {user.lastLogin && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Last Login
                          </Typography>
                          <Typography variant="body2">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Divider sx={{ my: 1 }} />

                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleEditProfile}
                        sx={{ borderColor: '#0B7897', color: '#0B7897', mb: 1 }}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleToggleAccount}
                        sx={{
                          borderColor: user.isActive ? '#d32f2f' : '#0B7897',
                          color: user.isActive ? '#d32f2f' : '#0B7897',
                        }}
                      >
                        {user.isActive ? 'Disable Account' : 'Enable Account'}
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Membership & Packages */}
            {(allMemberships && allMemberships.length > 0) || (activePackages && activePackages.length > 0) ? (
              <Grid item xs={12} md={8}>
                {allMemberships && allMemberships.length > 0 && (
                  <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                        Membership {allMemberships.length > 0 && `(${allMemberships.length})`}
                      </Typography>
                      <Grid container spacing={2}>
                        {allMemberships.map((mem) => (
                          <Grid item xs={12} sm={6} lg={4} key={mem.id}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: '#F5F8FB',
                                borderRadius: 2,
                                border: '1px solid #E0E7F0',
                                height: '100%',
                              }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" mb={1} flexWrap="wrap">
                                <Chip
                                  label={mem.type?.toUpperCase() || 'B2C'}
                                  color="primary"
                                  sx={{ fontWeight: 600 }}
                                  size="small"
                                />
                                <Chip
                                  label={mem.status}
                                  color={mem.status === 'active' ? 'success' : 'default'}
                                  size="small"
                                />
                              </Stack>
                              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                                {mem.package?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Started: {new Date(mem.startDate).toLocaleDateString()}
                              </Typography>
                              {mem.endDate && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Expires: {new Date(mem.endDate).toLocaleDateString()}
                                </Typography>
                              )}
                              
                              {/* Game Progress for this Membership */}
                              {mem.gameProgress && mem.gameProgress.totalLevelsPlayed > 0 && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E7F0' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                    Game Progress
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Score
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {mem.gameProgress.percentageScore}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={mem.gameProgress.percentageScore}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      backgroundColor: '#E0E7F0',
                                      mb: 0.5,
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: '#0B7897',
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                    {mem.gameProgress.totalLevelsPlayed} level(s) • {mem.gameProgress.correctAnswers}/{mem.gameProgress.totalQuestions} correct
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {activePackages && activePackages.length > 0 && (
                  <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                        Active Packages {activePackages.length > 0 && `(${activePackages.length})`}
                      </Typography>
                      <Grid container spacing={2}>
                        {activePackages.map((pkg) => {
                          const typeLabel =
                            pkg.membershipType === 'b2b'
                              ? 'Organization Package'
                              : pkg.membershipType === 'b2e'
                                ? 'Institute Package'
                                : 'Personal Package';

                          return (
                            <Grid item xs={12} sm={6} lg={4} key={pkg.id}>
                              <Box
                                sx={{
                                  p: 2,
                                  backgroundColor: '#F5F8FB',
                                  borderRadius: 2,
                                  border: '1px solid #E0E7F0',
                                  height: '100%',
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap">
                                  <Chip
                                    label={typeLabel}
                                    size="small"
                                    color={
                                      pkg.membershipType === 'b2b'
                                        ? 'primary'
                                        : pkg.membershipType === 'b2e'
                                          ? 'secondary'
                                          : 'success'
                                    }
                                    sx={{ fontWeight: 600 }}
                                  />
                                </Stack>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                  {pkg.packageName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Started: {new Date(pkg.startDate).toLocaleDateString()}
                                </Typography>
                                {pkg.endDate && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    Expires: {new Date(pkg.endDate).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            ) : null}

            {/* Progress Tracking - Only show if there's progress data */}
            {(gameProgress && gameProgress.totalLevelsPlayed > 0) || (progress && (progress.totalCards > 0 || (progress.packageProgress && progress.packageProgress.length > 0))) ? (
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, mb: 3, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 3 }}>
                      Progress Tracking
                    </Typography>
                    
                    {/* Game Progress Section */}
                    {gameProgress && gameProgress.totalLevelsPlayed > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                          Game Progress
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Overall Game Score
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {gameProgress.overallPercentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={gameProgress.overallPercentage}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: '#E0E7F0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#0B7897',
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Score: {gameProgress.overallScore} / {gameProgress.overallMaxScore} 
                            ({gameProgress.cards?.reduce((sum, c) => sum + c.correctAnswers, 0) || 0} correct answers out of {gameProgress.cards?.reduce((sum, c) => sum + c.totalQuestions, 0) || 0} questions)
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Total Levels Played: {gameProgress.totalLevelsPlayed}
                          </Typography>
                        </Box>

                        {gameProgress.cards && gameProgress.cards.length > 0 && (
                          <Stack spacing={2}>
                            {gameProgress.cards.map((card, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  p: 2,
                                  backgroundColor: '#F5F8FB',
                                  borderRadius: 2,
                                  border: '1px solid #E0E7F0',
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                  {card.cardTitle}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Card Score
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {card.percentageScore}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={card.percentageScore}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: '#E0E7F0',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: '#FFD700',
                                    },
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                  {card.correctAnswers} of {card.totalQuestions} correct • 
                                  Levels: {card.levels.map(l => `L${l.levelNumber}: ${l.score}/${l.maxScore} (${l.correctAnswers}/${l.totalQuestions})`).join(', ')}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    )}

                    {/* Card Progress Section */}
                    {progress && progress.totalCards > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Overall Card Progress
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {progress.totalProgress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress.totalProgress}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#E0E7F0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#0B7897',
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {progress.completedCards} of {progress.totalCards} cards completed
                        </Typography>
                      </Box>
                    )}

                    {progress && progress.packageProgress && progress.packageProgress.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                          Package Progress
                        </Typography>
                        <Stack spacing={2}>
                          {progress.packageProgress.map((pkg, idx) => (
                            <Box key={idx}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">{pkg.packageName}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {pkg.completionPercentage}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={pkg.completionPercentage}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: '#E0E7F0',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#FFD700',
                                  },
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {pkg.completedCards} of {pkg.totalCards} cards completed
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ) : null}

            {/* Purchase History - Only show if there are transactions */}
            {transactions && transactions.length > 0 ? (
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                      Purchase History
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Package</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{tx.packageName}</TableCell>
                              <TableCell>
                                <Chip
                                  label={tx.type.replace('_', ' ').toUpperCase()}
                                  size="small"
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </TableCell>
                              <TableCell>
                                {tx.currency} {tx.amount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={tx.status}
                                  color={
                                    tx.status === 'paid'
                                      ? 'success'
                                      : tx.status === 'pending'
                                      ? 'warning'
                                      : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            ) : null}
          </Grid>
        </Container>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Profile Photo Upload */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={profilePhotoPreview || getProfilePhotoUrl(dashboardData?.user?.profilePhoto)}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: '#0B7897',
                  fontSize: '2.5rem',
                }}
              >
                {editForm.name?.charAt(0)?.toUpperCase() || editForm.email?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-photo-upload"
                  type="file"
                  onChange={handlePhotoChange}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <label htmlFor="profile-photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      disabled={uploadingPhoto}
                      sx={{
                        borderColor: '#0B7897',
                        color: '#0B7897',
                        '&:hover': {
                          borderColor: '#063C5E',
                          backgroundColor: 'rgba(11, 120, 151, 0.1)',
                        },
                      }}
                    >
                      {uploadingPhoto ? 'Uploading...' : profilePhotoFile ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                  </label>
                  {(profilePhotoPreview || dashboardData?.user?.profilePhoto) && !profilePhotoFile && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDeletePhoto}
                      disabled={uploadingPhoto}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        },
                      }}
                    >
                      Delete Photo
                    </Button>
                  )}
                </Box>
                {profilePhotoFile && (
                  <Typography variant="caption" color="text.secondary">
                    {profilePhotoFile.name}
                  </Typography>
                )}
                {uploadingPhoto && (
                  <CircularProgress size={20} sx={{ mt: 1 }} />
                )}
              </Box>
            </Box>

            <Divider />

            <TextField
              fullWidth
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
              autoComplete="name"
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
              autoComplete="email"
              helperText="Changing email will require verification"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false);
            setProfilePhotoFile(null);
            setProfilePhotoPreview(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={submitting || uploadingPhoto}
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

