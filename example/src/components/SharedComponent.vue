<script lang="ts" setup>
import { onMounted } from 'vue'

onMounted(() => {
    console.info('Hello World')
})
</script>

<template>
    <div>
        <h2>
            Shared Component
        </h2>
    </div>
</template>

<style lang="scss" scoped>
h2{
    color: red;
}
</style>
