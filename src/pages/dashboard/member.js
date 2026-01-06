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
  Alert,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function MemberDashboardPage() {
  const router = useRouter();
  const { user: authUser, getAuthToken, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [gameProgress, setGameProgress] = useState([]);
  const [gameLoading, setGameLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadDashboard = async () => {
      const token = getAuthToken();
      
      if (!token) {
        router.push('/login?redirect=/dashboard/member');
        return;
      }
      
      // If authUser is not loaded yet, fetch user directly
      if (!authUser) {
        try {
          const response = await axios.get(`${API_URL}/auth/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.data) {
            const user = response.data;
            // Check role
            if (user.role === 'b2b_member' || user.role === 'b2e_member') {
              // Fetch dashboard data
              await fetchDashboardData();
              await fetchActivities();
            } else {
              router.push('/dashboard');
            }
          } else {
            router.push('/login?redirect=/dashboard/member');
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          router.push('/login?redirect=/dashboard/member');
        }
        return;
      }
      
      // If authUser is loaded, check role
      if (authUser.role !== 'b2b_member' && authUser.role !== 'b2e_member') {
        router.push('/dashboard');
        return;
      }
      
      // Fetch dashboard data
      fetchDashboardData();
      fetchActivities();
      fetchGameProgress();
    };

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data;
      let organization = null;
      let school = null;

      // Fetch organization or school details - Members can only see name and code
      if (user.organizationId) {
        try {
          const orgResponse = await axios.get(`${API_URL}/organizations/${user.organizationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const orgData = orgResponse.data.organization || orgResponse.data;
          // For members, only keep name, code, and segment
          organization = {
            name: orgData.name,
            uniqueCode: orgData.uniqueCode,
            segment: orgData.segment
          };
        } catch (err) {
          console.error('Error fetching organization:', err);
        }
      }

      if (user.schoolId) {
        try {
          const schoolResponse = await axios.get(`${API_URL}/schools/${user.schoolId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const schoolData = schoolResponse.data;
          // For members, only keep name, code, and segment
          school = {
            name: schoolData.name,
            uniqueCode: schoolData.uniqueCode,
            segment: schoolData.segment
          };
        } catch (err) {
          console.error('Error fetching school:', err);
        }
      }

      setDashboardData({
        user,
        organization,
        school
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const token = getAuthToken();
      
      if (!token) return;

      // Fetch member activities from organization/school
      const user = await axios.get(`${API_URL}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let activitiesData = [];

      if (user.data.organizationId) {
        try {
          const response = await axios.get(`${API_URL}/organizations/${user.data.organizationId}/activities`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          activitiesData = response.data.activities || [];
        } catch (err) {
          // If endpoint doesn't exist, create mock activities
          activitiesData = [];
        }
      }

      if (user.data.schoolId) {
        try {
          const response = await axios.get(`${API_URL}/schools/${user.data.schoolId}/activities`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          activitiesData = response.data.activities || [];
        } catch (err) {
          activitiesData = [];
        }
      }

      // If no activities endpoint, show basic member info
      if (activitiesData.length === 0) {
        const contextLabel = user.data.schoolId ? 'the school' : 'the organization';
        activitiesData = [
          {
            type: 'registration',
            description: `You joined ${contextLabel}`,
            timestamp: user.data.createdAt || new Date(),
            memberName: user.data.name
          }
        ];
      }

      setActivities(activitiesData);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchGameProgress = async () => {
    try {
      setGameLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const userResponse = await axios.get(`${API_URL}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userResponse.data;

      const gameResponse = await axios.get(`${API_URL}/game-progress/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // New structure: single document or null
      setGameProgress(gameResponse.data || null);
    } catch (err) {
      console.error('Error fetching game progress:', err);
      setGameProgress(null);
    } finally {
      setGameLoading(false);
    }
  };

  const getProfilePhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return null;
    if (profilePhoto.startsWith('http')) return profilePhoto;
    const apiBase = API_BASE_URL || 'http://localhost:5000';
    const normalizedApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    return `${normalizedApiBase}${profilePhoto}`;
  };

  const handleOpenProfileEdit = () => {
    setEditForm({
      name: dashboardData?.user?.name || '',
      email: dashboardData?.user?.email || '',
    });
    const currentPhotoUrl = getProfilePhotoUrl(dashboardData?.user?.profilePhoto);
    setProfilePhotoPreview(currentPhotoUrl);
    setProfilePhotoFile(null);
    setProfileEditOpen(true);
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Please select an image file',
        severity: 'error',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'Image size must be less than 5MB',
        severity: 'error',
      });
      return;
    }

    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteProfilePhoto = async () => {
    try {
      setUploadingPhoto(true);
      const token = getAuthToken();
      await axios.delete(`${API_URL}/profile/photo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: 'Profile photo deleted successfully',
        severity: 'success',
      });
      setProfilePhotoPreview(null);
      setProfilePhotoFile(null);
      fetchDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to delete profile photo',
        severity: 'error',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setProfileSubmitting(true);
      const token = getAuthToken();

      if (profilePhotoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('photo', profilePhotoFile);
        await axios.post(`${API_URL}/profile/photo`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setUploadingPhoto(false);
      }

      await axios.put(
        `${API_URL}/user/profile`,
        {
          name: editForm.name,
          email: editForm.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      setProfileEditOpen(false);
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
      setProfileSubmitting(false);
    }
  };

  // Show loading only if auth is still loading, not if we're fetching dashboard data
  if (authLoading) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', height: '100%', pt: 8 }}>
          <LoadingState message="Loading..." />
        </Box>
        <Footer />
      </>
    );
  }

  // Check if user has token but authUser not loaded
  const token = getAuthToken();
  if (!token) {
    router.push('/login?redirect=/dashboard/member');
    return null;
  }

  if (loading) {
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

  const { user, organization, school } = dashboardData;
  const orgOrSchool = organization || school;
  const isSchool = !!school;

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
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#063C5E',
                mb: 1,
              }}
            >
              Member Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user.name || user.email}
            </Typography>
          </Box>

          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Dashboard" />
            <Tab label="Profile" />
          </Tabs>

          {selectedTab === 0 && (
          <Grid container spacing={3}>
            {/* Organization/School Info Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: '#0B7897',
                        mr: 2,
                      }}
                    >
                      {isSchool ? <SchoolIcon /> : <BusinessIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                        {orgOrSchool?.name || 'Organization'}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        {orgOrSchool?.segment && (
                          <Chip
                            label={orgOrSchool.segment}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                        <Chip
                          label={isSchool ? 'School' : 'Organization'}
                          size="small"
                          color="primary"
                        />
                      </Stack>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Member Status
                      </Typography>
                      <Chip
                        label={user.memberStatus === 'approved' ? 'Approved' : user.memberStatus === 'pending' ? 'Pending Approval' : 'Rejected'}
                        size="small"
                        color={user.memberStatus === 'approved' ? 'success' : user.memberStatus === 'pending' ? 'warning' : 'error'}
                        sx={{ 
                          mt: 0.5, 
                          ml: 1,
                          ...(user.memberStatus === 'approved' && {
                            color: 'white',
                            '& .MuiChip-label': {
                              color: 'white',
                            },
                          }),
                        }}
                      />
                    </Box>
                    {orgOrSchool?.uniqueCode && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {isSchool ? 'Institute Code' : 'Organization Code'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                          {orgOrSchool.uniqueCode}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Password
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                        {user.password || '••••••••'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Activities Card - Hidden */}
            {/* <Grid item xs={12} md={8}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                      Your Activities
                    </Typography>
                    <Button
                      size="small"
                      onClick={fetchActivities}
                      disabled={activitiesLoading}
                      startIcon={activitiesLoading ? <CircularProgress size={16} /> : <AccessTimeIcon />}
                    >
                      {activitiesLoading ? 'Loading...' : 'Refresh'}
                    </Button>
                  </Box>

                  {activitiesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : activities.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Activity</strong></TableCell>
                            <TableCell><strong>Date</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activities.map((activity, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body2">
                                  {activity.description || activity.type || 'Activity'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(activity.timestamp || activity.createdAt || new Date()).toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No activities found. Your activities will appear here as you use the platform.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid> */}

            {/* Game Progress Card - Always show */}
            <Grid item xs={12}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                      Game Progress
                    </Typography>
                  </Box>
                  {gameLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : gameProgress ? (
                    <Box>
                      {(() => {
                        // Level-wise structure with Accordion
                        const hasAnyProgress = [1, 2, 3].some(levelNum => {
                          const levelArray = gameProgress[`level${levelNum}`] || [];
                          return levelArray.length > 0;
                        });

                        if (!hasAnyProgress) {
                          return <Alert severity="info">No game progress found.</Alert>;
                        }

                        return [1, 2, 3].map(levelNum => {
                          const levelArray = gameProgress[`level${levelNum}`] || [];
                          const levelStats = gameProgress[`level${levelNum}Stats`] || {};
                          
                          // Calculate level totals
                          const levelTotalScore = levelStats.totalScore || 0;
                          const levelMaxScore = levelStats.maxScore || 0;
                          const levelCorrectAnswers = levelStats.correctAnswers || 0;
                          const levelTotalQuestions = levelStats.totalQuestions || 0;
                          const levelPercentage = levelMaxScore > 0 ? Math.round((levelTotalScore / levelMaxScore) * 100) : 0;
                          
                          return (
                            <Accordion 
                              key={levelNum} 
                              defaultExpanded={levelNum === 1}
                              sx={{ 
                                mb: 2,
                                '&:before': {
                                  display: 'none',
                                },
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                borderRadius: '8px !important',
                                overflow: 'hidden',
                              }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#063C5E' }} />}
                                sx={{
                                  backgroundColor: '#F5F8FB',
                                  borderBottom: '2px solid #0B7897',
                                  '&:hover': {
                                    backgroundColor: '#E8F4F8',
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', flexGrow: 1 }}>
                                    Level {levelNum}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Score
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E' }}>
                                        {levelTotalScore} / {levelMaxScore}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Correct
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                        {levelCorrectAnswers} / {levelTotalQuestions}
                                      </Typography>
                                    </Box>
                                    <Chip 
                                      label={`${levelPercentage}%`}
                                      size="small"
                                      color={levelPercentage >= 80 ? 'success' : levelPercentage >= 50 ? 'warning' : 'error'}
                                      sx={{ fontWeight: 700 }}
                                    />
                                  </Box>
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails sx={{ p: 0 }}>
                                {levelArray.length === 0 ? (
                                  <Box sx={{ p: 3 }}>
                                    <Alert severity="info">
                                      No cards played in Level {levelNum} yet.
                                    </Alert>
                                  </Box>
                                ) : (
                                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 0 }}>
                                    <Table>
                                      <TableHead>
                                        <TableRow sx={{ backgroundColor: '#F5F8FB' }}>
                                          <TableCell><strong>Title</strong></TableCell>
                                          <TableCell><strong>Score</strong></TableCell>
                                          <TableCell><strong>Correct Answers</strong></TableCell>
                                          <TableCell><strong>Percentage</strong></TableCell>
                                          <TableCell><strong>Completed Time</strong></TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {levelArray.map((card, cardIndex) => {
                                          const cardTitle = card.cardTitle || card.cardId?.title || 'Unknown Card';
                                          const cardScore = card.cardTotalScore || 0;
                                          const cardMaxScore = card.cardMaxScore || 0;
                                          const cardCorrect = card.cardCorrectAnswers || 0;
                                          const cardTotal = card.cardTotalQuestions || 0;
                                          const cardPercentage = card.cardPercentageScore || 0;
                                          const completedAt = levelStats.completedAt || card.completedAt;
                                          
                                          return (
                                            <TableRow 
                                              key={cardIndex}
                                              sx={{
                                                '&:hover': {
                                                  backgroundColor: '#FAFAFA',
                                                }
                                              }}
                                            >
                                              <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E' }}>
                                                  {cardTitle}
                                                </Typography>
                                              </TableCell>
                                              <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                  {cardScore} / {cardMaxScore}
                                                </Typography>
                                              </TableCell>
                                              <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500, color: cardCorrect > 0 ? 'success.main' : 'text.primary' }}>
                                                  {cardCorrect} / {cardTotal}
                                                </Typography>
                                              </TableCell>
                                              <TableCell>
                                                <Chip 
                                                  label={`${cardPercentage}%`}
                                                  size="small"
                                                  color={cardPercentage >= 80 ? 'success' : cardPercentage >= 50 ? 'warning' : 'error'}
                                                  sx={{ fontWeight: 600 }}
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                  {completedAt
                                                    ? new Date(completedAt).toLocaleString() 
                                                    : 'N/A'}
                                                </Typography>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          );
                        });
                      })()}
                    </Box>
                  ) : (
                    <Alert severity="info">
                      No game progress found. Start playing games to see your progress here.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Member Info Card - Hidden */}
            {/* <Grid item xs={12}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                      Your Information
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {user.name || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {user.role === 'b2b_member' ? 'Business Member' : 'Education Member'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Account Status
                        </Typography>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ 
                            mt: 0.5, 
                            ml: 1,
                            ...(user.isActive && {
                              color: 'white',
                              '& .MuiChip-label': {
                                color: 'white',
                              },
                            }),
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid> */}
          </Grid>
          )}

          {selectedTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={getProfilePhotoUrl(user.profilePhoto) || undefined}
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
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleOpenProfileEdit}
                        sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
                      >
                        Edit
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Account Status
                        </Typography>
                        <Chip
                          label={user.isActive ? 'Active' : 'Disabled'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ 
                            mt: 0.5, 
                            ml: 2,
                            ...(user.isActive && {
                              color: 'white',
                              '& .MuiChip-label': {
                                color: 'white',
                              },
                            }),
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body2">
                          {user.role === 'b2b_member' ? 'Business Member' : 'Education Member'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Password
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {user.password || '••••••••'}
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

      {/* Profile Edit Dialog */}
      <Dialog open={profileEditOpen} onClose={() => setProfileEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={profilePhotoPreview || getProfilePhotoUrl(dashboardData?.user?.profilePhoto) || undefined}
                sx={{ width: 72, height: 72, bgcolor: '#0B7897' }}
              >
                {dashboardData?.user?.name?.charAt(0)?.toUpperCase() || dashboardData?.user?.email?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" component="label">
                  Upload Photo
                  <input type="file" hidden accept="image/*" onChange={handleProfilePhotoChange} />
                </Button>
                {(profilePhotoPreview || dashboardData?.user?.profilePhoto) && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleDeleteProfilePhoto}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? 'Removing...' : 'Remove'}
                  </Button>
                )}
              </Stack>
            </Box>

            <TextField
              fullWidth
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileEditOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={profileSubmitting}
            startIcon={profileSubmitting ? <CircularProgress size={16} /> : null}
            sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
          >
            {profileSubmitting ? 'Saving...' : 'Save'}
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

