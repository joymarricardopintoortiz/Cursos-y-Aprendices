<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useSolicitudesStore } from '../stores/solicitudes'
import { useNotify } from '../composables/useNotify'
import { usuariosService } from '../services/usuarios.service'
import { aprendicesService } from '../services/aprendices.service'

const auth = useAuthStore()
const { ok, error } = useNotify()
const solicitudesStore = useSolicitudesStore()
const { solicitudes } = storeToRefs(solicitudesStore)

const misSolicitudes = computed(() =>
  solicitudes.value.filter((s) => s.usuarioEmail === auth.usuario?.email),
)

// Cursos donde ya soy aprendiz en la BD (el admin pudo haberme creado
// directamente, sin solicitud). Esos tambien deben verse en la tabla.
const misMatriculas = ref([])
const cargarMisMatriculas = async () => {
  try {
    const { data } = await aprendicesService.listar()
    const miDoc = String(auth.documento ?? '').trim()
    if (!miDoc) return
    misMatriculas.value = data.filter(
      (a) => String(a.documento ?? '').trim() === miDoc && a.curso,
    )
  } catch {
    // sin conexion: que se vean solo las solicitudes
  }
}
onMounted(cargarMisMatriculas)

// Filas de la tabla: solicitudes + cursos ya matriculados que no tengan
// solicitud (si la tienen, manda la solicitud para no repetir la fila).
const filas = computed(() => {
  const conSolicitud = new Set(misSolicitudes.value.map((s) => s.cursoId))
  const matriculas = misMatriculas.value
    .filter((m) => !conSolicitud.has(m.curso._id))
    .map((m) => ({
      id: `mat-${m._id}`,
      cursoId: m.curso._id,
      cursoNombre: m.curso.nombre,
      fecha: m.createdAt ? new Date(m.createdAt).toLocaleString() : '—',
      estado: 'matriculado',
    }))
  return [...matriculas, ...misSolicitudes.value]
})

const columnas = [
  { name: 'curso', label: 'Curso', field: 'cursoNombre', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
]

const etiquetaEstado = (estado) =>
  estado === 'aceptada'
    ? 'Aceptado'
    : estado === 'rechazada'
      ? 'Rechazado'
      : estado === 'matriculado'
        ? 'Matriculado'
        : 'Pendiente'

const form = ref({
  documento: auth.usuario?.documento || auth.documento,
  nombre: auth.usuario?.nombre ?? '',
  email: auth.usuario?.email ?? '',
  password: '',
})
const verClave = ref(false)

const req = (v) => !!v || 'Campo obligatorio'
const emailValido = (v) => /^[^\s@]+@sena\.edu\.co$/i.test((v || '').trim()) || 'Solo se permiten correos @sena.edu.co'
const minimo = (v) => !v || v.length >= 6 || 'Mínimo 6 caracteres'

// El usuario normal no puede leer la lista de usuarios (es solo admin), asi
// que el backend le dice si el correo ya existe. Regla asincronica: mientras
// responde, Quasar muestra el campo en validacion y no se envia el PUT.
const emailDisponible = async (v) => {
  const mail = String(v ?? '').trim().toLowerCase()
  try {
    const { data } = await usuariosService.verificarEmail(mail)
    return data.disponible || 'Este correo ya está registrado'
  } catch {
    return true // sin conexion: que decida el servidor al guardar
  }
}

const documentoValido = (v) => /^\d{6,12}$/.test(v) || 'Solo números, de 6 a 12 dígitos'

const guardando = ref(false)

const guardar = async () => {
  guardando.value = true
  try {
    const { data } = await usuariosService.actualizar(auth.usuario._id, {
      documento: form.value.documento,
      nombre: form.value.nombre,
      email: form.value.email,
      password: form.value.password,
    })
    auth.setSesion({ token: auth.token, usuario: data.usuario })
    auth.setDocumento(form.value.documento)
    ok(form.value.password ? 'Datos y contraseña actualizados' : 'Perfil actualizado')
    form.value.password = ''
  } catch (e) {
    error(e)
  } finally {
    guardando.value = false
  }
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

    <div class="perfil-layout">
      <q-form novalidate class="form-usuario form-col" @submit="guardar">
        <q-input outlined dense v-model="form.documento" label="Numero de documento" inputmode="numeric" maxlength="12" :rules="[req, documentoValido]"/>
        <q-input outlined dense v-model="form.nombre" label="Nombre" :rules="[req]" />
        <q-input outlined dense v-model="form.email" type="email" label="Correo" :rules="[req, emailValido, emailDisponible]" />
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

      <div class="tabla-perfil">
        <h2 class="profile-sub">Mis solicitudes de matrícula</h2>
        <q-table
          class="tabla tabla-contorno perfil-tabla"
          flat
          bordered
          row-key="id"
          :rows="filas"
          :columns="columnas"
          rows-per-page-label="Filas por página"
          no-data-label="No tienes solicitudes todavía"
        >
          <template #body-cell-estado="p">
            <q-td :props="p">
              <q-badge
                :color="
                  p.row.estado === 'aceptada' || p.row.estado === 'matriculado'
                    ? 'positive'
                    : p.row.estado === 'rechazada'
                      ? 'negative'
                      : 'warning'
                "
                :text-color="p.row.estado === 'pendiente' ? 'dark' : 'white'"
                rounded
                class="text-weight-bold q-px-sm q-py-xs"
              >
                <q-icon
                  :name="
                    p.row.estado === 'aceptada'
                      ? 'check_circle'
                      : p.row.estado === 'matriculado'
                        ? 'how_to_reg'
                        : p.row.estado === 'rechazada'
                          ? 'cancel'
                          : 'schedule'
                  "
                  size="14px"
                  class="q-mr-xs"
                />
                {{ etiquetaEstado(p.row.estado) }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>