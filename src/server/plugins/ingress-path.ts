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
      html.bodyPrepend = html.bodyPrepend || [];

      // Put <base> as early as possible so relative URLs resolve under the ingress prefix
      html.head.unshift(`<base href="${normalized}/" target="_self" />`);

      // Expose the prefix to the client so fetch calls can be adjusted
      html.bodyPrepend.push(`<script>window.__INGRESS_PATH__=${serialized};</script>`);
    } catch {
      // noop – never break rendering due to this helper
    }
  });
});


