<script setup>
import { ref, computed } from 'vue'
import EstadoBadge from '../shared/EstadoBadge.vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: Boolean,
  filtro: { type: String, default: '' },
  admin: { type: Boolean, default: true },
  matriculadosIds: { type: Array, default: () => [] },
})
const emit = defineEmits(['editar', 'activar', 'desactivar', 'matricular'])

const paginacion = ref({ rowsPerPage: 10 })

const columnas = computed(() => {
  const base = [
    { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
    { name: 'duracion', label: 'Duración (h)', field: 'duracion', align: 'center', sortable: true },
    { name: 'status', label: 'Estado', field: 'status', align: 'center' },
    { name: 'acciones', label: 'Acciones', field: '_id', align: 'center' },
  ]
  return props.admin
    ? base
    : [
        ...base.filter((c) => c.name !== 'acciones'),
        { name: 'matricula', label: 'Matrícula', field: '_id', align: 'center' },
      ]
})
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
    <template #body-cell-matricula="p">
      <q-td :props="p">
        <q-btn
          v-if="matriculadosIds.includes(p.row._id)"
          unelevated
          disabled
          dense
          icon="how_to_reg"
          label="Solicitado"
          color="grey-5"
        />
        <q-btn v-else unelevated color="primary" dense icon="how_to_reg" label="Matricularme" @click="emit('matricular', p.row)" />
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