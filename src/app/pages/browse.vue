<script setup lang="ts">
const playlist = usePlaylist();

onMounted(() => {
    playlist.refresh();
});

watch(playlist.movies, () => {
    console.log(playlist);
});
</script>

<template>
    
    <pre>
        {{ playlist.movies.value.length }}
    </pre>
    
</template>


