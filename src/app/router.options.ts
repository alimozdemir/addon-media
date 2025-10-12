import type { RouterConfig } from "@nuxt/schema";
import { type RouteLocationNormalized } from '#vue-router';

export default <RouterConfig>{
  
    scrollBehavior(to, from, savedPosition) {
      if (to.hash) {
        return {
          el: to.hash,
          top: 80,
          behavior: 'smooth'
        }
      }

      if (to.meta.scrollToTop) {
        return {
          behavior: 'instant',
          top: 0,
          left: 0
        }
      }

      if (to.meta.scrollSave) {
        // Coming from link
        if (!savedPosition) {
          const pos = getScrollPosition(routeKey(to));
          return {
            behavior: 'instant',
            ...pos
          }
        } else {
          // Coming from refresh/back button
          const nuxtApp = useNuxtApp()
          if (to.meta.keepalive && from.meta.keepalive) {
            return {
              behavior: 'instant',
              ...savedPosition
            }
          } else {
            return {
              behavior: 'instant',
              ...savedPosition
            }
          }
        }
      }

      return {
        behavior: 'smooth', 
      }
    }
};

export interface ScrollPosition { top: number, left: number };

const savings = new Map<string, ScrollPosition>();

export function saveScrollPosition(key: string) {
  savings.set(key, {
    left: window.scrollX,
    top: window.scrollY,
  })
}

export function getScrollPosition(key: string) {
  return savings.get(key);
}

export function routeKey(route: RouteLocationNormalized) {
  return route.meta.name ?? route.path;
}