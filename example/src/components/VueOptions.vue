<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        num: {
            type: Number,
            default: () => 1,
        },
    },

    computed: {
        name() {
            return `Options num:${this.num}`
        },
        childNum() {
            return this.num + 1
        },
    },
})
</script>

<template>
    <article>
        <h2>
            {{ name }}
        </h2>

        <VueOptions
            v-if="num < 5"
            :num="childNum"
        />
    </article>
</template>
