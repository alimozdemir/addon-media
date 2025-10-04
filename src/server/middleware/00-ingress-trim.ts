import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const ingressPathHeader = getHeader(event, 'x-ingress-path') || ''
  if (!ingressPathHeader || ingressPathHeader === '/') {
    return
  }

  const url = event.node.req.url || '/'
  if (url.startsWith(ingressPathHeader)) {
    const trimmed = url.slice(ingressPathHeader.length) || '/'
    event.node.req.url = trimmed
  }
})


