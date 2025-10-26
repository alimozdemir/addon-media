<script setup lang="ts">
const router = useRouter();
onMounted(() => {
    router.replace('/browse');
});
</script>

<template>
    <div class="text-sm text-muted-foreground">Redirecting to Files...</div>
</template>