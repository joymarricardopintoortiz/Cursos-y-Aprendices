<script setup>
defineProps({
  status: { type: Number, default: 0 },
})
</script>

<template>
  <q-badge :color="status === 0 ? 'positive' : 'grey-7'" :label="status === 0 ? 'Activo' : 'Inactivo'" />
</template>