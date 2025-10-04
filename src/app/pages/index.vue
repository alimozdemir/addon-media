<script setup lang="ts">
const router = useRouter();
onMounted(() => {
    router.replace('/files');
});
</script>

<template>
    <div class="text-sm text-muted-foreground">Redirecting to Files...</div>
</template>