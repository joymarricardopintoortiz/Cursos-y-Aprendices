<script setup>
import { useSolicitudes } from '../composables/useSolicitudes'
import { useNotify } from '../composables/useNotify'

const { solicitudes, recargar, cambiarEstado } = useSolicitudes()
const { ok } = useNotify()

const columnas = [
  { name: 'usuario', label: 'Usuario', field: 'usuarioNombre', align: 'left' },
  { name: 'curso', label: 'Curso', field: 'cursoNombre', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'center' },
]

recargar()

const aceptar = (s) => {
  cambiarEstado(s.id, 'aceptada')
  ok(`Solicitud de ${s.usuarioNombre} aceptada`)
}
const rechazar = (s) => {
  cambiarEstado(s.id, 'rechazada')
  ok(`Solicitud de ${s.usuarioNombre} rechazada`)
}
</script>

<template>
  <q-page class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Solicitudes de matrícula</h1>
        <p class="page-sub">Aceptar o rechazar las solicitudes de los aprendices</p>
      </div>
      <q-btn flat color="primary" icon="refresh" label="Actualizar" @click="recargar" />
    </div>

    <q-table
      class="tabla"
      flat
      row-key="id"
      :rows="solicitudes"
      :columns="columnas"
      rows-per-page-label="Filas por página"
      no-data-label="No hay solicitudes"
    >
      <template #body-cell-estado="p">
        <q-td :props="p">
          <q-badge :color="p.row.estado === 'aceptada' ? 'positive' : p.row.estado === 'rechazada' ? 'negative' : 'warning'">
            {{ p.row.estado }}
          </q-badge>
        </q-td>
      </template>
      <template #body-cell-acciones="p">
        <q-td :props="p">
          <q-btn v-if="p.row.estado === 'pendiente'" flat round dense icon="check_circle" color="positive" title="Aceptar" @click="aceptar(p.row)" />
          <q-btn v-if="p.row.estado === 'pendiente'" flat round dense icon="cancel" color="negative" title="Rechazar" @click="rechazar(p.row)" />
          <span v-else class="text-grey">Finalizada</span>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>
