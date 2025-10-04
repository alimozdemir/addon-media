import { getHeader } from 'h3'

export default (nitroApp: any) => {
  nitroApp.hooks.hook('render:response', (response: any, { event }: { event: any }) => {
    const ingressPathHeader = getHeader(event, 'x-ingress-path') || ''
    if (!ingressPathHeader || ingressPathHeader === '/') {
      return
    }

    const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type']
    if (contentType && !String(contentType).includes('text/html')) {
      return
    }

    const rawBody = typeof response.body === 'string' ? response.body : response.body?.toString('utf8')
    if (!rawBody) {
      return
    }

    // Normalize prefix (no trailing slash)
    const prefix = ingressPathHeader.endsWith('/') ? ingressPathHeader.slice(0, -1) : ingressPathHeader

    let body = rawBody

    // Rewrite asset and payload absolute URLs to include the ingress prefix
    body = body
      .replaceAll('href="/_nuxt/', `href="${prefix}/_nuxt/`)
      .replaceAll('src="/_nuxt/', `src="${prefix}/_nuxt/`)
      .replaceAll('href="/_payload.json"', `href="${prefix}/_payload.json"`)
      .replaceAll('src="/_payload.json"', `src="${prefix}/_payload.json"`)
      .replaceAll('href="/favicon.ico"', `href="${prefix}/favicon.ico"`)
      .replaceAll('href="/robots.txt"', `href="${prefix}/robots.txt"`)

    // Update embedded Nuxt runtime config baseURL so the client router uses the prefixed base
    body = body.replace(/"baseURL":"\//g, `"baseURL":"${prefix}/`)

    response.body = body
  })
}


