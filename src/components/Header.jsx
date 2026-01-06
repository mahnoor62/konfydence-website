'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useScrollTrigger,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'CoMaSi', href: '/comasi' },
  { label: 'Education', href: '/education' },
  { label: 'Resource Hub', href: '/resources' },
  { label: 'Shop', href: '/sskit-family' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = router.pathname;
  const { user, logout, loading: authLoading } = useAuth();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  useEffect(() => {
    setScrolled(trigger);
  }, [trigger]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Get dashboard route based on user role and membership
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

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background:  'linear-gradient(90deg, rgba(0,139,139,0.15) 0%, rgba(0,81,131,0.25) 100%)',
          // background: scrolled
          //   ? 'rgba(255,255,255,0.95)'
          //   : 'linear-gradient(90deg, rgba(0,139,139,0.15) 0%, rgba(0,81,131,0.25) 100%)',
          backdropFilter: 'blur(18px)',
          borderRadius: '0',
          // borderBottom: scrolled ? '1px solid rgba(15,31,43,0.08)' : 'transparent',
          transition: 'all 0.4s ease',
          // color: scrolled ? 'text.primary' : 'white',
          color:'white',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 3, md: 10 } }}>
          <Toolbar sx={{ py: 1, minHeight: { xs: 64, md: 88 }, px: '0 !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: { xs: 1, md: 1.5 } }}>
              <Box
                component={Link}
                href="/"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flex: { xs: '1 1 auto', md: '0 0 auto' },
                }}
              >
                <Box
                  component="img"
                  src={scrolled ? "/images/navbar-logo.png" : "/images/footer-logo.png"}
                  alt="Konfydence Logo"
                  sx={{
                    width: { xs: 40, md: 44 },
                    height: { xs: 40, md: 44 },
                    objectFit: 'contain',
                    transition: 'all 0.4s ease',
                  }}
                />
                <Box>
                  <Box
                    component="span"
                    sx={{
                      fontSize: { xs: '1.3rem', md: '1.4rem' },
                      fontWeight: 700,
                      fontFamily: 'var(--font-poppins)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Konfydence
                  </Box>
                  <Box component="span" sx={{ display: 'block', fontSize: { xs: '0.7rem', md: '0.75rem' }, opacity: 0.7 }}>
                    Safer Digital Decisions
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: '1 1 auto',
                  display: { xs: 'none', md: 'flex' },
                  justifyContent: 'center',
                  gap: 3,
                  flexWrap: 'nowrap',
                }}
              >
                {navItems.map((item) => {
                  const safePath = pathname || '';
                  const isActive = safePath === item.href || (item.href !== '/' && safePath.startsWith(item.href));
                  return (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      sx={{
                        color: isActive ? '#0E4D68' : 'inherit',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        borderRadius: 999,
                        px: 1.5,
                        py: 0.75,
                        minWidth: 'auto',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>

              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  justifyContent: 'flex-end',
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                {!authLoading && user ? (
                  <>
                    <Box
                      ref={dropdownRef}
                      sx={{
                        position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={toggleDropdown}
                        endIcon={<ArrowDropDownIcon sx={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />}
                        sx={{
                          borderColor: scrolled ? 'primary.main' : 'rgba(255,255,255,0.85)',
                          color: scrolled ? 'primary.main' : 'white',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontFamily: 'var(--font-poppins), sans-serif',
                          px: 2.5,
                          '&:hover': {
                            borderColor: scrolled ? 'primary.dark' : 'white',
                            backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                          },
                        }}
                      >
                        Dashboard
                      </Button>
                      {dropdownOpen && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '4px',
                            minWidth: '180px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            overflow: 'hidden',
                            animation: 'fadeIn 0.2s ease',
                            '@keyframes fadeIn': {
                              from: { opacity: 0, transform: 'translateY(-10px)' },
                              to: { opacity: 1, transform: 'translateY(0)' },
                            },
                          }}
                        >
                          <Box
                            component={Link}
                            href={getDashboardRoute()}
                            onClick={() => setDropdownOpen(false)}
                            sx={{
                              display: 'block',
                              padding: '12px 16px',
                              color: '#063C5E',
                              textDecoration: 'none',
                              fontSize: '0.95rem',
                              fontFamily: 'var(--font-poppins), sans-serif',
                              fontWeight: 500,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(6, 60, 94, 0.08)',
                              },
                            }}
                          >
                            Dashboard
                          </Box>
                          <Box
                            component={Link}
                            href="/play"
                            onClick={() => setDropdownOpen(false)}
                            sx={{
                              display: 'block',
                              padding: '12px 16px',
                              color: '#063C5E',
                              textDecoration: 'none',
                              fontSize: '0.95rem',
                              fontFamily: 'var(--font-poppins), sans-serif',
                              fontWeight: 500,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(6, 60, 94, 0.08)',
                              },
                            }}
                          >
                            Game
                          </Box>
                          <Box
                            component="button"
                            onClick={() => {
                              setDropdownOpen(false);
                              logout();
                            }}
                            sx={{
                              display: 'block',
                              width: '100%',
                              padding: '12px 16px',
                              color: '#d32f2f',
                              textDecoration: 'none',
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              fontFamily: 'var(--font-poppins), sans-serif',
                              border: 'none',
                              background: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                              },
                            }}
                          >
                            Logout
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      component={Link}
                      href="/login"
                      sx={{
                        borderColor: scrolled ? 'primary.main' : 'rgba(255,255,255,0.85)',
                        color: scrolled ? 'primary.main' : 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        '&:hover': {
                          borderColor: scrolled ? 'primary.dark' : 'white',
                          backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)',
                          color: 'white',
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      component={Link}
                      href="/sskit-family"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #FFC54D, #FF8A00)',
                        color: '#073041',
                        '&:hover': {
                          opacity: 0.95,
                        },
                      }}
                    >
                      Shop Now
                    </Button>
                  </>
                )}
              </Box>

              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            fontFamily: 'var(--font-poppins), sans-serif',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F6F8FA 100%)',
          },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', pt: 2 }}>
          <List sx={{ px: 1 }}>
            {navItems.map((item) => {
              const safePath = pathname || '';
              const isActive = safePath === item.href || (item.href !== '/' && safePath.startsWith(item.href));
              return (
                <ListItem key={item.href} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(6, 60, 94, 0.1)',
                        color: '#063C5E',
                        fontWeight: 600,
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: 'rgba(6, 60, 94, 0.15)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiTypography-root': {
                          fontFamily: 'var(--font-poppins), sans-serif !important',
                          fontWeight: isActive ? 600 : 500,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {!authLoading && user ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href={getDashboardRoute()}>
                    <ListItemText 
                      primary="Dashboard" 
                      sx={{
                        '& .MuiTypography-root': {
                          fontFamily: 'var(--font-poppins), sans-serif !important',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/play">
                    <ListItemText 
                      primary="Game" 
                      sx={{
                        '& .MuiTypography-root': {
                          fontFamily: 'var(--font-poppins), sans-serif !important',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      handleDrawerToggle();
                      logout();
                    }}
                    sx={{
                      color: '#d32f2f',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                      },
                    }}
                  >
                    <ListItemText 
                      primary="Logout" 
                      sx={{
                        '& .MuiTypography-root': {
                          fontFamily: 'var(--font-poppins), sans-serif !important',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/login">
                    <ListItemText 
                      primary="Login" 
                      sx={{
                        '& .MuiTypography-root': {
                          fontFamily: 'var(--font-poppins), sans-serif !important',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/sskit-family">
                    <ListItemText 
                      primary="Shop Now" 
                      sx={{
                        '& .MuiTypography-root': {
                          fontFamily: 'var(--font-poppins), sans-serif !important',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

