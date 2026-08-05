/**
 * instrumentation.ts — Next.js Instrumentation Hook
 *
 * Runs once when the Next.js server boots (Node.js runtime or Edge runtime).
 * Use this for: OpenTelemetry setup, Sentry server SDK init, performance monitoring.
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 *
 * NOTE: Requires `experimental.instrumentationHook = true` in next.config.ts
 * (enabled by default in Next.js 15+).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node.js runtime — safe to import heavy server-side modules here.
    // Example: Sentry server-side init, OpenTelemetry SDK setup.
    // const { initSentry } = await import('@/lib/sentry');
    // initSentry();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime — keep imports minimal and compatible.
    // Example: Edge-compatible observability tools.
  }
}

/**
 * onRequestError — optional hook called whenever the server throws during
 * request handling (Server Components, Route Handlers, Server Actions).
 *
 * Use this to forward errors to an external observability platform.
 */
export async function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string };
  },
  context: {
    routeType: 'render' | 'route' | 'action' | 'middleware';
  }
) {
  // Example: send to Sentry or Datadog
  // await sendToMonitoring({ error, request, context });
  console.error('[instrumentation:onRequestError]', {
    digest: error.digest,
    message: error.message,
    path: request.path,
    method: request.method,
    routeType: context.routeType,
  });
}
