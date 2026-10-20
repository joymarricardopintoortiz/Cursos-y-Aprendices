<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Dialog } from 'quasar'
import { useSolicitudesStore } from '../stores/solicitudes'
import { useNotify } from '../composables/useNotify'
import { aprendicesService } from '../services/aprendices.service'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'

const solicitudesStore = useSolicitudesStore()
const { solicitudes } = storeToRefs(solicitudesStore)
const { ok, error } = useNotify()

const dialogoConfirm = ref(false)
const accionConfirm = ref('aceptar')
const seleccionada = ref(null)

const pendientesCount = computed(() => solicitudes.value.filter((s) => s.estado === 'pendiente').length)

const columnas = [
  { name: 'usuario', label: 'Usuario', field: 'usuarioNombre', align: 'left' },
  { name: 'documento', label: 'Documento', field: (row) => row.usuarioDocumento || '—', align: 'left' },
  { name: 'curso', label: 'Curso', field: 'cursoNombre', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'center' },
]

const etiquetaEstado = (estado) =>
  estado === 'aceptada' ? 'Aceptado' : estado === 'rechazada' ? 'Rechazado' : 'Pendiente'

const crearAprendiz = async (s, documento) => {
  try {
    await aprendicesService.crear({
      documento,
      nombre: s.usuarioNombre,
      email: s.usuarioEmail,
      curso: s.cursoId,
    })
    solicitudesStore.cambiarEstado(s.id, 'aceptada')
    ok(`Se aceptó la solicitud de ${s.usuarioNombre} y se registró en Aprendices`)
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
  ok(`Se rechazó la solicitud de ${s.usuarioNombre}`)
}

const pedirConfirmacion = (s, accion) => {
  seleccionada.value = s
  accionConfirm.value = accion
  dialogoConfirm.value = true
}

const mensajeConfirm = computed(() => {
  if (!seleccionada.value) return ''
  return accionConfirm.value === 'aceptar'
    ? `¿Desea aceptar la solicitud de ${seleccionada.value.usuarioNombre} para el curso ${seleccionada.value.cursoNombre}?`
    : `¿Desea rechazar la solicitud de ${seleccionada.value.usuarioNombre}?`
})

const confirmarAccion = () => {
  if (accionConfirm.value === 'aceptar') {
    aceptar(seleccionada.value)
  } else {
    rechazar(seleccionada.value)
  }
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
          <q-badge
            :color="p.row.estado === 'aceptada' ? 'positive' : p.row.estado === 'rechazada' ? 'negative' : 'warning'"
            :text-color="p.row.estado === 'pendiente' ? 'dark' : 'white'"
            rounded
            class="text-weight-bold q-px-sm q-py-xs"
          >
            <q-icon
              :name="p.row.estado === 'aceptada' ? 'check_circle' : p.row.estado === 'rechazada' ? 'cancel' : 'schedule'"
              size="14px"
              class="q-mr-xs"
            />
            {{ etiquetaEstado(p.row.estado) }}
          </q-badge>
        </q-td>
      </template>
      <template #body-cell-acciones="p">
        <q-td :props="p">
          <q-btn v-if="p.row.estado === 'pendiente'" flat round dense icon="check_circle" color="positive" title="Aceptar" @click="pedirConfirmacion(p.row, 'aceptar')" />
          <q-btn v-if="p.row.estado === 'pendiente'" flat round dense icon="cancel" color="negative" title="Rechazar" @click="pedirConfirmacion(p.row, 'rechazar')" />
          <q-badge v-else color="grey-7" text-color="white" rounded class="text-weight-bold q-px-sm q-py-xs">
            <q-icon name="task_alt" size="14px" class="q-mr-xs" />
            Finalizado
          </q-badge>
        </q-td>
      </template>
    </q-table>

    <confirm-dialog
      v-model="dialogoConfirm"
      :mensaje="mensajeConfirm"
      :texto-boton="accionConfirm === 'aceptar' ? 'Aceptar' : 'Rechazar'"
      :tipo="accionConfirm === 'aceptar' ? 'positive' : 'negative'"
      @confirmar="confirmarAccion"
    />
  </q-page>
</template>
