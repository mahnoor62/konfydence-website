import { Container, Typography, Box } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Header />

      
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh' }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography variant="h2" gutterBottom>
            Terms and Conditions
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            <strong>Konfydence</strong>
            <br />
            <strong>Last updated:</strong> 01/01/2026
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            1. Introduction and Scope
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms and Conditions (&quot;Terms&quot;) govern the use of the Konfydence website, products, and services, including physical products, digital content, and related services (collectively, the &quot;Services&quot;), provided by Konfydence (&quot;Konfydence&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing or using the Services, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Services.
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms apply to consumers, businesses, educational institutions, ambassadors, and any other users, unless otherwise agreed in writing.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            2. Company Information
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence is operated by: Konfydence
            <br />
            https://www.konfydence.com
            <br />
            Contact: hello@konfydence.com
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            3. Description of Services
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence provides educational products and services focused on digital resilience, scam awareness, and human-centric cyber risk learning. These include physical card-based learning kits, optional digital extensions, and services for organizations and educational institutions.
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence Services are intended for educational and awareness purposes only. They do not constitute legal, financial, cybersecurity, or compliance advice.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            4. Eligibility and Use
          </Typography>
          <Typography variant="body1" paragraph>
            You must be legally capable of entering into binding agreements to use the Services. By using the Services, you represent that you meet this requirement.
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to use the Services only for lawful purposes and in accordance with these Terms. You must not misuse the Services or use them in a manner that could harm Konfydence, other users, or third parties.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            5. Accounts and Registration
          </Typography>
          <Typography variant="body1" paragraph>
            Certain Services may require registration or account creation. You are responsible for ensuring that the information you provide is accurate and up to date and for maintaining the confidentiality of your account credentials.
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence reserves the right to suspend or terminate accounts in case of misuse, violation of these Terms, or security concerns.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            6. Purchases, Pricing, and Payment
          </Typography>
          <Typography variant="body1" paragraph>
            Prices for Konfydence products and services are displayed on the website or agreed contractually. Prices may include or exclude taxes depending on the context and applicable law.
          </Typography>
          <Typography variant="body1" paragraph>
            Payment must be made using the payment methods offered at the time of purchase. Konfydence reserves the right to change prices, product availability, or payment terms at any time, without affecting existing confirmed orders.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            7. Delivery of Physical Products
          </Typography>
          <Typography variant="body1" paragraph>
            Physical products are shipped to the address provided at checkout. Delivery times are estimates and may vary. Risk of loss passes to the customer upon delivery, unless otherwise required by applicable consumer protection laws.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            8. Digital Content and Access
          </Typography>
          <Typography variant="body1" paragraph>
            Digital content and services may be provided immediately after purchase or activation. Konfydence does not guarantee uninterrupted availability and may suspend access temporarily for maintenance or security reasons.
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence reserves the right to modify or discontinue digital features, provided that such changes do not materially deprive users of purchased core functionality.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            9. Right of Withdrawal (Consumers)
          </Typography>
          <Typography variant="body1" paragraph>
            If you are a consumer under applicable law, you may have a statutory right to withdraw from certain purchases within a specified period. Details regarding withdrawal rights, exclusions, and procedures will be provided separately where required by law.
          </Typography>
          <Typography variant="body1" paragraph>
            For digital content delivered immediately, withdrawal rights may be excluded where permitted by law and consent has been given.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            10. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            All content, materials, trademarks, designs, texts, graphics, and software provided as part of the Services are the intellectual property of Konfydence or its licensors.
          </Typography>
          <Typography variant="body1" paragraph>
            You are granted a limited, non-exclusive, non-transferable right to use the Services for their intended purpose. You must not copy, reproduce, distribute, modify, or create derivative works without prior written permission.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            11. Ambassador Program
          </Typography>
          <Typography variant="body1" paragraph>
            Participation in the Konfydence Ambassador program is subject to additional terms and conditions provided during registration.
          </Typography>
          <Typography variant="body1" paragraph>
            Ambassadors act as independent partners and have no authority to bind Konfydence. Pricing remains fixed across all channels. Konfydence reserves the right to review, suspend, or terminate ambassador participation in case of misuse or violation of program guidelines.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            12. Disclaimer of Warranties
          </Typography>
          <Typography variant="body1" paragraph>
            The Services are provided &quot;as is&quot; and &quot;as available&quot;. To the fullest extent permitted by law, Konfydence disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence does not warrant that the Services will prevent scams, cyber incidents, or losses.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            13. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            To the extent permitted by law, Konfydence shall not be liable for indirect, incidental, consequential, or special damages, including loss of profit, data, or business opportunities, arising out of or in connection with the use of the Services.
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence&apos;s total liability shall be limited to the amount paid by the user for the relevant product or service, unless mandatory law provides otherwise.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            14. Indemnification
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to indemnify and hold harmless Konfydence from any claims, damages, liabilities, or expenses arising from your misuse of the Services or violation of these Terms.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            15. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence may suspend or terminate access to the Services at any time in case of violation of these Terms, legal requirements, or security concerns. Termination does not affect accrued rights or obligations.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            16. Changes to the Terms
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence may amend these Terms from time to time. Updated Terms will be published on the website. Continued use of the Services constitutes acceptance of the updated Terms.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            17. Governing Law and Jurisdiction
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms are governed by the laws of Germany excluding conflict-of-law rules. Mandatory consumer protection laws remain unaffected.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            18. Severability
          </Typography>
          <Typography variant="body1" paragraph>
            If any provision of these Terms is held invalid or unenforceable, the remaining provisions shall remain in full force and effect.
          </Typography>

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            19. Contact
          </Typography>
          <Typography variant="body1" paragraph>
            For questions regarding these Terms, please contact:
            <br />
            hello@konfydence.com
          </Typography>

          <Typography variant="h5" sx={{ mt: 5, mb: 2, fontWeight: 'bold' }}>
            Final Clarification
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence products and services are educational tools. They do not provide guarantees of security, compliance, or prevention of harm.
          </Typography>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

