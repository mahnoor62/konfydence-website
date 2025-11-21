'use client';

import { Pagination, PaginationItem } from '@mui/material';
import Link from 'next/link';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  basePath?: string;
}

export default function PaginationControls({
  page,
  totalPages,
  basePath = '/products',
}: PaginationControlsProps) {
  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const getHref = (pageNumber?: number | null) => {
    if (!pageNumber || pageNumber < 1) return basePath;
    
    const [pathOnly, existingQuery] = basePath.split('?');
    const params = new URLSearchParams(existingQuery || '');
    
    if (pageNumber === 1) {
      params.delete('page');
    } else {
      params.set('page', pageNumber.toString());
    }
    
    const queryString = params.toString();
    return queryString ? `${pathOnly}?${queryString}` : pathOnly;
  };

  return (
    <Pagination
      count={Math.max(totalPages, 1)}
      page={safePage}
      color="primary"
      renderItem={(item) => (
        <PaginationItem
          {...item}
          component={Link}
          href={getHref(item.page)}
          shallow
        />
      )}
    />
  );
}

