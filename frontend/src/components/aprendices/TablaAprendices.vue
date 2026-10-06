<script setup>
import { ref } from 'vue'
import EstadoBadge from '../shared/EstadoBadge.vue'

defineProps({
  rows: { type: Array, default: () => [] },
  loading: Boolean,
  filtro: { type: String, default: '' },
})
const emit = defineEmits(['editar', 'activar', 'desactivar'])

const paginacion = ref({ rowsPerPage: 10 })

const columnas = [
  { name: 'documento', label: 'Documento', field: 'documento', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'curso', label: 'Curso', field: (row) => row.curso?.nombre ?? 'Sin curso', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '_id', align: 'center' },
]
</script>

<template>
  <q-table
    class="tabla"
    flat
    row-key="_id"
    v-model:pagination="paginacion"
    :rows="rows"
    :columns="columnas"
    :loading="loading"
    :filter="filtro"
    rows-per-page-label="Filas por página"
    no-data-label="Sin registros"
  >
    <template #body-cell-status="p">
      <q-td :props="p">
        <estado-badge :status="p.row.status" />
      </q-td>
    </template>
    <template #body-cell-acciones="p">
      <q-td :props="p">
        <q-btn flat round dense icon="edit" title="Editar" @click="emit('editar', p.row)" />
        <q-btn
          v-if="p.row.status === 0"
          flat
          round
          dense
          icon="block"
          title="Desactivar"
          @click="emit('desactivar', p.row)"
        />
        <q-btn v-else flat round dense icon="check_circle" title="Activar" @click="emit('activar', p.row)" />
      </q-td>
    </template>
  </q-table>
</template>