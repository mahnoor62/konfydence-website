'use client';

import { Button, ButtonProps } from '@mui/material';
import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

interface PageBackButtonProps extends ButtonProps {
  fallbackHref?: string;
}

export default function PageBackButton({
  fallbackHref = '/',
  children = '← Back',
  ...props
}: PageBackButtonProps) {
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
    <Button onClick={handleClick} variant="outlined" size="large" sx={{ borderRadius: 2 }} {...props}>
      {children}
    </Button>
  );
}

