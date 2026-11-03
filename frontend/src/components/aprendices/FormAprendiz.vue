<script setup>
import { ref, onMounted, watch } from 'vue'
import { aprendicesService } from '../../services/aprendices.service'
import { cursosService } from '../../services/cursos.service'
import { useNotify } from '../../composables/useNotify'
import ErrorList from '../shared/ErrorList.vue'

const props = defineProps({
  aprendiz: { type: Object, default: null },
})
const emit = defineEmits(['guardado', 'cancelar'])

const { ok, error, listaErrores } = useNotify()

const form = ref({
  documento: props.aprendiz?.documento ?? '',
  nombre: props.aprendiz?.nombre ?? '',
  email: props.aprendiz?.email ?? '',
  curso: props.aprendiz?.curso?._id ?? null,
})
const opcionesCurso = ref([])
const errores = ref([])
const guardando = ref(false)
// Aprendices ya registrados en la base, para validar ANTES de enviar y no
// provocar un 400 en la consola del navegador.
const aprendicesCargados = ref([])
const documentoRef = ref(null)

const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Campo obligatorio'
const emailValido = (v) => /^[^\s@]+@sena\.edu\.co$/i.test((v || '').trim()) || 'Solo se permiten correos @sena.edu.co'

// Regla del campo Documento: el mismo aprendiz puede estar en varios cursos,
// pero NO dos veces en el MISMO curso. Si ya esta matriculado en el curso
// seleccionado (y no es el aprendiz que se esta editando) se muestra el error
// a nivel de campo sin hacer el POST.
const documentoNoRepetido = (v) => {
  const doc = String(v ?? '').trim()
  const curso = form.value.curso
  if (!curso) return true // el campo curso obligatorio se encarga
  const repetido = aprendicesCargados.value.some(
    (a) =>
      String(a.documento ?? '').trim() === doc &&
      a.curso?._id === curso &&
      a._id !== props.aprendiz?._id,
  )
  return !repetido || 'Este aprendiz ya está matriculado en este curso'
}

// Al cambiar el curso se revalida el documento: el error del curso anterior
// debe desaparecer (o aparecer) en el momento.
watch(
  () => form.value.curso,
  async () => {
    await documentoRef.value?.validate()
  },
)

onMounted(async () => {
  try {
    const [cursos, aprendices] = await Promise.all([
      cursosService.listar(0),
      aprendicesService.listar(),
    ])
    opcionesCurso.value = cursos.data.map((c) => ({ label: `${c.codigo} - ${c.nombre}`, value: c._id }))
    // Lista completa sin filtros: la lista de la vista puede venir filtrada por
    // curso/estado y ocultaria matriculaciones repetidas en otros cursos.
    aprendicesCargados.value = aprendices.data
  } catch (e) {
    error(e)
  }
})

const guardar = async () => {
  errores.value = []
  guardando.value = true
  try {
    const { data } = props.aprendiz
      ? await aprendicesService.actualizar(props.aprendiz._id, form.value)
      : await aprendicesService.crear(form.value)
    ok(data.msg)
    emit('guardado')
  } catch (e) {
    errores.value = listaErrores(e)
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <q-card class="dialog-card">
    <q-form novalidate @submit="guardar">
      <q-card-section class="dialog-titulo">{{ aprendiz ? 'Editar aprendiz' : 'Nuevo aprendiz' }}</q-card-section>
      <q-card-section class="form-grid">
        <q-input
          ref="documentoRef"
          outlined
          dense
          v-model="form.documento"
          label="Documento"
          :rules="[req, documentoNoRepetido]"
        />
        <q-input outlined dense v-model="form.nombre" label="Nombre completo" :rules="[req]" />
        <q-input outlined dense v-model="form.email" type="email" label="Email" class="completo" :rules="[req, emailValido]" />
        <q-select
          outlined
          dense
          v-model="form.curso"
          :options="opcionesCurso"
          label="Curso"
          class="completo"
          emit-value
          map-options
          :rules="[req]"
        />
      </q-card-section>
      <q-card-section v-if="errores.length">
        <error-list :errores="errores" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="emit('cancelar')" />
        <q-btn unelevated color="primary" type="submit" label="Guardar" :loading="guardando" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>
