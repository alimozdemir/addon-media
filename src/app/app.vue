<script lang="ts" setup>
import Update from '~/components/Update.vue'
</script>

<template>
  <NuxtLayout>
    <NuxtPwaManifest />
    <Update />
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>
