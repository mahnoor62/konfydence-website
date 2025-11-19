'use client';

import { PartnerLogo } from '@/lib/types';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Box, Card } from '@mui/material';
import Link from 'next/link';

interface PartnerCarouselProps {
  logos: PartnerLogo[];
}

const fallbackLogo = '/images/placeholders/partner-default.svg';

export default function PartnerCarousel({ logos }: PartnerCarouselProps) {
  if (!logos.length) {
    return null;
  }

  return (
    <Swiper
      modules={[Autoplay]}
      loop
      speed={4000}
      autoplay={{
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      spaceBetween={24}
      slidesPerView={2}
      breakpoints={{
        640: { slidesPerView: 3 },
        900: { slidesPerView: 4 },
        1200: { slidesPerView: 5 },
      }}
      style={{ paddingBottom: '10px' }}
    >
      {logos.map((logo) => (
        <SwiperSlide key={logo._id}>
          <Card
            component={logo.linkUrl ? Link : 'div'}
            href={logo.linkUrl || undefined}
            target={logo.linkUrl ? '_blank' : undefined}
            rel={logo.linkUrl ? 'noopener noreferrer' : undefined}
            sx={{
              px: 3,
              py: 2,
              height: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              boxShadow: '0 12px 30px rgba(6,60,94,0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f4f8fd 100%)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 45px rgba(6,60,94,0.15)',
              },
            }}
          >
            <Box
              component="img"
              src={logo.logoUrl || fallbackLogo}
              alt={logo.name}
              sx={{
                maxWidth: '100%',
                maxHeight: 60,
                objectFit: 'contain',
                filter: 'grayscale(0.2)',
              }}
              onError={(event) => {
                event.currentTarget.src = fallbackLogo;
              }}
            />
          </Card>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

