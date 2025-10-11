<script setup lang="ts">
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ (e: 'submit', value: string): void }>()

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
        e.preventDefault()
        emit('submit', model.value)
    }
}
</script>

<template>
    <div class="flex items-center gap-2">
        <div class="flex-1">
            <input
                v-model.trim="model"
                type="text"
                placeholder="Search by title..."
                @keydown="handleKeydown"
                class="w-full h-10 px-3 rounded-[--radius] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
        </div>
    </div>
    
</template>


