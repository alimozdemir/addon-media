<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from 'reka-ui'

dayjs.extend(relativeTime)

const playlist = usePlaylist()

const lastFromNow = computed(() => {
  const ts = playlist.lastRefreshedAt.value
  return ts ? dayjs(ts).fromNow() : 'Never'
})

const elapsedText = computed(() => {
  const ms = playlist.elapsedMs.value
  if (typeof ms !== 'number' || !isFinite(ms)) return 'N/A'
  if (ms < 1000) return `${ms} ms`
  const secs = (ms / 1000).toFixed(1)
  return `${secs} seconds`
})

async function handleRefresh() {
  if (playlist.loading.value) return
  await playlist.refresh()
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <button
        class="inline-flex items-center justify-center w-8 h-8 rounded-[--radius] hover:bg-muted text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Playlist options"
      >
        <i-dots-three-vertical />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      :side-offset="6"
      class="min-w-[320px] rounded-[--radius] border border-border bg-popover/95 supports-[backdrop-filter]:bg-popover/80 backdrop-blur shadow-md p-1"
    >
      <DropdownMenuItem class="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-muted cursor-default pointer-events-none">
        <span class="text-xs uppercase tracking-wide text-muted-foreground">Last refresh</span>
        <span class="text-sm text-foreground">{{ lastFromNow }}</span>
      </DropdownMenuItem>
      <DropdownMenuItem class="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-muted cursor-default pointer-events-none">
        <span class="text-xs uppercase tracking-wide text-muted-foreground">Duration</span>
        <span class="text-sm text-foreground">{{ elapsedText }}</span>
      </DropdownMenuItem>
      <div class="h-px bg-border my-1" />
      <DropdownMenuItem
        :aria-disabled="playlist.loading.value"
        class="px-2.5 py-1.5 rounded hover:bg-muted focus:bg-muted text-sm"
        @click="handleRefresh"
      >
        <span>Refresh now</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuRoot>
  
</template>


