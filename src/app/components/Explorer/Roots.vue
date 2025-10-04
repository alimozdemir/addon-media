<script setup lang="ts">
const emit = defineEmits<{ (e: 'select', rootKey: string): void }>();

const { data, status, error } = useFetch('/api/files/roots');

function onSelect(rootKey: string) {
    emit('select', rootKey);
}
</script>

<template>
    <div class="p-2 space-y-1">
        <div v-if="status === 'pending'" class="text-xs text-muted-foreground px-2">Loading roots...</div>
        <div v-else-if="error" class="text-xs text-destructive px-2">Failed to load roots</div>
        <ul v-else class="space-y-0.5">
            <li v-for="r in (data?.roots || [])" :key="r.key">
                <button
                    type="button"
                    class="w-full flex items-center gap-2 px-2 py-2 rounded-[--radius] hover:bg-muted transition"
                    @click="onSelect(r.key)"
                >
                    <i-folder class="text-primary" />
                    <span class="text-sm">{{ r.label }}</span>
                </button>
            </li>
        </ul>
    </div>
    
</template>


