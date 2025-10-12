<script setup lang="ts">
import Browse from '~/components/Browse/Index.vue'
// Refresh is handled inside the Browse component when needed

definePageMeta({
  keepalive: true
})

</script>

<template>
    <Browse />
    
</template>


