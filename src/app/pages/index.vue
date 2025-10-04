<script setup lang="ts">
const { data, status, error } = useFetch('/api/files/paths?root=media');
</script>

<template>
    <div>
        Files
        <pre>{{ data }}</pre>
    </div>
</template>