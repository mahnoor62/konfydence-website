import { Container, Typography, Box } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ImprintPage() {
  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh' }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography variant="h2" gutterBottom>
            Imprint
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Konfydence</strong>
          </Typography>
          <Typography variant="body1" paragraph>
            [Company Address]
          </Typography>
          <Typography variant="body1" paragraph>
            [City, Country]
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Contact:</strong>
          </Typography>
          <Typography variant="body1" paragraph>
            Email: info@konfydence.com
          </Typography>
          <Typography variant="body1" paragraph>
            Phone: [Phone Number]
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Managing Director:</strong> T. Mbanwie
          </Typography>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

