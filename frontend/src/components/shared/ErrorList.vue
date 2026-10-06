<script setup>
defineProps({
  errores: { type: Array, default: () => [] },
})
</script>

<template>
  <ul v-if="errores.length" class="error-list">
    <li v-for="(err, i) in errores" :key="i">{{ err }}</li>
  </ul>
</template>