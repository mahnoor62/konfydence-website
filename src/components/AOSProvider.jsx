'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AOS from 'aos';

export default function AOSProvider({ children }) {
  const pathname = usePathname();

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
  }, [pathname]);

  return <>{children}</>;
}

