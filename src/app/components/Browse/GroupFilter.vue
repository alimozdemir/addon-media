<script setup lang="ts">
const groups = defineModel<string[]>({ default: [] })
const props = defineProps<{ options: string[] }>()

const expanded = ref(false)

function toggleGroup(g: string) {
  const idx = groups.value.indexOf(g)
  if (idx >= 0) groups.value.splice(idx, 1)
  else groups.value.push(g)
}

const visibleOptions = computed(() => expanded.value ? props.options : props.options.slice(0, 3))
</script>

<template>
  <div class="flex items-center gap-1 flex-nowrap overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
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
</template>


