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
    <nav>
        <span v-for="(s, i) in segments" :key="s.path">
            <button type="button" @click="emit('navigate', s.path)">{{ s.label }}</button>
            <span v-if="i < segments.length - 1"> / </span>
        </span>
    </nav>
</template>


