import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
console.log('🔗 Contact Page API URL:', API_URL);

const EMAIL_REGEX = /^.+@.+\..+$/;

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    topic: 'other',
    message: '',
    honeypot: '', // Spam protection
    notRobot: false, // Spam protection
    // Address fields for demo options
    address: '',
    country: '',
    state: '',
    city: '',
    phone: '',
    department: '',
    position: '',
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Countries, states, cities data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountryData, setSelectedCountryData] = useState(null);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        // Using REST Countries API - free and CORS enabled
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,idd,flags');
        // Transform data to match our format
        const transformedCountries = response.data
          .map(country => ({
            name: country.name.common,
            alpha2Code: country.cca2,
            alpha3Code: country.cca3,
            callingCodes: country.idd?.root ? [country.idd.root + (country.idd.suffixes?.[0] || '')] : [],
            flag: country.flags?.svg || country.flags?.png,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(transformedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        // Fallback: Use a static list of major countries if API fails
        const fallbackCountries = [
          { name: 'United States', alpha2Code: 'US', alpha3Code: 'USA', callingCodes: ['1'] },
          { name: 'United Kingdom', alpha2Code: 'GB', alpha3Code: 'GBR', callingCodes: ['44'] },
          { name: 'Canada', alpha2Code: 'CA', alpha3Code: 'CAN', callingCodes: ['1'] },
          { name: 'Australia', alpha2Code: 'AU', alpha3Code: 'AUS', callingCodes: ['61'] },
          { name: 'Germany', alpha2Code: 'DE', alpha3Code: 'DEU', callingCodes: ['49'] },
          { name: 'France', alpha2Code: 'FR', alpha3Code: 'FRA', callingCodes: ['33'] },
          { name: 'India', alpha2Code: 'IN', alpha3Code: 'IND', callingCodes: ['91'] },
          { name: 'China', alpha2Code: 'CN', alpha3Code: 'CHN', callingCodes: ['86'] },
          { name: 'Japan', alpha2Code: 'JP', alpha3Code: 'JPN', callingCodes: ['81'] },
          { name: 'Brazil', alpha2Code: 'BR', alpha3Code: 'BRA', callingCodes: ['55'] },
        ].sort((a, b) => a.name.localeCompare(b.name));
        setCountries(fallbackCountries);
        setSnackbar({
          open: true,
          message: 'Using limited country list. Please check your internet connection.',
          severity: 'warning',
        });
      } finally {
        setLoadingCountries(false);
      }
    };
    
    fetchCountries();
  }, []);

  // Fetch states when country is selected
  useEffect(() => {
    const fetchStates = async () => {
      if (!formData.country) {
        setStates([]);
        setCities([]);
        setFormData((prev) => ({ ...prev, state: '', city: '' }));
        return;
      }

      setLoadingStates(true);
      try {
        // Use GitHub-based JSON file for states (CORS-friendly)
        const countryCode = countries.find(c => c.name === formData.country)?.alpha2Code;
        if (countryCode) {
          const response = await axios.get(
            `https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/states.json`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          );
          const countryStates = response.data
            .filter(state => state.country_code === countryCode)
            .sort((a, b) => a.name.localeCompare(b.name));
          setStates(countryStates);
          
          // If no states found, allow manual entry
          if (countryStates.length === 0) {
            console.log(`No states found for country: ${formData.country}`);
          }
        } else {
          setStates([]);
        }
      } catch (error) {
        console.error('Error fetching states:', error);
        // On error, allow manual entry by keeping states empty
        setStates([]);
      } finally {
        setLoadingStates(false);
      }
    };

    if (countries.length > 0) {
      fetchStates();
    }
  }, [formData.country, countries]);

  // Fetch cities when state is selected
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state || !formData.country) {
        setCities([]);
        setFormData((prev) => ({ ...prev, city: '' }));
        return;
      }

      setLoadingCities(true);
      try {
        const countryCode = countries.find(c => c.name === formData.country)?.alpha2Code;
        const selectedState = states.find(s => s.name === formData.state);
        const stateCode = selectedState?.state_code || selectedState?.iso2;
        
        console.log('Fetching cities for:', { country: formData.country, countryCode, state: formData.state, stateCode, selectedState });
        
        if (countryCode && stateCode) {
          let stateCities = [];
          
          // Try using a different approach - use a smaller, filtered API
          // Option 1: Try using a different GitHub repo with smaller files
          try {
            // Use a more reliable endpoint - fetch from a CDN that supports large files
            const response = await axios.get(
              `https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/cities.json`,
              {
                headers: {
                  'Accept': 'application/json',
                },
                timeout: 60000, // 60 seconds for large file
                maxContentLength: 100 * 1024 * 1024, // 100MB max
                maxBodyLength: 100 * 1024 * 1024,
              }
            );
            
            if (response.data && Array.isArray(response.data)) {
              // Filter cities by country and state
              stateCities = response.data
                .filter(city => {
                  const matchesCountry = city.country_code === countryCode;
                  const matchesState = city.state_code === stateCode || 
                                     city.state_code === selectedState?.iso2 ||
                                     (selectedState?.id && city.state_id === selectedState.id);
                  return matchesCountry && matchesState;
                })
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
              
              console.log(`Found ${stateCities.length} cities for ${formData.state}, ${formData.country}`);
            }
          } catch (apiError) {
            console.log('Failed to fetch cities from API:', apiError.message);
            console.log('Cities will be empty - user can type manually');
            stateCities = [];
          }
          
          // Transform cities to consistent format
          const formattedCities = stateCities.map(city => ({
            id: city.id || city.name,
            name: city.name,
            country_code: city.country_code,
            state_code: city.state_code,
          }));
          
          console.log(`Total cities found: ${formattedCities.length} for ${formData.state}, ${formData.country}`);
          setCities(formattedCities);
          
          // If no cities found, allow manual entry
          if (formattedCities.length === 0) {
            console.log(`No cities found for state: ${formData.state}, country: ${formData.country} - user can type manually`);
          }
        } else {
          console.log('Missing countryCode or stateCode:', { countryCode, stateCode });
          setCities([]);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        // On error, allow manual entry by keeping cities empty
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    if (formData.state && formData.country && countries.length > 0) {
      fetchCities();
    }
  }, [formData.state, formData.country, countries, states]);

  useEffect(() => {
    if (router.isReady) {
      const topic = router.query.topic;
      if (topic) {
        // Map old topic values to new ones
        const topicMap = {
          'b2b_demo': 'CoMaSi',
          'b2e_demo': 'education-youth-pack',
          'b2e': 'education-youth-pack',
        };
        const mappedTopic = topicMap[topic] || topic;
        setFormData((prev) => ({ ...prev, topic: mappedTopic }));
      }
    }
  }, [router.isReady, router.query]);

  // Check if current topic requires address fields
  const requiresAddressFields = ['demo-families', 'demo-schools', 'demo-businesses'].includes(formData.topic);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        }
        return '';
      case 'lastName':
        if (!value.trim()) {
          return 'Last name is required';
        }
        return '';
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        if (!EMAIL_REGEX.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'message':
        if (!value.trim()) {
          return 'Message is required';
        }
        return '';
      case 'address':
        if (requiresAddressFields && !value.trim()) {
          return 'Address is required';
        }
        return '';
      case 'country':
        if (requiresAddressFields && !value.trim()) {
          return 'Country is required';
        }
        return '';
      case 'state':
        if (requiresAddressFields && !value.trim()) {
          return 'State is required';
        }
        return '';
      case 'city':
        if (requiresAddressFields && !value.trim()) {
          return 'City is required';
        }
        return '';
      case 'phone':
        if (requiresAddressFields && !value.trim()) {
          return 'Phone number is required';
        }
        return '';
      case 'department':
        if (requiresAddressFields && !value.trim()) {
          return 'Department is required';
        }
        return '';
      case 'position':
        if (requiresAddressFields && !value.trim()) {
          return 'Position is required';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // If topic is changing, check if we need to clear address fields
    if (name === 'topic') {
      const isDemoTopic = ['demo-families', 'demo-schools', 'demo-businesses'].includes(fieldValue);
      const wasDemoTopic = ['demo-families', 'demo-schools', 'demo-businesses'].includes(formData.topic);
      
      // If switching away from demo topic, clear address fields
      if (wasDemoTopic && !isDemoTopic) {
        setFormData((prev) => ({
          ...prev,
          [name]: fieldValue,
          address: '',
          country: '',
          state: '',
          city: '',
          phone: '',
          department: '',
          position: '',
          website: '',
        }));
        setSelectedCountryData(null);
        setStates([]);
        setCities([]);
        // Clear address field errors
        setErrors((prev) => {
          const newErrors = { ...prev };
          ['address', 'country', 'state', 'city', 'phone', 'department', 'position'].forEach(field => {
            delete newErrors[field];
          });
          return newErrors;
        });
        return;
      }
    }
    
    // Handle country selection
    if (name === 'country') {
      const country = countries.find(c => c.name === fieldValue);
      setSelectedCountryData(country || null);
      setFormData((prev) => ({
        ...prev,
        [name]: fieldValue,
        state: '',
        city: '',
        // Don't auto-populate phone, let user type their number
        // The country code will be shown as a prefix in the UI
      }));
      setStates([]);
      setCities([]);
    }
    // Handle state selection - clear city
    else if (name === 'state') {
      setFormData((prev) => ({
        ...prev,
        [name]: fieldValue,
        city: '',
      }));
      setCities([]);
    }
    else {
      setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Spam protection: Check honeypot and robot checkbox
    if (formData.honeypot) {
      // Bot detected - silently fail
      return;
    }
    
    if (!formData.notRobot) {
      setSnackbar({
        open: true,
        message: 'Please confirm you are not a robot',
        severity: 'error',
      });
      return;
    }

    // Validate all required fields
    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'message'];
    
    // Add address fields if demo topic is selected
    if (requiresAddressFields) {
      requiredFields.push('address', 'country', 'state', 'city', 'phone', 'department', 'position');
    }
    
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Prepare payload based on topic
      let payload;
      payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        topic: formData.topic,
        message: formData.message,
        formSource: 'contact_form', // Always set formSource for contact page
      };
      if (formData.organization) {
        payload.organization = formData.organization;
        payload.company = formData.organization; // Keep for backward compatibility
      }
      
      // Add address fields if demo topic is selected
      if (requiresAddressFields) {
        payload.address = formData.address;
        payload.country = formData.country;
        payload.state = formData.state;
        payload.city = formData.city;
        // Include country code in phone number if available
        let phoneNumber = formData.phone.trim();
        if (selectedCountryData?.callingCodes?.[0] && phoneNumber) {
          // Remove any existing + from the phone number
          phoneNumber = phoneNumber.replace(/^\+/, ''); // Remove leading +
          const countryCode = selectedCountryData.callingCodes[0];
          // Remove country code if it's already at the start
          if (phoneNumber.startsWith(countryCode)) {
            phoneNumber = phoneNumber.substring(countryCode.length);
          }
          // Add country code with single + (only if phoneNumber is not empty after cleaning)
          if (phoneNumber) {
            phoneNumber = `${countryCode}${phoneNumber}`;
          } else {
            phoneNumber = `${countryCode}`;
          }
        } else if (phoneNumber) {
          // If no country code but phone has value, remove any existing + and add single +
          phoneNumber = phoneNumber.replace(/^\+/, ''); // Remove leading + if exists
          if (phoneNumber) {
            phoneNumber = `${phoneNumber}`;
          }
        }
        payload.phone = phoneNumber;
        payload.department = formData.department;
        payload.position = formData.position;
        payload.website = formData.website || '';
      }

      const url = `${API_URL}/contact`;
      console.log(`📡 POST ${url}`, payload);
      console.log('📤 Sending topic value:', formData.topic);
      await axios.post(url, payload, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        params: { _t: Date.now() },
      });

      setSubmitted(true);
    } catch (error) {
      console.error('❌ Error submitting contact form:', {
        url: `${API_URL}/contact`,
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
      
      // Get the actual error message from API response
      let errorMessage = 'Error submitting form. Please try again.';
      
      if (error.response?.data) {
        // Check for validation errors array
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const validationErrors = error.response.data.errors
            .map(err => err.msg || err.message || err)
            .join(', ');
          errorMessage = validationErrors || errorMessage;
        }
        // Check for single error message
        else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        // Check for message field
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Konfydence Contact</title>
      </Head>
      <Header />
      <Box
        component="main"
        sx={{
          backgroundColor: '#F2F6FB',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pb: { xs: 8, md: 10 },
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0B7897 0%, #063C5E 100%)',
            color: 'white',
            py: { xs: 10, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 20% -10%, rgba(255,255,255,0.25), transparent 55%)',
              opacity: 0.45,
            }}
          />
          <Container maxWidth="md">
            <Box
              sx={{
                textAlign: 'center',
                maxWidth: 700,
                mx: 'auto',
                px: { xs: 2, md: 10 },
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  mt: 10,
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.4rem', md: '3.2rem' },
                }}
              >
                Get in Touch
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  fontWeight: 500,
                  mb: 2,
                }}
              >
                Have questions about HACKs, training, or partnerships?
              </Typography>
              {/* <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: { xs: '1.05rem', md: '1.15rem' },
                  lineHeight: 1.6,
                }}
              >
                We usually respond within one business day.
              </Typography> */}
            </Box>
          </Container>
        </Box>

        <Container
          data-aos="zoom-in"
          data-aos-duration="800"
          data-aos-delay="100"
          maxWidth="sm"
          sx={{
            mt: { xs: -8, md: -6 },
            px: { xs: 3, md: 0 },
          }}
        >
          <Box
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: 4,
              backgroundColor: 'white',
              boxShadow: '0 25px 80px rgba(6,60,94,0.12)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {snackbar.open && (
              <Alert 
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                sx={{ mb: 3 }}
              >
                {snackbar.message}
              </Alert>
            )}
            {submitted ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: '#052A42',
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                  }}
                >
                  Thank you for requesting a demo.
                </Typography>
                {/* <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}
                >
                  We&apos;ll get back to you within 24 hours.
                </Typography> */}
              </Box>
            ) : (
              <>

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Organization / School / Company"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Topic"
                        name="topic"
                        required
                        value={formData.topic}
                        onChange={handleChange}
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              sx: {
                                maxHeight: 224,
                                width: 'auto',
                                '& .MuiMenuItem-root': {
                                  fontFamily: '"Poppins", sans-serif !important',
                                },
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
                            disablePortal: false,
                            keepMounted: false,
                          },
                        }}
                        sx={{
                          '& .MuiSelect-select': {
                            fontFamily: '"Poppins", sans-serif',
                          },
                        }}
                      >
                        <MenuItem 
                          value="scam-survival-kit"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Scam Survival Kit (Families)
                        </MenuItem>
                        <MenuItem 
                          value="education-youth-pack"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Education / Youth Pack
                        </MenuItem>
                        <MenuItem 
                          value="CoMaSi"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          CoMaSi (Companies & Compliance)
                        </MenuItem>
                        <MenuItem 
                          value="demo-families"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Demo for families
                        </MenuItem>
                        <MenuItem 
                          value="demo-schools"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Demo for schools & Universities
                        </MenuItem>
                        <MenuItem 
                          value="demo-businesses"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Demo for businesses
                        </MenuItem>
                        {/* <MenuItem 
                          value="nis2-audit"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          NIS2 / Audit Readiness
                        </MenuItem> */}
                        <MenuItem 
                          value="partnerships"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Partnerships / Ambassadors
                        </MenuItem>
                        <MenuItem 
                          value="media-press"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Media / Press
                        </MenuItem>
                        <MenuItem 
                          value="other"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Other
                        </MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={5}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.message}
                        helperText={errors.message || "Tell us what kind of HACKs you're dealing with."}
                      />
                    </Grid>

                    {/* Address fields - shown only for demo options */}
                    {requiresAddressFields && (
                      <>
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              mt: 2,
                              mb: 1,
                              p: 2,
                              backgroundColor: '#F8F9FA',
                              borderRadius: 2,
                              border: '1px solid #E0E0E0',
                            }}
                          >
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
                            <Grid container spacing={3}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Address"
                                  name="address"
                                  required
                                  value={formData.address}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
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
                                    // Try to find country as user types
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
                                      onBlur={handleBlur}
                                    />
                                  )}
                                  ListboxProps={{
                                    style: {
                                      maxHeight: 300,
                                    },
                                  }}
                                  sx={{
                                    '& .MuiAutocomplete-popper': {
                                      zIndex: 1300,
                                    },
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Autocomplete
                                  freeSolo
                                  options={states.map((state) => state.name)}
                                  value={formData.state}
                                  onChange={(event, newValue) => {
                                    setFormData((prev) => ({ ...prev, state: newValue || '' }));
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
                                      helperText={errors.state || (loadingStates ? 'Loading states...' : states.length === 0 && formData.country ? 'Type state name' : '')}
                                      onBlur={handleBlur}
                                    />
                                  )}
                                  ListboxProps={{
                                    style: {
                                      maxHeight: 300,
                                    },
                                  }}
                                  sx={{
                                    '& .MuiAutocomplete-popper': {
                                      zIndex: 1300,
                                    },
                                  }}
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
                                      helperText={errors.city || (loadingCities ? 'Loading cities...' : cities.length === 0 && formData.state ? 'Type city name' : cities.length > 0 ? `${cities.length} cities available` : '')}
                                      onBlur={handleBlur}
                                    />
                                  )}
                                  ListboxProps={{
                                    style: {
                                      maxHeight: 300,
                                    },
                                  }}
                                  sx={{
                                    '& .MuiAutocomplete-popper': {
                                      zIndex: 1300,
                                    },
                                  }}
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
                                  onChange={(e) => {
                                    // Remove + sign if user types it (we show it in prefix)
                                    let value = e.target.value;
                                    if (value.startsWith('+')) {
                                      value = value.substring(1);
                                    }
                                    // Remove country code if user types it
                                    if (selectedCountryData?.callingCodes?.[0] && value.startsWith(selectedCountryData.callingCodes[0])) {
                                      value = value.substring(selectedCountryData.callingCodes[0].length);
                                    }
                                    setFormData((prev) => ({ ...prev, phone: value }));
                                    if (errors.phone) {
                                      setErrors((prev) => ({ ...prev, phone: '' }));
                                    }
                                  }}
                                  onBlur={handleBlur}
                                  error={!!errors.phone}
                                  helperText={errors.phone || (selectedCountryData?.callingCodes?.[0] &&  `Country code: ${selectedCountryData.callingCodes[0]}` )}
                                  InputProps={{
                                    startAdornment: selectedCountryData?.callingCodes?.[0] ? (
                                      <InputAdornment position="start">
                                        <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                          {selectedCountryData.callingCodes[0]}
                                        </Typography>
                                      </InputAdornment>
                                    ) : null,
                                  }}
                                  placeholder={selectedCountryData?.callingCodes?.[0] ? `Enter number` : 'Enter phone number'}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Department"
                                  name="department"
                                  required
                                  value={formData.department}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={!!errors.department}
                                  helperText={errors.department}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Position"
                                  name="position"
                                  required
                                  value={formData.position}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={!!errors.position}
                                  helperText={errors.position}
                                />
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <TextField
                                  fullWidth
                                  label="Website"
                                  name="website"
                                  type="url"
                                  value={formData.website}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  placeholder="https://example.com"
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        </Grid>
                      </>
                    )}

                    {/* Honeypot field - hidden from users */}
                    <Grid item xs={12} sx={{ display: 'none' }}>
                      <TextField
                        fullWidth
                        label="Leave this field empty"
                        name="honeypot"
                        value={formData.honeypot}
                        onChange={handleChange}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </Grid>

                    {/* Robot checkbox */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="notRobot"
                            checked={formData.notRobot}
                            onChange={handleChange}
                            required
                          />
                        }
                        label="I am not a robot"
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.9rem',
                            color: 'text.secondary',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        sx={{
                          py: 1.5,
                          fontWeight: 600,
                          backgroundColor: '#063C5E',
                          '&:hover': { backgroundColor: '#052A42' },
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Footer reassurance */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      maxWidth: 600,
                      mx: 'auto',
                    }}>   We&apos;ll get back to you personally usually within one buisness day.</Typography>
           
                   
                  {/* <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      opacity: 0.7,
                      mt: 3,
                    }}
                  >
                    Looking for a demo? Visit{' '}
                    <MuiLink
                      href="/comasi"
                      sx={{
                        color: '#0B7897',
                        textDecoration: 'none',
                        fontWeight: 500,
                        opacity: 0.9,
                        '&:hover': { textDecoration: 'underline', opacity: 1 },
                      }}
                    >
                      CoMaSy
                    </MuiLink>
                    {' '}or{' '}
                    <MuiLink
                      href="/education"
                      sx={{
                        color: '#0B7897',
                        textDecoration: 'none',
                        fontWeight: 500,
                        opacity: 0.9,
                        '&:hover': { textDecoration: 'underline', opacity: 1 },
                      }}
                    >
                      Education
                    </MuiLink>
                    {' '}to request a guided session. */}
                  {/* </Typography> */}
                </Box>
              </>
            )}
          </Box>

          {/* Response time info - outside form box, inside container */}
          {/* <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              mb: 2,
              fontSize: '0.9rem',
              opacity: 0.7,
            }}
          >
            We typically reply within 24 hours on business days.
          </Typography> */}
        </Container>
      </Box>
      <Footer />
    </>
  );
}
