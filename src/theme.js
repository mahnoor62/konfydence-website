import { alpha, createTheme } from '@mui/material/styles';

const teal = '#008B8B';
const deepTeal = '#006E6E';
const lightTeal = '#33BABA';
const coral = '#FF725E';
const coralDark = '#E65341';
const coralLight = '#FF9B8A';
const background = '#F6F8FA';
const navy = '#0F1F2B';
const slate = '#4F6272';

export const theme = createTheme({
  palette: {
    primary: {
      main: teal,
      light: lightTeal,
      dark: deepTeal,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: coral,
      light: coralLight,
      dark: coralDark,
      contrastText: '#FFFFFF',
    },
    background: {
      default: background,
      paper: '#FFFFFF',
    },
    text: {
      primary: navy,
      secondary: slate,
    },
    divider: alpha(navy, 0.08),
    success: {
      main: '#1AB394',
    },
    warning: {
      main: '#FFC247',
    },
    info: {
      main: '#4C6FFF',
    },
  },
  typography: {
    fontFamily: 'var(--font-poppins), sans-serif',
    h1: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
    },
    subtitle1: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontSize: '1rem',
      color: slate,
    },
    body2: {
      fontFamily: 'var(--font-poppins), sans-serif',
    },
    button: {
      fontFamily: 'var(--font-poppins), sans-serif',
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: 0.2,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: background,
          color: navy,
        },
      },
    },
        MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: '12px 28px',
          fontSize: '0.95rem',
          transition: 'all 0.3s ease',
        },
        contained: {
          background: `linear-gradient(135deg, ${teal} 0%, ${lightTeal} 100%)`,
          boxShadow: '0 10px 30px rgba(0, 139, 139, 0.25)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 18px 30px rgba(0, 139, 139, 0.35)',
          },
        },
        outlined: {
          borderColor: alpha(navy, 0.2),
          color: navy,
          '&:hover': {
            borderColor: alpha(navy, 0.4),
            backgroundColor: alpha(teal, 0.08),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${alpha(navy, 0.06)}`,
          boxShadow: '0 25px 50px rgba(15,31,43,0.08)',
          transition: 'all 0.35s ease',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,139,139,0.08), rgba(255,114,94,0.08))',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            zIndex: 0,
          },
          '&:hover': {
            transform: 'translateY(-6px) scale(1.01)',
            boxShadow: '0 35px 60px rgba(15,31,43,0.12)',
            '&::before': {
              opacity: 1,
            },
          },
          '& > *': {
            position: 'relative',
            zIndex: 1,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    // MuiButton: {
    //   defaultProps: {
    //     disableElevation: true,
    //   },
    //   styleOverrides: {
    //     root: {
    //       borderRadius: 999,
    //       padding: '12px 28px',
    //       fontFamily: 'var(--font-poppins), sans-serif',
    //       fontSize: '0.95rem',
    //       transition: 'all 0.3s ease',
    //     },
    //   },
    // },
    MuiCard: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
          borderRadius: 20,
          border: `1px solid ${alpha(navy, 0.06)}`,
          boxShadow: '0 25px 50px rgba(15,31,43,0.08)',
          transition: 'all 0.35s ease',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,139,139,0.08), rgba(255,114,94,0.08))',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            zIndex: 0,
          },
          '&:hover': {
            transform: 'translateY(-6px) scale(1.01)',
            boxShadow: '0 35px 60px rgba(15,31,43,0.12)',
            '&::before': {
              opacity: 1,
            },
          },
          '& > *': {
            position: 'relative',
            zIndex: 1,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontFamily: 'var(--font-poppins), sans-serif'
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          fontFamily: 'var(--font-poppins), sans-serif',
          letterSpacing: 0.2,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#FFFFFF', 0.85),
          fontFamily: 'var(--font-poppins), sans-serif',
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        input: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
        message: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontFamily: 'var(--font-poppins), sans-serif !important',
        },
        secondary: {
          fontFamily: 'var(--font-poppins), sans-serif !important',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
    },
  },
});

