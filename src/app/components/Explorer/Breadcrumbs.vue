<script setup lang="ts">
const props = defineProps<{ visibleRootLabel: string }>();
const emit = defineEmits<{ (e: 'navigate', path: string): void }>();

const segments = computed(() => {
    const parts = props.visibleRootLabel.split('/').filter(Boolean);
    const acc: { label: string; path: string }[] = [];
    let current = '';
    for (const p of parts) {
        current = current ? `${current}/${p}` : p;
        acc.push({ label: p, path: current });
    }
    return acc;
});
</script>

<template>
    <nav class="flex items-center gap-1 text-sm text-muted-foreground">
        <span v-for="(s, i) in segments" :key="s.path" class="flex items-center gap-1">
            <button
                type="button"
                class="px-1.5 py-0.5 rounded hover:bg-muted text-foreground"
                @click="emit('navigate', s.path)"
            >
                {{ s.label }}
            </button>
            <i-caret-right v-if="i < segments.length - 1" class="text-muted-foreground" />
        </span>
    </nav>
</template>


