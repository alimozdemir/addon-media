<script setup lang="ts">
import SearchInput from './SearchInput.vue'

const groups = defineModel<string[]>({ default: [] })
const filter = defineModel<'all' | 'film' | 'tv-series'>('filter', { default: 'all' })
const query = defineModel<string>('query', { default: '' })
const emit = defineEmits<{ (e: 'submit', value: string): void }>()
const props = defineProps<{ options: string[] }>()

const expanded = ref(false)
const showOverlay = ref(false)

function toggleGroup(g: string) {
  const idx = groups.value.indexOf(g)
  if (idx >= 0) groups.value.splice(idx, 1)
  else groups.value.push(g)
}

function handleSubmit(val: string) {
  emit('submit', val)
  showOverlay.value = false
}

const visibleOptions = computed(() => expanded.value ? props.options : props.options.slice(0, 3))
</script>

<template>
  <!-- Desktop/Tablet: show inline group chips as before -->
  <div class="hidden sm:flex items-center gap-1 flex-nowrap overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
    <button
      v-for="g in visibleOptions"
      :key="g"
      type="button"
      class="px-2 h-7 rounded-full border text-xs whitespace-nowrap max-w-[12rem] truncate"
      :class="groups.includes(g) ? 'bg-muted border-border text-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'"
      @click="toggleGroup(g)"
    >
      <span class="inline-block max-w-full truncate align-middle">{{ g }}</span>
    </button>
    <button
      v-if="props.options.length > 3"
      type="button"
      class="px-2 h-7 rounded-full border border-border text-xs text-muted-foreground hover:bg-muted inline-flex items-center gap-1 whitespace-nowrap"
      @click="expanded = !expanded"
    >
      <i-plus v-if="!expanded" />
      <i-minus v-else />
      <span>{{ expanded ? 'Less' : 'More' }}</span>
    </button>
  </div>

  <!-- Mobile: Floating action button to open overlay -->
  <button
    type="button"
    class="sm:hidden fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    @click="showOverlay = true"
    aria-label="Open filters"
  >
    <i-funnel class="w-5 h-5" />
    <span class="sr-only">Open filters</span>
  </button>

  <!-- Mobile overlay -->
  <Teleport to="body">
    <div v-if="showOverlay" class="sm:hidden fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="showOverlay = false"></div>
      <div class="absolute inset-x-0 top-0 bottom-0 bg-card rounded-t-2xl p-4 overflow-y-auto">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-medium">Filters</div>
          <button type="button" class="px-3 h-8 rounded border border-border text-sm text-muted-foreground hover:bg-muted" @click="showOverlay = false">Close</button>
        </div>

        <!-- Search first -->
        <SearchInput v-model="query" @submit="handleSubmit" />

        <!-- Type filter toggles (from TopBar) -->
        <div class="mt-4 inline-flex items-center gap-1 p-1 rounded-[--radius] border border-border bg-background overflow-x-auto no-scrollbar">
          <button type="button"
            class="px-2 h-8 rounded text-sm whitespace-nowrap"
            :class="filter === 'all' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'"
            @click="filter = 'all'">All</button>
          <button type="button"
            class="px-2 h-8 rounded text-sm whitespace-nowrap"
            :class="filter === 'film' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'"
            @click="filter = 'film'">Film</button>
          <button type="button"
            class="px-2 h-8 rounded text-sm whitespace-nowrap"
            :class="filter === 'tv-series' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'"
            @click="filter = 'tv-series'">TV Series</button>
        </div>

        <!-- Group filters -->
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="g in props.options"
            :key="g"
            type="button"
            class="px-3 h-8 rounded-full border text-sm whitespace-nowrap max-w-[16rem] truncate"
            :class="groups.includes(g) ? 'bg-muted border-border text-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'"
            @click="toggleGroup(g)"
          >
            <span class="inline-block max-w-full truncate align-middle">{{ g }}</span>
          </button>
        </div>

        <div class="h-16"></div>
      </div>
    </div>
  </Teleport>
</template>


