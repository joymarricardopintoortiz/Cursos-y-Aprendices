<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { cursosService } from '../services/cursos.service'
import { aprendicesService } from '../services/aprendices.service'
import { useNotify } from '../composables/useNotify'
import { useAuthStore } from '../stores/auth'
import { useSolicitudesStore } from '../stores/solicitudes'
import { useQuasar } from 'quasar'
import TablaCursos from '../components/cursos/TablaCursos.vue'
import FormCurso from '../components/cursos/FormCurso.vue'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'

const { ok, error, aviso } = useNotify()
const auth = useAuthStore()
const $q = useQuasar()

const cursos = ref([])
const cargando = ref(false)
const buscar = ref('')
const filtroEstado = ref(auth.esAdmin ? null : 0)
const dialogoForm = ref(false)
const dialogoConfirm = ref(false)
const accionConfirm = ref('desactivar')
const seleccionado = ref(null)
const solicitudesStore = useSolicitudesStore()
const { solicitudes } = storeToRefs(solicitudesStore)

// Cursos en los que mi documento ya figura como aprendiz en la BD.
const aprendizCursoIds = ref([])

// Cursos donde ya soy ACEPTADO o donde ya existo como aprendiz en la base
// (el admin pudo haberme creado directamente, sin solicitud). En esos casos
// el boton queda "Matriculado" y no se puede volver a pedir.
const matriculadosIds = computed(() => {
  const porSolicitud = solicitudes.value
    .filter((s) => s.usuarioEmail === auth.usuario?.email && s.estado === 'aceptada')
    .map((s) => s.cursoId)
  return [...new Set([...porSolicitud, ...aprendizCursoIds.value])]
})

// Cursos con solicitud en curso (pendiente de respuesta del admin).
const solicitadosIds = computed(() =>
  solicitudes.value
    .filter((s) => s.usuarioEmail === auth.usuario?.email && s.estado === 'pendiente')
    .map((s) => s.cursoId),
)

const cargarMisMatriculas = async () => {
  if (auth.esAdmin) return // los admin no ven la columna de matricula
  try {
    const { data } = await aprendicesService.listar()
    const miDoc = String(auth.documento ?? '').trim()
    if (!miDoc) return
    aprendizCursoIds.value = data
      .filter((a) => String(a.documento ?? '').trim() === miDoc)
      .map((a) => a.curso?._id)
  } catch {
    // sin la lista el boton decide con las solicitudes; el backend sigue
    // siendo la ultima barrera si hay un duplicado.
  }
}

const pedirMatricula = (curso) => {
  if (!auth.documento) {
    aviso('Debes registrar tu documento en tu perfil para poder matricularte. Ve a "Mi perfil" y guárdalo primero.')
    return
  }
  seleccionado.value = curso
  $q.dialog({
    title: 'Matricularme',
    message: `¿Desea matricularse en el curso "${curso.nombre}"? Se usará tu documento "${auth.documento}" registrado en tu perfil y se enviará una solicitud al administrador para su aprobación.`,
    ok: 'Matricularme',
    cancel: 'Cancelar',
    persistent: true,
  }).onOk(() => confirmarMatricula())
}

const confirmarMatricula = () => {
  const creada = solicitudesStore.crearSolicitud({
    usuarioNombre: auth.usuario?.nombre,
    usuarioEmail: auth.usuario?.email,
    usuarioDocumento: auth.documento,
    cursoId: seleccionado.value._id,
    cursoNombre: seleccionado.value.nombre,
  })
  if (creada) {
    ok('Solicitud de matrícula enviada. Espera la confirmación del administrador.')
  }
}

const opcionesEstado = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: 0 },
  { label: 'Inactivos', value: 1 },
]

const cargar = async () => {
  cargando.value = true
  try {
    const { data } = await cursosService.listar(filtroEstado.value ?? undefined)
    cursos.value = auth.esAdmin ? data : data.filter((c) => c.status === 0)
  } catch (e) {
    error(e)
  } finally {
    cargando.value = false
  }
}

const nuevo = () => {
  seleccionado.value = null
  dialogoForm.value = true
}

const editar = (curso) => {
  seleccionado.value = curso
  dialogoForm.value = true
}

const guardado = () => {
  dialogoForm.value = false
  cargar()
}

const pedirConfirmacion = (curso, accion) => {
  seleccionado.value = curso
  accionConfirm.value = accion
  dialogoConfirm.value = true
}

const desactivar = async () => {
  try {
    const { data } = await cursosService.desactivar(seleccionado.value._id)
    aviso(data.msg)
    cargar()
  } catch (e) {
    error(e)
  }
}

const activar = async (curso) => {
  try {
    const { data } = await cursosService.activar(curso._id)
    ok(data.msg)
    cargar()
  } catch (e) {
    error(e)
  }
}

const confirmarAccion = () => {
  if (accionConfirm.value === 'activar') {
    activar(seleccionado.value)
  } else {
    desactivar()
  }
}

watch(filtroEstado, cargar)
onMounted(() => {
  cargar()
  cargarMisMatriculas()
})
</script>

<template>
  <q-page class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Cursos</h1>
        <p class="page-sub">{{ auth.esAdmin ? 'Gestión de cursos de formación' : 'Cursos disponibles' }}</p>
      </div>
      <q-btn v-if="auth.esAdmin" unelevated color="primary" icon="add" label="Nuevo curso" @click="nuevo" />
    </div>

    <div class="filtros">
      <q-input outlined dense v-model="buscar" label="Buscar" clearable>
        <template #prepend><q-icon name="search" /></template>
      </q-input>
      <q-select v-if="auth.esAdmin" outlined dense v-model="filtroEstado" :options="opcionesEstado" label="Estado" emit-value map-options />
    </div>

    <tabla-cursos
      :rows="cursos"
      :loading="cargando"
      :filtro="buscar || ''"
      :admin="auth.esAdmin"
      :matriculados-ids="matriculadosIds"
      :solicitados-ids="solicitadosIds"
      @editar="editar"
      @activar="pedirConfirmacion($event, 'activar')"
      @desactivar="pedirConfirmacion($event, 'desactivar')"
      @matricular="pedirMatricula"
    />

    <q-dialog v-model="dialogoForm" persistent>
      <form-curso :curso="seleccionado" @guardado="guardado" @cancelar="dialogoForm = false" />
    </q-dialog>

    <confirm-dialog
      v-model="dialogoConfirm"
      :mensaje="`¿Desea ${accionConfirm} el curso ${seleccionado?.nombre ?? ''}?`"
      :texto-boton="accionConfirm === 'activar' ? 'Activar' : 'Desactivar'"
      :tipo="accionConfirm === 'activar' ? 'positive' : 'negative'"
      @confirmar="confirmarAccion"
    />
  </q-page>
</template>