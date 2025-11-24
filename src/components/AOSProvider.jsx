'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AOS from 'aos';

export default function AOSProvider({ children }) {
  const router = useRouter();

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: true,
      offset: 100,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [router.asPath]);

  return <>{children}</>;
}

