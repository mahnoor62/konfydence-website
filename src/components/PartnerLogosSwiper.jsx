'use client';

import { Box, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
export default function PartnerLogosSwiper({ partnerLogos }) {
  if (!partnerLogos || partnerLogos.length === 0) {
    console.log('⚠️ No partner logos to display');
    return null;
  }

  // Filter to only show active partners with valid logo URLs
  const validLogos = partnerLogos.filter(
    (partner) => partner.isActive !== false && partner.logoUrl && partner.logoUrl.trim()
  );

  if (validLogos.length === 0) {
    console.log('⚠️ No valid partner logos to display (all inactive or missing logoUrl)');
    return null;
  }

  console.log(`✅ Displaying ${validLogos.length} partner logos:`, validLogos.map(p => p.name));

  // Duplicate logos multiple times for seamless continuous scrolling
  const duplicatedLogos = [...validLogos, ...validLogos, ...validLogos];

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
      data-aos="zoom-in"
      data-aos-duration="800"
    >
      <Box >
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 700,
            color: '#063C5E',
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          Trusted Partners
        </Typography>
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Swiper
            modules={[Autoplay]}
            spaceBetween={60}
            slidesPerView="auto"
            autoplay={{
              delay: 1,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            speed={4000}
            loop={true}
            loopedSlides={partnerLogos.length}
            allowTouchMove={false}
            className="partner-logos-swiper-continuous"
            style={{
              width: '100%',
            }}
          >
            {duplicatedLogos.map((partner, index) => (
              <SwiperSlide
                key={`${partner._id}-${index}`}
                style={{
                  width: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: { xs: 50, md: 70 },
                    width: 'auto',
                    padding: { xs: 1, md: 1.5 },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default',
                    '&:hover': {
                      transform: 'scale(1.15)',
                      '& img': {
                        filter: 'drop-shadow(0 4px 12px rgba(6, 60, 94, 0.4)) drop-shadow(0 2px 6px rgba(11, 120, 151, 0.3))',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={partner.logoUrl}
                    alt={partner.name}
                    sx={{
                      height: '100%',
                      width: 'auto',
                      maxHeight: { xs: '50px', md: '70px' },
                      objectFit: 'contain',
                      filter: 'grayscale(0%)',
                      opacity: 1,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'default',
                      pointerEvents: 'none',
                    }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Box>
    </Box>
  );
}

