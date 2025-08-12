<script lang="ts" setup>
import { computed } from 'vue'
import SharedComponent from './SharedComponent.vue'

const props = defineProps({
    num: {
        type: Number,
        default: 1,
    },
})

const name = computed(() => `Composition Setup num:${props.num}`)
const childNum = computed(() => props.num + 1)
</script>

<template>
    <article>
        <h2>
            {{ name }}
        </h2>

        <VueCompositionSetup
            v-if="num < 5"
            :num="childNum"
        />

        <SharedComponent />
    </article>
</template>

<style lang="scss" scoped>
h2{
    background-color: green;
    color: white;
}
</style>
