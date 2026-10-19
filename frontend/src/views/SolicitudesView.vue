<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Dialog } from 'quasar'
import { useSolicitudesStore } from '../stores/solicitudes'
import { useNotify } from '../composables/useNotify'
import { aprendicesService } from '../services/aprendices.service'

const solicitudesStore = useSolicitudesStore()
const { solicitudes } = storeToRefs(solicitudesStore)
const { ok, error } = useNotify()

const pendientesCount = computed(() => solicitudes.value.filter((s) => s.estado === 'pendiente').length)

const columnas = [
  { name: 'usuario', label: 'Usuario', field: 'usuarioNombre', align: 'left' },
  { name: 'documento', label: 'Documento', field: (row) => row.usuarioDocumento || '—', align: 'left' },
  { name: 'curso', label: 'Curso', field: 'cursoNombre', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'center' },
]

const crearAprendiz = async (s, documento) => {
  try {
    await aprendicesService.crear({
      documento,
      nombre: s.usuarioNombre,
      email: s.usuarioEmail,
      curso: s.cursoId,
    })
    solicitudesStore.cambiarEstado(s.id, 'aceptada')
    ok(`Solicitud aceptada. ${s.usuarioNombre} fue añadido a Aprendices`)
  } catch (e) {
    error(e)
  }
}

const aceptar = (s) => {
  if (s.usuarioDocumento) {
    crearAprendiz(s, s.usuarioDocumento)
    return
  }
  Dialog.create({
    title: 'Documento del aprendiz',
    message: `La solicitud de ${s.usuarioNombre} no tiene documento. Ingresa el documento para registrar al aprendiz:`,
    prompt: { model: '', label: 'Documento', isValid: (val) => /^\d{6,12}$/.test(val) },
    ok: 'Registrar',
    cancel: 'Cancelar',
    persistent: true,
  }).onOk((documento) => crearAprendiz(s, documento.trim()))
}

const rechazar = (s) => {
  solicitudesStore.cambiarEstado(s.id, 'rechazada')
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
      <div class="row items-center q-gutter-sm">
        <q-badge v-if="pendientesCount > 0" color="negative" rounded style="font-size: 15px; padding: 4px 10px">
          {{ pendientesCount }} pendientes
        </q-badge>
      </div>
    </div>

    <q-table
      class="tabla tabla-contorno"
      flat
      bordered
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
