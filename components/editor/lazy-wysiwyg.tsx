'use client';

import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/dashboard/loading-state';

// Lazy load the WYSIWYG editor to reduce initial bundle size
const WYSIWYGEditor = dynamic(
  () => import('./wysiwyg-editor').then(mod => ({ default: mod.WYSIWYGEditor })),
  {
    loading: () => <LoadingState message="Loading editor..." />,
    ssr: false, // Editor should only load on client
  }
);

interface LazyWYSIWYGProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function LazyWYSIWYG({ content, onChange, placeholder }: LazyWYSIWYGProps) {
  return <WYSIWYGEditor content={content} onChange={onChange} placeholder={placeholder} />;
}
