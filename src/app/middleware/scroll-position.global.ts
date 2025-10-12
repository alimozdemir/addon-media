import { routeKey, saveScrollPosition } from "~/router.options";

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client && from.meta.scrollSave) {
    saveScrollPosition(routeKey(from));
  }
})
