<script setup>
defineProps({
  modelValue: Boolean,
  mensaje: { type: String, default: '' },
  textoBoton: { type: String, default: 'Confirmar' },
  tipo: { type: String, default: 'negative' },
})
const emit = defineEmits(['update:modelValue', 'confirmar'])
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-chico">
      <q-card-section class="dialog-titulo">Confirmar acción</q-card-section>
      <q-card-section>{{ mensaje }}</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn unelevated color="negative" :label="textoBoton" v-close-popup @click="emit('confirmar')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>