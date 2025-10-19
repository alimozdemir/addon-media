<script setup lang="ts">
const { $pwa } = useNuxtApp()
const dismissed = ref(false)

function handleReload() {
  $pwa?.updateServiceWorker()
}

function handleDismiss() {
  dismissed.value = true
}
</script>

<template>
  <div
    v-show="$pwa?.needRefresh && !dismissed"
    class="fixed inset-x-0 bottom-4 z-50 px-4"
    role="status"
    aria-live="polite"
  >
    <div class="mx-auto max-w-xl rounded-[--radius] border border-border bg-popover/95 supports-[backdrop-filter]:bg-popover/80 backdrop-blur shadow-md p-3 sm:p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-foreground">
          New content is available.
        </p>
        <div class="inline-flex items-center gap-2">
          <button
            type="button"
            class="px-3 h-8 rounded border border-border text-sm text-muted-foreground hover:bg-muted"
            @click="handleDismiss"
          >
            Dismiss
          </button>
          <button
            type="button"
            class="px-3 h-8 rounded border border-border text-sm bg-primary text-primary-foreground hover:bg-muted"
            @click="handleReload"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>