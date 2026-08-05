'use client';

/**
 * instrumentation-client.ts — Next.js Client Instrumentation
 *
 * Runs once in the browser when the app hydrates.
 * Use this for: client-side observability (Sentry browser SDK, Web Vitals, analytics).
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 */

/**
 * onRouteChange — called on every client-side navigation.
 * Use for: page-view analytics, resetting scroll, clearing toast state, etc.
 */
export function onRouteChange() {
  // Example: track page views
  // analytics.page(window.location.pathname);
}

/**
 * register — called once on initial client load.
 * Use for: Sentry browser init, Web Vitals reporting, etc.
 */
export function register() {
  // Example: Sentry client-side init
  // import('@sentry/nextjs').then(({ init }) => init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN }));

  // Example: Report Web Vitals
  // reportWebVitals(sendToAnalytics);
}
