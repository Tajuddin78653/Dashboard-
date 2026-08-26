import { ReactNode } from 'react';

/**
 * Auth layout — no sidebar or top bar.
 * Renders children directly so the dashboard shell doesn't wrap auth pages.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
