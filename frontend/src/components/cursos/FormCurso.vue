<script setup>
import { ref } from 'vue'
import { cursosService } from '../../services/cursos.service'
import { useNotify } from '../../composables/useNotify'
import ErrorList from '../shared/ErrorList.vue'

const props = defineProps({
  curso: { type: Object, default: null },
})
const emit = defineEmits(['guardado', 'cancelar'])

const { ok, listaErrores } = useNotify()

const form = ref({
  codigo: props.curso?.codigo ?? '',
  nombre: props.curso?.nombre ?? '',
  duracion: props.curso?.duracion ?? null,
})
const errores = ref([])
const guardando = ref(false)

const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Campo obligatorio'
const positivo = (v) => v > 0 || 'Debe ser mayor a 0'

const guardar = async () => {
  errores.value = []
  guardando.value = true
  try {
    const { data } = props.curso
      ? await cursosService.actualizar(props.curso._id, form.value)
      : await cursosService.crear(form.value)
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
      <q-card-section class="dialog-titulo">{{ curso ? 'Editar curso' : 'Nuevo curso' }}</q-card-section>
      <q-card-section class="form-grid">
        <q-input outlined dense v-model="form.codigo" label="Código" :rules="[req]" />
        <q-input outlined dense v-model.number="form.duracion" type="number" label="Duración (horas)" :rules="[req, positivo]" />
        <q-input outlined dense v-model="form.nombre" label="Nombre" class="completo" :rules="[req]" />
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