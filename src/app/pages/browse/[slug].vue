<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSearch } from '~/composables/useSearch'
import Detail from '~/components/Browse/Detail/Index.vue'

const route = useRoute()
const search = useSearch()

const slug = computed(() => String(route.params.slug || ''))
const item = ref<any>(null)
const loading = ref(false)

definePageMeta({
  keepalive: true
})

onMounted(async () => {
    loading.value = true
    try {
        item.value = await search.getByTitleLower(slug.value)
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <section class="py-4">
        <div class="mb-4">
            <NuxtLink to="/browse" class="text-sm text-muted-foreground hover:underline">← Back to browse</NuxtLink>
        </div>
        <div v-if="loading" class="text-sm text-muted-foreground">Loading…</div>
        <div v-else-if="!item" class="text-sm text-muted-foreground">Not found</div>
        <Detail v-else :item="item" />
    </section>
    
</template>


