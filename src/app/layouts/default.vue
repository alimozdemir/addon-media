<script setup lang="ts">
import HeaderBar from '../components/Header/Bar.vue';
</script>

<template>
    <div class="min-h-dvh bg-background text-foreground">
        <HeaderBar />
        <main class="mx-auto max-w-screen-2xl px-4 py-6">
            <slot />
        </main>
    </div>
</template>