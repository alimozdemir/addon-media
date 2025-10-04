<script setup lang="ts">
const emit = defineEmits<{ (e: 'select', rootKey: string): void }>();

const { data, status, error } = useFetch('/api/files/roots');

function onSelect(rootKey: string) {
    emit('select', rootKey);
}
</script>

<template>
    <div>
        <div v-if="status === 'pending'">Loading roots...</div>
        <div v-else-if="error">Failed to load roots</div>
        <ul v-else>
            <li v-for="r in data.roots" :key="r.key">
                <button type="button" @click="onSelect(r.key)">{{ r.label }}</button>
            </li>
        </ul>
    </div>
    
</template>


