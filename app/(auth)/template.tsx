import { type ReactNode } from 'react';

/**
 * template.tsx — Auth route group template.
 *
 * Unlike layout.tsx, template.tsx creates a NEW instance on every navigation,
 * which means state is NOT preserved between routes. Use sparingly.
 *
 * Good use cases:
 *  - Enter/exit animations that should replay on every route change
 *  - Re-running useEffect on navigation (e.g. page-view analytics)
 *  - Resetting form state between auth pages
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/template
 */
interface AuthTemplateProps {
  children: ReactNode;
}

export default function AuthTemplate({ children }: AuthTemplateProps) {
  return (
    // Wrap in a div so Framer Motion or CSS animations can target it
    <div className="animate-in fade-in duration-200">
      {children}
    </div>
  );
}
