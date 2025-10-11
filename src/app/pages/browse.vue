<script setup lang="ts">
import Browse from '~/components/Browse/Index.vue'
const playlist = usePlaylist();

onMounted(() => {
    playlist.refresh();
});

watch(playlist.movies, () => {
    console.log(playlist);
});

function getDistinctGroupTitles() {
    const movies = playlist.movies.value
    const groupTitleSet = new Set<string>();
    for (const movie of movies) {
        if (movie.groupTitle) groupTitleSet.add(movie.groupTitle);
    }
    return Array.from(groupTitleSet);
}

</script>

<template>
    <Browse />
    
</template>


