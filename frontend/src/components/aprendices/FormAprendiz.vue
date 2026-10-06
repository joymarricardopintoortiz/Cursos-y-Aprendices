<script setup>
import { ref, onMounted } from 'vue'
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

const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Campo obligatorio'
const emailValido = (v) => /.+@.+\..+/.test(v) || 'Email no válido'

onMounted(async () => {
  try {
    const { data } = await cursosService.listar(0)
    opcionesCurso.value = data.map((c) => ({ label: `${c.codigo} - ${c.nombre}`, value: c._id }))
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
    <q-form @submit="guardar">
      <q-card-section class="dialog-titulo">{{ aprendiz ? 'Editar aprendiz' : 'Nuevo aprendiz' }}</q-card-section>
      <q-card-section class="form-grid">
        <q-input outlined dense v-model="form.documento" label="Documento" :rules="[req]" />
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