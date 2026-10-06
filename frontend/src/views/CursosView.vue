<script setup>
import { ref, watch, onMounted } from 'vue'
import { cursosService } from '../services/cursos.service'
import { useNotify } from '../composables/useNotify'
import { useAuthStore } from '../stores/auth'
import TablaCursos from '../components/cursos/TablaCursos.vue'
import FormCurso from '../components/cursos/FormCurso.vue'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'

const { ok, error } = useNotify()
const auth = useAuthStore()

const cursos = ref([])
const cargando = ref(false)
const buscar = ref('')
const filtroEstado = ref(auth.esAdmin ? null : 0)
const dialogoForm = ref(false)
const dialogoConfirm = ref(false)
const seleccionado = ref(null)

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

const pedirDesactivar = (curso) => {
  seleccionado.value = curso
  dialogoConfirm.value = true
}

const desactivar = async () => {
  try {
    const { data } = await cursosService.desactivar(seleccionado.value._id)
    ok(data.msg)
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

watch(filtroEstado, cargar)
onMounted(cargar)
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
      @editar="editar"
      @activar="activar"
      @desactivar="pedirDesactivar"
    />

    <q-dialog v-model="dialogoForm" persistent>
      <form-curso :curso="seleccionado" @guardado="guardado" @cancelar="dialogoForm = false" />
    </q-dialog>

    <confirm-dialog
      v-model="dialogoConfirm"
      :mensaje="`¿Desea desactivar el curso ${seleccionado?.nombre ?? ''}?`"
      texto-boton="Desactivar"
      @confirmar="desactivar"
    />
  </q-page>
</template>