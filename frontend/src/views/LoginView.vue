<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usuariosService } from '../services/usuarios.service'
import { useAuthStore } from '../stores/auth'
import { useNotify } from '../composables/useNotify'
import ErrorList from '../components/shared/ErrorList.vue'
import logo from '../assets/logoSenaVerde-trim.png'

const router = useRouter()
const auth = useAuthStore()
const { listaErrores } = useNotify()

const form = ref({ email: '', password: '' })
const verClave = ref(false)
const cargando = ref(false)
const errores = ref([])

const req = (v) => !!v || 'Campo obligatorio'
const emailValido = (v) => /.+@.+\..+/.test(v) || 'Email no válido'

const ingresar = async () => {
  errores.value = []
  cargando.value = true
  try {
    const { data } = await usuariosService.login(form.value)
    auth.setSesion(data)
    router.push('/')
  } catch (e) {
    errores.value = listaErrores(e)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <q-card class="auth-card">
    <img :src="logo" alt="SENA" class="auth-logo" />
    <h1 class="auth-title">Iniciar sesión</h1>
    <p class="auth-sub">Cursos y Aprendices</p>
    <q-form class="form-col" @submit="ingresar">
      <q-input outlined v-model="form.email" type="email" label="Correo" :rules="[req, emailValido]" />
      <q-input outlined v-model="form.password" :type="verClave ? 'text' : 'password'" label="Contraseña" :rules="[req]">
        <template #append>
          <q-icon :name="verClave ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="verClave = !verClave" />
        </template>
      </q-input>
      <error-list :errores="errores" />
      <q-btn unelevated color="primary" type="submit" label="Ingresar" icon="login" size="md" class="full-width" :loading="cargando" />
      <p class="auth-lema">¡Aprender hoy es construir el país de mañana!</p>
    </q-form>
  </q-card>
</template>