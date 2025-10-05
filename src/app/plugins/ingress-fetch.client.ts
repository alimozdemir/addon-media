export default defineNuxtPlugin((nuxtApp) => {
  const ingressPath = (globalThis as any).__INGRESS_PATH__ as string | undefined;
  if (!ingressPath) return;

  const prefix = ingressPath.replace(/\/+$/, '');
  if (!prefix || prefix === '/') return;

  // Patch $fetch to prefix relative URLs
  const originalFetch = $fetch;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prefixedFetch: typeof $fetch = ((input: any, init?: any) => {
    try {
      if (typeof input === 'string') {
        if (input.startsWith('/')) {
          input = `${prefix}${input}`;
        }
      } else if (input && typeof input === 'object' && typeof input.url === 'string') {
        if (input.url.startsWith('/')) {
          input.url = `${prefix}${input.url}`;
        }
      }
    } catch {
      // fall back to original
    }
    return originalFetch(input, init);
  }) as typeof $fetch;

  (globalThis as any).$fetch = prefixedFetch;

  // Also provide composable for components to read
  nuxtApp.provide('ingressPath', prefix);
});


