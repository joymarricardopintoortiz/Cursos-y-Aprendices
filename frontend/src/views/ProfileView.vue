<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useSolicitudesStore } from '../stores/solicitudes'
import { useNotify } from '../composables/useNotify'

const auth = useAuthStore()
const { ok } = useNotify()
const solicitudesStore = useSolicitudesStore()
const { solicitudes } = storeToRefs(solicitudesStore)

const misSolicitudes = computed(() =>
  solicitudes.value.filter((s) => s.usuarioEmail === auth.usuario?.email),
)

const columnas = [
  { name: 'curso', label: 'Curso', field: 'cursoNombre', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
]

const etiquetaEstado = (estado) =>
  estado === 'aceptada' ? 'Aceptado' : estado === 'rechazada' ? 'Rechazado' : 'Pendiente'

const form = ref({
  documento: auth.documento,
  nombre: auth.usuario?.nombre ?? '',
  email: auth.usuario?.email ?? '',
  password: '',
})
const verClave = ref(false)

const req = (v) => !!v || 'Campo obligatorio'
const emailValido = (v) => /.+@.+\..+/.test(v) || 'Email no válido'
const minimo = (v) => !v || v.length >= 6 || 'Mínimo 6 caracteres'

const documentoValido = (v) => /^\d{6,12}$/.test(v) || 'Solo números, de 6 a 12 dígitos'

const guardar = () => {
  auth.usuario = {
    ...auth.usuario,
    nombre: form.value.nombre,
    email: form.value.email,
  }
  auth.setDocumento(form.value.documento)
  if (form.value.password) {
    ok('Datos actualizados. La contraseña no se puede cambiar desde aquí.')
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

    <q-form novalidate class="form-usuario form-col" @submit="guardar">
      <q-input outlined dense v-model="form.documento" label="Numero de documento" inputmode="numeric" maxlength="12" :rules="[req, documentoValido]"/>
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
    <q-table
      class="tabla tabla-contorno"
      flat
      bordered
      row-key="id"
      :rows="misSolicitudes"
      :columns="columnas"
      rows-per-page-label="Filas por página"
      no-data-label="No tienes solicitudes todavía"
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
    </q-table>
  </q-page>
</template>