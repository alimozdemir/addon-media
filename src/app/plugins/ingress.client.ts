export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  // Prefer runtime app.baseURL; fallback to server-provided window variable
  const prefix = config.app.baseURL && config.app.baseURL !== '/' ? config.app.baseURL.replace(/\/$/, '') : (typeof window !== 'undefined' && (window as any).__ingressBase) || ''

  if (!prefix || prefix === '/') {
    return
  }

  // Ensure navigate links and router use the prefixed base
  if (import.meta.client) {
    try {
      const ogPush = history.pushState.bind(history)
      history.pushState = function (state, title, url) {
        let u = url instanceof URL ? url.toString() : String(url || '')
        if (u.startsWith('/') && !u.startsWith(prefix + '/')) {
          u = prefix + u
        }
        return ogPush(state, title, u)
      }
      const ogReplace = history.replaceState.bind(history)
      history.replaceState = function (state, title, url) {
        let u = url instanceof URL ? url.toString() : String(url || '')
        if (u.startsWith('/') && !u.startsWith(prefix + '/')) {
          u = prefix + u
        }
        return ogReplace(state, title, u)
      }
    } catch {}

    // Prefix fetch for absolute-path requests
    try {
      const ogFetch = window.fetch.bind(window)
      window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
        const isStr = typeof input === 'string'
        let u = isStr ? input : (input as any)?.url || ''
        if (typeof u === 'string' && u.startsWith('/') && !u.startsWith(prefix + '/')) {
          u = prefix + u
        }
        if (isStr) return ogFetch(u as any, init)
        try { input = new Request(u as any, input as any) } catch {}
        return ogFetch(input as any, init)
      }
    } catch {}
  }
})


