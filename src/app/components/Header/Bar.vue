<script setup lang="ts">
const route = useRoute();
import RefreshMenu from './RefreshMenu.vue'
</script>
<template>
    <header class="sticky top-0 z-10 bg-card border-b border-border">
        <div class="mx-auto max-w-screen-2xl px-4">
            <div class="h-12 flex items-center gap-2">
                <div class="font-semibold">Addon Media</div>
                <nav class="ml-auto flex items-center gap-1">
                    <NuxtLink
                        to="/browse"
                        class="inline-flex items-center gap-2 px-3 h-8 rounded-[--radius] hover:bg-muted transition"
                        :class="route.path.startsWith('/browse') ? 'bg-muted text-foreground' : 'text-muted-foreground'"
                    >
                        <i-compass />
                        <span class="text-sm">Browse</span>
                    </NuxtLink>
                    <NuxtLink
                        to="/files"
                        class="inline-flex items-center gap-2 px-3 h-8 rounded-[--radius] hover:bg-muted transition"
                        :class="route.path.startsWith('/files') ? 'bg-muted text-foreground' : 'text-muted-foreground'"
                    >
                        <i-folders />
                        <span class="text-sm">Files</span>
                    </NuxtLink>
                    <NuxtLink
                        to="/settings"
                        class="inline-flex items-center gap-2 px-3 h-8 rounded-[--radius] hover:bg-muted transition"
                        :class="route.path.startsWith('/settings') ? 'bg-muted text-foreground' : 'text-muted-foreground'"
                    >
                        <i-gear />
                        <span class="text-sm">Settings</span>
                    </NuxtLink>
                </nav>
                <RefreshMenu />
            </div>
        </div>
    </header>
</template>