export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    try {
      const rawHeader = (event.node.req.headers['x-ingress-path'] || event.node.req.headers['X-Ingress-Path']) as string | string[] | undefined;
      const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
      if (!headerValue) return;

      let normalized = headerValue.trim();
      if (!normalized) return;
      if (!normalized.startsWith('/')) normalized = `/${normalized}`;
      // remove trailing slashes, but keep root-only as empty (no prefix)
      normalized = normalized.replace(/\/+$/, '');
      if (normalized === '/') return;

      const serialized = JSON.stringify(normalized);

      // Ensure arrays are present
      html.head = html.head || [];
      html.body = html.body || [];
      html.bodyPrepend = html.bodyPrepend || [];
      html.bodyAppend = html.bodyAppend || [];

      const prefix = normalized;

      const addPrefixToRootUrls = (chunk: string) =>
        chunk
          // attributes like src="/..." or href='/...'
          .replace(/(=\s*["'])(\/)(?!\/)/g, `$1${prefix}/`)
          // CSS url(/...)
          .replace(/(url\()\/(?!\/)/g, `$1${prefix}/`);

      html.head = html.head.map((s: string) => addPrefixToRootUrls(s));
      html.body = html.body.map((s: string) => addPrefixToRootUrls(s));
      html.bodyPrepend = html.bodyPrepend.map((s: string) => addPrefixToRootUrls(s));
      html.bodyAppend = html.bodyAppend.map((s: string) => addPrefixToRootUrls(s));

      // Expose the prefix to the client so fetch calls can be adjusted
      html.bodyPrepend.push(`<script>window.__INGRESS_PATH__=${serialized};</script>`);
    } catch {
      // noop – never break rendering due to this helper
    }
  });

  // Final safeguard: rewrite any remaining absolute-root URLs in the final HTML string
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    try {
      const rawHeader = (event.node.req.headers['x-ingress-path'] || event.node.req.headers['X-Ingress-Path']) as string | string[] | undefined;
      const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
      if (!headerValue) return;

      let normalized = headerValue.trim();
      if (!normalized) return;
      if (!normalized.startsWith('/')) normalized = `/${normalized}`;
      normalized = normalized.replace(/\/+$/, '');
      if (normalized === '/') return;

      const prefix = normalized;
      if (typeof response.body !== 'string') return;
      response.body = response.body
        .replace(/(=\s*["'])(\/)(?!\/)/g, `$1${prefix}/`)
        .replace(/(url\()\/(?!\/)/g, `$1${prefix}/`);
    } catch {
      // noop
    }
  });
});


