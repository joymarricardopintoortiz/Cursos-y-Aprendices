<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotify } from '../composables/useNotify'
import { useSolicitudes } from '../composables/useSolicitudes'

const auth = useAuthStore()
const { ok } = useNotify()
const { solicitudes, recargar } = useSolicitudes()

const misSolicitudes = computed(() =>
  solicitudes.value.filter((s) => s.usuarioEmail === auth.usuario?.email),
)

onMounted(recargar)

const form = ref({
  nombre: auth.usuario?.nombre ?? '',
  email: auth.usuario?.email ?? '',
  password: '',
})
const verClave = ref(false)

const req = (v) => !!v || 'Campo obligatorio'
const emailValido = (v) => /.+@.+\..+/.test(v) || 'Email no válido'
const minimo = (v) => !v || v.length >= 6 || 'Mínimo 6 caracteres'

const guardar = () => {
  auth.usuario = {
    ...auth.usuario,
    nombre: form.value.nombre,
    email: form.value.email,
  }
  if (form.value.password) {
    ok('Nombre y correo actualizados. La contraseña no se puede cambiar desde aquí.')
  } else {
    ok('Perfil actualizado')
  }
  form.value.password = ''
}
</script>

<template>
  <q-page class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Mi perfil</h1>
        <p class="page-sub">Actualiza tu nombre y correo</p>
      </div>
    </div>

    <q-form class="form-usuario form-col" @submit="guardar">
      <q-input outlined dense v-model="form.nombre" label="Nombre" :rules="[req]" />
      <q-input outlined dense v-model="form.email" type="email" label="Correo" :rules="[req, emailValido]" />
      <q-input
        outlined
        dense
        v-model="form.password"
        :type="verClave ? 'text' : 'password'"
        label="Nueva contraseña"
        :rules="[minimo]"
      >
        <template #append>
          <q-icon :name="verClave ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="verClave = !verClave" />
        </template>
      </q-input>
      <q-btn unelevated color="primary" type="submit" label="Guardar cambios" />
    </q-form>

    <h2 class="profile-sub">Mis solicitudes de matrícula</h2>
    <q-list bordered class="rounded-borders">
      <q-item v-for="s in misSolicitudes" :key="s.id">
        <q-item-section>
          <q-item-label>{{ s.cursoNombre }}</q-item-label>
          <q-item-label caption>{{ s.fecha }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge :color="s.estado === 'aceptada' ? 'positive' : s.estado === 'rechazada' ? 'negative' : 'warning'">
            {{ s.estado }}
          </q-badge>
        </q-item-section>
      </q-item>
      <q-item v-if="!misSolicitudes.length">
        <q-item-section>No tienes solicitudes todavía.</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

