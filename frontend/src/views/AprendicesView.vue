<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { aprendicesService } from '../services/aprendices.service'
import { cursosService } from '../services/cursos.service'
import { useNotify } from '../composables/useNotify'
import TablaAprendices from '../components/aprendices/TablaAprendices.vue'
import FormAprendiz from '../components/aprendices/FormAprendiz.vue'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'

const { ok, error } = useNotify()

const aprendices = ref([])
const cursos = ref([])
const cargando = ref(false)
const buscar = ref('')
const filtroEstado = ref(null)
const filtroCurso = ref(null)
const dialogoForm = ref(false)
const dialogoConfirm = ref(false)
const seleccionado = ref(null)

const opcionesEstado = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: 0 },
  { label: 'Inactivos', value: 1 },
]

const opcionesCurso = computed(() => [
  { label: 'Todos los cursos', value: null },
  ...cursos.value.map((c) => ({ label: `${c.codigo} - ${c.nombre}`, value: c._id })),
])

const cargar = async () => {
  cargando.value = true
  try {
    const { data } = filtroCurso.value
      ? await aprendicesService.porCurso(filtroCurso.value)
      : await aprendicesService.listar(filtroEstado.value ?? undefined)
    aprendices.value = data
  } catch (e) {
    error(e)
  } finally {
    cargando.value = false
  }
}

const cargarCursos = async () => {
  try {
    const { data } = await cursosService.listar()
    cursos.value = data
  } catch (e) {
    error(e)
  }
}

const nuevo = () => {
  seleccionado.value = null
  dialogoForm.value = true
}

const editar = (aprendiz) => {
  seleccionado.value = aprendiz
  dialogoForm.value = true
}

const guardado = () => {
  dialogoForm.value = false
  cargar()
}

const pedirDesactivar = (aprendiz) => {
  seleccionado.value = aprendiz
  dialogoConfirm.value = true
}

const desactivar = async () => {
  try {
    const { data } = await aprendicesService.desactivar(seleccionado.value._id)
    ok(data.msg)
    cargar()
  } catch (e) {
    error(e)
  }
}

const activar = async (aprendiz) => {
  try {
    const { data } = await aprendicesService.activar(aprendiz._id)
    ok(data.msg)
    cargar()
  } catch (e) {
    error(e)
  }
}

watch([filtroEstado, filtroCurso], cargar)

onMounted(() => {
  cargarCursos()
  cargar()
})
</script>

<template>
  <q-page class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Aprendices</h1>
        <p class="page-sub">Gestión de aprendices por curso</p>
      </div>
      <q-btn unelevated color="primary" icon="add" label="Nuevo aprendiz" @click="nuevo" />
    </div>

    <div class="filtros">
      <q-input outlined dense v-model="buscar" label="Buscar" clearable>
        <template #prepend><q-icon name="search" /></template>
      </q-input>
      <q-select outlined dense v-model="filtroCurso" :options="opcionesCurso" label="Curso" emit-value map-options />
      <q-select
        outlined
        dense
        v-model="filtroEstado"
        :options="opcionesEstado"
        label="Estado"
        emit-value
        map-options
        :disable="!!filtroCurso"
      />
    </div>

    <tabla-aprendices
      :rows="aprendices"
      :loading="cargando"
      :filtro="buscar || ''"
      @editar="editar"
      @activar="activar"
      @desactivar="pedirDesactivar"
    />

    <q-dialog v-model="dialogoForm" persistent>
      <form-aprendiz :aprendiz="seleccionado" @guardado="guardado" @cancelar="dialogoForm = false" />
    </q-dialog>

    <confirm-dialog
      v-model="dialogoConfirm"
      :mensaje="`¿Desea desactivar al aprendiz ${seleccionado?.nombre ?? ''}?`"
      texto-boton="Desactivar"
      @confirmar="desactivar"
    />
  </q-page>
</template>