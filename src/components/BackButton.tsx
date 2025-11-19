'use client';

import { Button, ButtonProps } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

interface BackButtonProps extends ButtonProps {
  fallbackHref?: string;
}

export default function BackButton({ fallbackHref = '/', children = 'Back', ...buttonProps }: BackButtonProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
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

