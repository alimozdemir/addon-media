<script setup lang="ts">
import Roots from './Roots.vue';
import Breadcrumbs from './Breadcrumbs.vue';
import List from './List.vue';
import type { FileEntry } from '~~/types/files';

type ApiResponse = {
    root: string;
    current: string;
    paths: FileEntry[];
    error?: string;
};

const selectedRoot = ref<string | null>(null);
const currentPath = ref<string | null>(null);

const apiPath = computed(() => {
    if (!selectedRoot.value) return null;
    // visible label shown in API is built as /root[/subpath] or ~[/subpath]
    // but API expects rootKey and subpath via "path" as rootKey/subpath
    const label = currentPath.value ?? (selectedRoot.value === 'home' ? '~' : `/${selectedRoot.value}`);
    // Derive the path param from internal state
    const parts = label.replace(/^~\/?/, 'home/').replace(/^\//, '');
    return `/api/files/paths?path=${encodeURIComponent(parts)}`;
});

const { data, status, error, refresh } = useFetch<ApiResponse>(() => apiPath.value!, { immediate: false });

function handleSelectRoot(rootKey: string) {
    selectedRoot.value = rootKey;
    currentPath.value = rootKey; // start at root
    refresh();
}

function handleOpen(entry: { name: string; type: string; path: string }) {
    if (entry.type !== 'directory') return;
    // entry.path is visible label like /media/Tv or ~/Documents
    const parts = entry.path.replace(/^~\/?/, 'home/').replace(/^\//, '');
    currentPath.value = parts;
    refresh();
}

function handleNavigate(labelPath: string) {
    // labelPath built from Breadcrumbs based on visible label; normalize to API path
    const normalized = labelPath.replace(/^~\/?/, 'home/').replace(/^\//, '');
    currentPath.value = normalized;
    selectedRoot.value = normalized.split('/')[0] || null;
    refresh();
}
</script>
<template>
    <section class="h-[min(80vh,700px)] border border-border rounded-[--radius] bg-card grid grid-cols-12 overflow-hidden">
        <aside class="col-span-3 lg:col-span-2 border-r border-border bg-background min-h-0 overflow-auto">
            <div class="px-3 py-2 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">Locations</div>
            <Roots @select="handleSelectRoot" />
        </aside>

        <main class="col-span-9 lg:col-span-10 p-4 min-h-0 min-w-0 overflow-auto">
            <div class="mb-3 flex items-center justify-between">
                <Breadcrumbs v-if="data?.root" :visible-root-label="data.root" @navigate="handleNavigate" />
            </div>

            <div v-if="status === 'pending'" class="text-sm text-muted-foreground">Loading...</div>
            <div v-else-if="error" class="text-sm text-destructive">{{ error?.message || 'Failed to load' }}</div>
            <List v-else-if="data?.paths" :entries="data.paths" @open="handleOpen" />
        </main>
    </section>
</template>