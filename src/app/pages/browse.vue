<script setup lang="ts">
import Browse from '~/components/Browse/Index.vue'
const playlist = usePlaylist();

onMounted(() => {
    playlist.refresh();
});

</script>

<template>
    <Browse />
    
</template>


