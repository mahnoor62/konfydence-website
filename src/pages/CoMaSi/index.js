'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  Stack,
  Paper,
  Dialog,
  IconButton,
  Autocomplete,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'aos/dist/aos.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import axios from 'axios';
import { Country, State, City } from 'country-state-city';
import CloseIcon from '@mui/icons-material/Close';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;

export default function CoMaSyPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    teamSize: '',
    message: '',
    address: '',
    country: '',
    state: '',
    city: '',
    phone: '',
    department: '',
    position: '',
    website: '',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    address: '',
    country: '',
    state: '',
    city: '',
    phone: '',
    department: '',
    position: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mounted, setMounted] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Address fields state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountryData, setSelectedCountryData] = useState(null);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    setMounted(true);
    // AOS is already initialized globally via AOSProvider
    // Just refresh it when component mounts to detect new elements
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        import('aos').then((AOS) => {
          // Refresh AOS to detect all elements on the page
          AOS.default.refresh();
        });
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch countries on component mount using npm package
  useEffect(() => {
    setLoadingCountries(true);
    try {
      // Using country-state-city package
      const allCountries = Country.getAllCountries();
      const transformedCountries = allCountries
        .map(country => ({
          name: country.name,
          alpha2Code: country.isoCode,
          callingCodes: [country.phonecode] || [],
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setCountries(transformedCountries);
    } catch (error) {
      console.error('Error loading countries:', error);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  // Fetch states when country is selected using npm package
  useEffect(() => {
    if (!formData.country) {
      setStates([]);
      setCities([]);
      setFormData((prev) => ({ ...prev, state: '', city: '' }));
      setSelectedCountryData(null);
      return;
    }

    setLoadingStates(true);
    try {
      const countryCode = countries.find(c => c.name === formData.country)?.alpha2Code;
      if (countryCode) {
        // Find selected country data for phone code
        const countryData = countries.find(c => c.name === formData.country);
        setSelectedCountryData(countryData || null);

        // Using country-state-city package
        const countryStates = State.getStatesOfCountry(countryCode);
        const formattedStates = countryStates.map(state => ({
          name: state.name,
          isoCode: state.isoCode,
          countryCode: state.countryCode,
        }));
        setStates(formattedStates);
      } else {
        setStates([]);
        setSelectedCountryData(null);
      }
    } catch (error) {
      console.error('Error loading states:', error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  }, [formData.country, countries]);

  // Fetch cities when state is selected using npm package
  useEffect(() => {
    if (!formData.state || !formData.country) {
      setCities([]);
      setFormData((prev) => ({ ...prev, city: '' }));
      return;
    }

    setLoadingCities(true);
    try {
      const countryCode = countries.find(c => c.name === formData.country)?.alpha2Code;
      const selectedState = states.find(s => s.name === formData.state);
      const stateCode = selectedState?.isoCode;
      
      if (countryCode && stateCode) {
        // Using country-state-city package
        const stateCities = City.getCitiesOfState(countryCode, stateCode);
        const formattedCities = stateCities.map(city => ({
          name: city.name,
          countryCode: city.countryCode,
          stateCode: city.stateCode,
        }));
        setCities(formattedCities);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  }, [formData.state, formData.country, countries, states]);

  const validateEmail = (email) => {
    const emailRegex = /.+@.+\..+/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Clear dependent fields when country or state changes
      if (name === 'country') {
        updated.state = '';
        updated.city = '';
      } else if (name === 'state') {
        updated.city = '';
      }
      
      return updated;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      address: '',
      country: '',
      state: '',
      city: '',
      phone: '',
      department: '',
      position: '',
    };
    let isValid = true;

    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Address fields validation - DISABLED (fields are hidden)
    // if (!formData.address.trim()) {
    //   newErrors.address = 'Address is required';
    //   isValid = false;
    // }

    // if (!formData.country.trim()) {
    //   newErrors.country = 'Country is required';
    //   isValid = false;
    // }

    // if (!formData.state.trim()) {
    //   newErrors.state = 'State is required';
    //   isValid = false;
    // }

    // if (!formData.city.trim()) {
    //   newErrors.city = 'City is required';
    //   isValid = false;
    // }

    // if (!formData.phone.trim()) {
    //   newErrors.phone = 'Phone number is required';
    //   isValid = false;
    // }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
      isValid = false;
    }

    // Position field validation - DISABLED (field is hidden)
    // if (!formData.position.trim()) {
    //   newErrors.position = 'Position is required';
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please fill in all required fields correctly.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/contact`;
      
      // Include country code in phone number if available
      let phoneNumber = formData.phone.trim();
      if (selectedCountryData?.callingCodes?.[0] && phoneNumber && !phoneNumber.startsWith('+')) {
        phoneNumber = `+${selectedCountryData.callingCodes[0]}${phoneNumber}`;
      }
      
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        organization: formData.company.trim(),
        company: formData.company.trim(),
        topic: 'CoMaSi',
        teamSize: formData.teamSize.trim() || '',
        message: formData.message.trim() || '',
        formSource: 'b2b_form', // Set formSource for CoMaSi page
        // Address fields
        address: formData.address.trim(),
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        phone: phoneNumber,
        department: formData.department.trim(),
        position: formData.position.trim(),
        website: formData.website.trim() || '',
      };
      await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setSnackbar({ open: true, message: 'Thank you! We will contact you soon.', severity: 'success' });
      setFormData({ 
        firstName: '', 
        lastName: '', 
        company: '', 
        email: '', 
        teamSize: '', 
        message: '',
        address: '',
        country: '',
        state: '',
        city: '',
        phone: '',
        department: '',
        position: '',
        website: '',
      });
      setErrors({ 
        firstName: '', 
        lastName: '', 
        company: '', 
        email: '',
        address: '',
        country: '',
        state: '',
        city: '',
        phone: '',
        department: '',
        position: '',
      });
      setStates([]);
      setCities([]);
      setSelectedCountryData(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbar({ open: true, message: 'Error submitting form. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Konfydence Scenario Lab</title>
      </Head>
      <Header />
      <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
            color: 'white',
            pt: { xs: 12, md: 16 },
            pb: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg" data-aos="zoom-in" data-aos-duration="800">
            <Grid container spacing={6} alignItems="center" sx={{py:{xs:5,md:10}}}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    lineHeight: 1.2,
                    color: 'white',
                  }}
                >
                  From family tables to corporate firewalls
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    opacity: 0.95,
                    color: 'white',
                  }}
                >
                  We train calm decisions under pressure than scale that habit into your security culture and NIS2 compliance.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    // fontSize: { xs: '1rem', md: '1.125rem' },
                    mb: 4,
                    opacity: 0.9,
                    ml:2,
                    lineHeight: 1.8,
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  <Typography component="span" sx={{ fontWeight: 700, color: 'white' }}>•</Typography> NIS2 ready behavioral training{' '} <br />
                  <Typography component="span" sx={{ fontWeight: 700, color: 'white' }}>•</Typography> No blame social simulations{' '} <br />
                  <Typography component="span" sx={{ fontWeight: 700, color: 'white' }}>•</Typography> Measurable habit change across the human layer
                </Typography>
                <Button
                  component="a"
                  href="#demo-form"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: '#063C5E',
                    px: { xs: 4, md: 6 },
                    py: { xs: 1.5, md: 2 },
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                      transform: 'translateX(5px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Request a Free Demo →
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                {/* White Box Container - No Border Radius */}
                <Box
                  sx={{
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: { xs: 'auto', md: 400 },
                    p: 3,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    position: 'relative',
                    filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                  }}
                >
                  {/* Image Container with Border Radius */}
                  <Box
                    sx={{
                      width:'100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      // maxWidth: '90%',
                      maxHeight: '100%',
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/hurry.jpeg"
                      alt="H.A.C.K. - Intelligence isn't your defense. Habits are."
                      sx={{
                        width: '100%',
                        height: '100%',
              
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Why Most Training Fails Section */}
        <Box
  sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#ffffff" }}
  data-aos="zoom-in"
  data-aos-duration="800"
>
  <Container maxWidth="lg">
    <Typography
      variant="h3"
      sx={{
        fontWeight: 600,
        mb: 4,
        textAlign: "center",
        color: "#0B7897",
        letterSpacing: 1,
      }}
    >
      Why Yearly Videos and Quizzes Don&apos;t Stop Breaches
    </Typography>

    <Grid container spacing={6} sx={{ alignItems: "stretch" }}>
      {/* ================= LEFT COLUMN ================= */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "#063C5E",
            textAlign: "center",
          }}
        >
          Why Reflexes Beat Awarness.
        </Typography>

        {/* LEFT CONTENT FRAME (height reference) */}
        <Box
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            border: "2px solid #063C5E",
            borderRadius: 2,
            p: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="body2"
            sx={{ mb: 1, lineHeight: 1.6, color: "#000" }}
          >
            Employees pass the test—then click anyway months later.
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, color: "#000" }}>
            Scammers train urgency.
            <br />
            We train the pause.
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, color: "#000" }}>
            Traditional training assumes calm.
            <br />
            Breaches happen under stress.
          </Typography>

          {/* LEFT IMAGE */}
          <Box
            sx={{
              flex: "0 1 auto",
              minHeight: 0,
              maxHeight: { xs: 300, md: 400 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              mb: 2,
              "&:hover img": { opacity: 0.9 },
            }}
            onClick={() => {
              setSelectedImage("/images/breches.jpeg");
              setImageModalOpen(true);
            }}
          >
            <Box
              component="img"
              src="/images/breches.jpeg"
              alt="Breaches illustration"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: { xs: 300, md: 400 },
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{ color: "#000" }}
          >
            The Konfydence Paradox: Scammers want you to act fast and bypass
            logic. Konfydence trains you to &quot;act faster&quot; by pausing
            first.
          </Typography>
        </Box>
      </Grid>

      {/* ================= RIGHT COLUMN ================= */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: "#063C5E",
            textAlign: "center",
            // fontSize: { xs: "0.85rem", md: "0.95rem" },
            lineHeight: 1.2,
          }}
        >
          Train to &quot;act faster&quot; by pausing first – The 5 Seconds Pause
        </Typography>

        {/* RIGHT HEIGHT MATCHER (NO BORDER) */}
        <Box
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {/* INNER CONTENT FITS LEFT HEIGHT */}
          <Box
            sx={{
              width: "100%",
              flex: "0 1 auto",
              height:'100%',
              // minHeight: 0,
              // maxHeight: { xs: 300, md: 400 },
              // display: "flex",
              // alignItems: "center",
              // justifyContent: "center",
              cursor: "pointer",
              backgroundColor: "transparent",
              overflow: "hidden",
              "&:hover img": { opacity: 0.9 },
            }}
            onClick={() => {
              setSelectedImage("/images/comasi.png");
              setImageModalOpen(true);
            }}
          >
            <Box
              component="img"
              src="/images/comasi.png"
              alt="5 Second Defense"
              sx={{
                width: "100%",
                height: "100%",
                // maxHeight: { xs: 300, md: 400 },
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Container>
</Box>

        {/* Key Benefits Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#F6F8FA' }} data-aos="zoom-in" data-aos-duration="800">
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              sx={{
                // fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                mb: 6,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
             The Behavioral System Behind Compliance
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 200, md: 250 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#F6F8FA',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/beh1.jpeg"
                      alt="Engaging Simulations"
                      onClick={() => {
                        setSelectedImage('/images/beh1.jpeg');
                        setImageModalOpen(true);
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, opacity 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          opacity: 0.9,
                        },
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: '#063C5E',
                      }}
                    >
                      Engaging Simulations
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.7,
                      }}
                    >
                     From physical cards to digital scenarios teams practice the exact moments scammers rely on. 
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 200, md: 250 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#F6F8FA',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/beh2.jpeg"
                      alt="Proven Behavior Change"
                      onClick={() => {
                        setSelectedImage('/images/beh2.jpeg');
                        setImageModalOpen(true);
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, opacity 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          opacity: 0.9,
                        },
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: '#063C5E',
                      }}
                    >
                      Proven Behavior Change
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.7,
                      }}
                    >
                     We don't police people. we train the nervous system to stay calm under pressure.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 200, md: 250 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#F6F8FA',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/beh3.jpeg"
                      alt="Auditor-Ready Reports"
                      onClick={() => {
                        setSelectedImage('/images/beh3.jpeg');
                        setImageModalOpen(true);
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, opacity 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          opacity: 0.9,
                        },
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: '#063C5E',
                      }}
                    >
                      Auditor-Ready Reports
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.7,
                      }}
                    >
                   Dashboards focuses on real habit adoption less so on test scores. Behavior becomes your evidence.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Social Proof Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#ffffff' }}>
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                mb: 6,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
              Real Results from Forward-Thinking Teams
            </Typography>
            
            {/* Testimonial Carousel */}
            <Box sx={{ mb: 6 }}>
              <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={30}
                slidesPerView={1}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                navigation
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                  },
                  768: {
                    slidesPerView: 1,
                  },
                }}
              >
                <SwiperSlide>
                  <Card
                    sx={{
                      height: '100%',
                      p: 4,
                      backgroundColor: '#E9F4FF',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Box
                          key={star}
                          component="span"
                          sx={{
                            color: '#FFB800',
                            fontSize: '1.5rem',
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontStyle: 'italic',
                        textAlign: 'center',
                        mb: 3,
                        color: '#063C5E',
                        lineHeight: 1.7,
                      }}
                    >
                      &ldquo;Konfydence significantly raised scam-awareness across our staff—engagement like we&apos;ve never seen.&rdquo;
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#063C5E',
                      }}
                    >
                      — Compliance Officer, Financial Services
                    </Typography>
                  </Card>
                </SwiperSlide>
                <SwiperSlide>
                  <Card
                    sx={{
                      height: '100%',
                      p: 4,
                      backgroundColor: '#E9F4FF',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Box
                          key={star}
                          component="span"
                          sx={{
                            color: '#FFB800',
                            fontSize: '1.5rem',
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontStyle: 'italic',
                        textAlign: 'center',
                        mb: 3,
                        color: '#063C5E',
                        lineHeight: 1.7,
                      }}
                    >
                      &ldquo;Our team&apos;s pause reflexes improved dramatically. The simulations made compliance training actually engaging.&rdquo;
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#063C5E',
                      }}
                    >
                      — IT Security Manager, Technology Firm
                    </Typography>
                  </Card>
                </SwiperSlide>
                <SwiperSlide>
                  <Card
                    sx={{
                      height: '100%',
                      p: 4,
                      backgroundColor: '#E9F4FF',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Box
                          key={star}
                          component="span"
                          sx={{
                            color: '#FFB800',
                            fontSize: '1.5rem',
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontStyle: 'italic',
                        textAlign: 'center',
                        mb: 3,
                        color: '#063C5E',
                        lineHeight: 1.7,
                      }}
                    >
                      &ldquo;The behavioral reports provided clear proof for our auditors. Real metrics that show risk reduction, not just completion rates.&rdquo;
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#063C5E',
                      }}
                    >
                      — Chief Compliance Officer, Healthcare Organization
                    </Typography>
                  </Card>
                </SwiperSlide>
              </Swiper>
            </Box>

            {/* Platform Dashboard Teaser and Behavioral Report */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper
                    data-aos="fade-right"
                  data-aos-duration="800"
                  sx={{
                    p: 3,
                    height: '100%',
                    backgroundColor: '#F6F8FA',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: '#063C5E',
                      textAlign: 'center',
                    }}
                  >
                    Platform Dashboard Teaser
                  </Typography>
                  <Box
                    component="img"
                    src="/images/dashboard.png"
                    alt="Platform Dashboard Preview"
                    onClick={() => {
                      setSelectedImage('/images/dashboard.png');
                      setImageModalOpen(true);
                    }}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      flex: 1,
                      minHeight: { xs: 250, md: 300 },
                      borderRadius: 2,
                      mb: 2,
                      objectFit: 'contain',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, opacity 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        opacity: 0.9,
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}
                  >
                    See reduction in rushed clicks and behavior change metrics
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                    data-aos="fade-left"
                  data-aos-duration="800"
                  sx={{
                    p: 3,
                    height: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '2px solid #0B7897',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#063C5E',
                      textAlign: 'center',
                    }}
                  >
                    Konfydence Behavioral Report
                  </Typography>
                  <Box
                    component="img"
                    src="/images/dashboard2.png"
                    alt="Konfydence Behavioral Report Dashboard"
                    onClick={() => {
                      setSelectedImage('/images/dashboard2.png');
                      setImageModalOpen(true);
                    }}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      flex: 1,
                      minHeight: { xs: 250, md: 300 },
                      borderRadius: 2,
                      mb: 2,
                      objectFit: 'contain',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, opacity 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        opacity: 0.9,
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      textAlign: 'center',
                      fontStyle: 'italic',
                      fontSize: '0.85rem',
                    }}
                  >
                    Real behavioral metrics that demonstrate risk reduction
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Demo Request Form */}
        <Box
            data-aos="zoom-in"
                  data-aos-duration="800"
          id="demo-form"
          sx={{
            py: { xs: 8, md: 12 },
            backgroundColor: '#F6F8FA',
            position: 'relative',
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                mb: 2,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
              See CoMasi in Action
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', md: '1.125rem' },
                mb: 5,
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
          One short demo. No account. No commitment.
            </Typography>
            
            {/* Success/Error Message */}
            {snackbar.open && (
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Alert 
                  severity={snackbar.severity}
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  sx={{
                    maxWidth: 600,
                    width: '100%',
                    borderRadius: 2,
                    fontSize: '1rem',
                    '& .MuiAlert-message': {
                      width: '100%',
                    },
                  }}
                >
                  {snackbar.message}
                </Alert>
              </Box>
            )}
            
            <Paper
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'visible',
                '&::before': {
                  content: '"||"',
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  fontSize: '3rem',
                  color: '#0B7897',
                  opacity: 0.1,
                  fontWeight: 700,
                  pointerEvents: 'none',
                },
              }}
            >
              <Box component="form" onSubmit={handleSubmit} sx={{ overflow: 'visible' }}>
                <Grid container spacing={3} sx={{ overflow: 'visible' }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      required
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        if (errors.firstName) setErrors({ ...errors, firstName: '' });
                      }}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      required
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        if (errors.lastName) setErrors({ ...errors, lastName: '' });
                      }}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      required
                      value={formData.company}
                      onChange={(e) => {
                        setFormData({ ...formData, company: e.target.value });
                        if (errors.company) setErrors({ ...errors, company: '' });
                      }}
                      error={!!errors.company}
                      helperText={errors.company}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Team Size"
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      placeholder="e.g., 50-100 employees"
                    />
                  </Grid>
                  
                  {/* Address Information Section - HIDDEN */}
                  {/* <Grid item xs={12}>
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: '#052A42',
                          fontSize: '1.1rem',
                        }}
                      >
                        Address Information
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      error={!!errors.address}
                      helperText={errors.address}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      freeSolo
                      options={countries.map((country) => country.name)}
                      value={formData.country}
                      onChange={(event, newValue) => {
                        const country = countries.find(c => c.name === newValue);
                        setSelectedCountryData(country || null);
                        setFormData((prev) => ({
                          ...prev,
                          country: newValue || '',
                          state: '',
                          city: '',
                        }));
                        setStates([]);
                        setCities([]);
                        if (errors.country) {
                          setErrors((prev) => ({ ...prev, country: '' }));
                        }
                      }}
                      onInputChange={(event, newInputValue) => {
                        setFormData((prev) => ({ ...prev, country: newInputValue }));
                        const country = countries.find(c => c.name.toLowerCase() === newInputValue.toLowerCase());
                        setSelectedCountryData(country || null);
                        if (errors.country) {
                          setErrors((prev) => ({ ...prev, country: '' }));
                        }
                      }}
                      disabled={loadingCountries}
                      loading={loadingCountries}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Country"
                          required
                          error={!!errors.country}
                          helperText={errors.country}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      freeSolo
                      options={states.map((state) => state.name)}
                      value={formData.state}
                      onChange={(event, newValue) => {
                        setFormData((prev) => ({ ...prev, state: newValue || '', city: '' }));
                        if (errors.state) {
                          setErrors((prev) => ({ ...prev, state: '' }));
                        }
                      }}
                      onInputChange={(event, newInputValue) => {
                        setFormData((prev) => ({ ...prev, state: newInputValue }));
                        if (errors.state) {
                          setErrors((prev) => ({ ...prev, state: '' }));
                        }
                      }}
                      disabled={!formData.country || loadingStates}
                      loading={loadingStates}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="State"
                          required
                          error={!!errors.state}
                          helperText={errors.state || (loadingStates ? 'Loading states...' : '')}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      freeSolo
                      options={cities.length > 0 ? cities.map((city) => city.name) : []}
                      value={formData.city}
                      onChange={(event, newValue) => {
                        setFormData((prev) => ({ ...prev, city: newValue || '' }));
                        if (errors.city) {
                          setErrors((prev) => ({ ...prev, city: '' }));
                        }
                      }}
                      onInputChange={(event, newInputValue) => {
                        setFormData((prev) => ({ ...prev, city: newInputValue }));
                        if (errors.city) {
                          setErrors((prev) => ({ ...prev, city: '' }));
                        }
                      }}
                      disabled={!formData.state || loadingCities}
                      loading={loadingCities}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="City"
                          required
                          error={!!errors.city}
                          helperText={errors.city || (loadingCities ? 'Loading cities...' : '')}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone || (selectedCountryData?.callingCodes?.[0] ? `Country code: +${selectedCountryData.callingCodes[0]}` : 'Select a country to see phone code')}
                      InputProps={{
                        startAdornment: selectedCountryData?.callingCodes?.[0] ? (
                          <InputAdornment position="start">
                            <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              +{selectedCountryData.callingCodes[0]}
                            </Typography>
                          </InputAdornment>
                        ) : null,
                      }}
                      placeholder={selectedCountryData?.callingCodes?.[0] ? 'Enter phone number' : 'Enter phone number'}
                    />
                  </Grid> */}
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!errors.department}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        label="Department"
                        MenuProps={{
                          disablePortal: false,
                          container: typeof window !== 'undefined' ? document.body : undefined,
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                            sx: {
                              zIndex: 10000,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            },
                          },
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          disableScrollLock: true,
                        }}
                      >
                        <MenuItem value="Corp">Corp</MenuItem>
                        <MenuItem value="Security">Security</MenuItem>
                        <MenuItem value="Compliance">Compliance</MenuItem>
                        <MenuItem value="HR">HR</MenuItem>
                        <MenuItem value="IT">IT</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                      {errors.department && (
                        <FormHelperText>{errors.department}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      name="position"
                      required
                      value={formData.position}
                      onChange={handleChange}
                      error={!!errors.position}
                      helperText={errors.position}
                    />
                  </Grid> */}
                  
                  {/* Website field - HIDDEN */}
                  {/* <Grid item xs={12} sm={12}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </Grid> */}
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your compliance needs..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      startIcon={
                        <Box
                          component="span"
                          sx={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          ||
                        </Box>
                      }
                      sx={{
                        backgroundColor: '#0B7897',
                        color: 'white',
                        py: 1.5,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#063C5E',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Submit Request
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  mt: 3,
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                }}
              >
                Custom per-seat pricing discussed in demo (volume discounts, onboarding options).
              </Typography>
            </Paper>
          </Container>
        </Box>

        {/* Final Motivational Section */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
            color: 'white',
          }}
        >
          <Container maxWidth="lg"     data-aos="zoom-in"
                  data-aos-duration="800">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                mb: 3,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              Stop Training for the Quiz. Start Training for the Pause.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                mb: 5,
                textAlign: 'center',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.8,
                color: 'white',
              }}
            >
              One moment of rush costs millions. Five seconds of pause prevents it. Join teams already proving real risk reduction.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Button
                component="a"
                href="#demo-form"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: '#063C5E',
                  px: { xs: 4, md: 5 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Request Demo
              </Button>
              <Button
                component={Link}
                href="/pdfs/the-limbic-hijack.pdf"
                target="_blank"
                variant="outlined"
                size="medium"
                sx={{
                  borderColor: '#FFFFFF',
                  color: '#FFFFFF',
                  px: { xs: 3, md: 3.5 },
                  py: { xs: 1, md: 1.25 },
                  fontSize: { xs: '0.875rem', md: '0.9375rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#F5F5F5',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Explore the Science (Limbic Hijack)
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* Image Modal Dialog */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth={false}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
            maxWidth: 'fit-content',
            margin: 'auto',
            padding: '0 !important',
            overflow: 'visible',
            background: 'transparent !important',
          },
        }}
        sx={{
          '& .MuiDialog-container': {
            backgroundColor: 'transparent',
          },
          '& .MuiDialog-paper': {
            backgroundColor: 'transparent !important',
            backgroundImage: 'none !important',
            boxShadow: 'none !important',
            padding: '0 !important',
            margin: 0,
          },
          '& .MuiDialog-paperScrollPaper': {
            backgroundColor: 'transparent !important',
            backgroundImage: 'none !important',
          },
          '& .MuiPaper-root': {
            backgroundColor: 'transparent !important',
            backgroundImage: 'none !important',
          },
          '& .MuiPaper-elevation': {
            backgroundColor: 'transparent !important',
            backgroundImage: 'none !important',
            boxShadow: 'none !important',
          },
          '& .MuiDialog-paperScrollBody': {
            backgroundColor: 'transparent !important',
          },
        }}
      >
        <Box 
          sx={{ 
            position: 'relative', 
            display: 'inline-block',
          }}
        >
          <IconButton
            onClick={() => setImageModalOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#063C5E',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Dashboard preview"
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                display: 'block',
              }}
            />
          )}
        </Box>
      </Dialog>

      <Footer />
    </>
  );
}
