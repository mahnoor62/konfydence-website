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
  const getHref = (pageNumber?: number) => {
    if (!pageNumber || pageNumber < 1) return basePath;
    return pageNumber === 1 ? basePath : `${basePath}?page=${pageNumber}`;
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

