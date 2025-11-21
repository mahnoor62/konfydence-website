'use client';

import { Button } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRouter } from 'next/navigation';

export default function BackButton({ fallbackHref = '/', children = 'Back', ...buttonProps }) {
  const router = useRouter();

  const handleClick = (event) => {
    event.preventDefault();
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      onClick={handleClick}
      startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 16 }} />}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}

