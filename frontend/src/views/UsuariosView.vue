<script setup>
import { ref, nextTick } from 'vue'
import { usuariosService } from '../services/usuarios.service'
import { useNotify } from '../composables/useNotify'
import ErrorList from '../components/shared/ErrorList.vue'

const { ok, listaErrores } = useNotify()

const formRef = ref(null)
const form = ref({ nombre: '', email: '', password: '' })
const verClave = ref(false)
const errores = ref([])
const guardando = ref(false)

const req = (v) => !!v || 'Campo obligatorio'
const emailValido = (v) => /.+@.+\..+/.test(v) || 'Email no válido'
const minimo = (v) => (v && v.length >= 6) || 'Mínimo 6 caracteres'

const guardar = async () => {
  errores.value = []
  guardando.value = true
  try {
    const { data } = await usuariosService.registrar(form.value)
    ok(data.msg)
    form.value = { nombre: '', email: '', password: '' }
    await nextTick()
    formRef.value?.resetValidation()
  } catch (e) {
    errores.value = listaErrores(e)
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <q-page class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Usuarios</h1>
        <p class="page-sub">Crear nuevas cuentas de acceso</p>
      </div>
    </div>

    <q-form ref="formRef" class="form-usuario form-col" @submit="guardar">
      <q-input outlined dense v-model="form.nombre" label="Nombre" :rules="[req]" />
      <q-input outlined dense v-model="form.email" type="email" label="Correo" :rules="[req, emailValido]" />
      <q-input
        outlined
        dense
        v-model="form.password"
        :type="verClave ? 'text' : 'password'"
        label="Contraseña"
        :rules="[req, minimo]"
      >
        <template #append>
          <q-icon :name="verClave ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="verClave = !verClave" />
        </template>
      </q-input>
      <error-list :errores="errores" />
      <q-btn unelevated color="primary" type="submit" label="Crear usuario" :loading="guardando" />
    </q-form>
  </q-page>
</template>