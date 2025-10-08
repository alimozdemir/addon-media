<script setup lang="ts">
import { usePlaylist } from '~/composable/usePlaylist';

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


