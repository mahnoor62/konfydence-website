'use client';

import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function PageBackButton({
  fallbackHref = '/',
  children = '← Back',
  ...props
}) {
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
    <Button onClick={handleClick} variant="outlined" size="large" sx={{ borderRadius: 2 }} {...props}>
      {children}
    </Button>
  );
}

