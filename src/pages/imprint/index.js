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

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            1. Operator Information
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Company Name:</strong> PlanetHike OÜ
            <br />
            <strong>Product:</strong> Konfydence
            <br />
            <strong>Registered Office Address:</strong> Järvevana tee 9, Tallinn, 11314, Estonia
            <br />
            <strong>Registration Number:</strong> 80656111
            <br />
            <strong>Legal Representative / Founder:</strong> Tichi Mbanwie
            <br />
            <strong>Email:</strong> hello@planethike.org
            <br />
            <strong>Phone:</strong> +49 (0)1634668380
            <br /><br />
            <strong>Responsible for Content Contact Person for Content-Related Inquiries:</strong> Tichi Mbanwie
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            3. External Links Disclaimer
          </Typography>
          <Typography variant="body1" paragraph>
            This website may contain links to external websites operated by third parties. We have carefully reviewed these links at the time of their placement. However, PlanetHike OÜ has no continuous influence over the future content or design of such external websites. Therefore, we cannot guarantee the content, accuracy, legality, or safety of any linked external sites.
          </Typography>
          <Typography variant="body1" paragraph>
            PlanetHike OÜ expressly dissociates itself from all content of all linked external pages that have been changed after the link was set. The responsibility for the content and lawfulness of external links lies solely with their operators. Users access external links at their own risk. PlanetHike OÜ accepts no liability for any damages or losses arising from the use of external links.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            4. Copyright &amp; Usage (Intellectual Property)
          </Typography>
          <Typography variant="body1" paragraph>
            PlanetHike Intellectual Property: Unless otherwise explicitly stated, all content published on this website, including but not limited to text, graphics, images, logos, designs, audio, video, software, the “RegreenityCoin” concept, and any underlying technology, is the intellectual property of PlanetHike OÜ or its licensors and is protected by copyright, trademark, and other intellectual property laws worldwide.
          </Typography>
          <Typography variant="body1" paragraph>
            Stock Images &amp; Third-Party Content: Stock images, fonts, and other third-party materials used on this site are licensed from their respective providers and remain the intellectual property of their owners. Unauthorized use or reproduction of these materials may violate copyright laws and is strictly prohibited.
          </Typography>
          <Typography variant="body1" paragraph>
            Permitted Use: Any use of PlanetHike’s original materials beyond personal, non-commercial viewing and participation on the platform—such as reproduction, distribution, modification, public display, or commercial exploitation—requires the express prior written consent of PlanetHike OÜ. For permission requests, please contact us at hello@planethike.org.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            5. Liability Disclaimer
          </Typography>
          <Typography variant="body1" paragraph>
            Disclaimer of Content: The information provided on this website is for general informational purposes only and does not constitute legal, medical, or professional advice. While we strive to ensure the accuracy and completeness of the information, PlanetHike OÜ makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
          </Typography>
          <Typography variant="body1" paragraph>
            Reliance on Information: Any reliance you place on such information is therefore strictly at your own risk. PlanetHike OÜ assumes no liability for the topicality, correctness, completeness, or quality of the information provided.
          </Typography>
          <Typography variant="body1" paragraph>
            Exclusion of Liability: Claims for liability against PlanetHike OÜ which refer to material or immaterial damages caused by the use or non-use of the information provided or by the use of incorrect and incomplete information are fundamentally excluded, unless demonstrable intentional or grossly negligent fault exists on the part of PlanetHike OÜ.
          </Typography>

        </Container>
      </Box>
      <Footer />
    </>
  );
}

