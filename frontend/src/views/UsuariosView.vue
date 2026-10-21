<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { usuariosService } from '../services/usuarios.service'
import { useAuthStore } from '../stores/auth'
import { useSolicitudesStore } from '../stores/solicitudes'
import { useNotify } from '../composables/useNotify'
import ErrorList from '../components/shared/ErrorList.vue'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'

const auth = useAuthStore()
const solicitudesStore = useSolicitudesStore()
const { solicitudes } = storeToRefs(solicitudesStore)
const { ok, error, listaErrores } = useNotify()

const formRef = ref(null)
const form = ref({ documento: '', nombre: '', email: '', password: '' })
const verClave = ref(false)
const errores = ref([])
const guardando = ref(false)
const dialogoConfirm = ref(false)

const usuarios = ref([])
const cargando = ref(false)
const filtro = ref('')
const paginacion = ref({ rowsPerPage: 0 })
let temporizador = null

const columnas = [
  { name: 'documento', label: 'Documento', field: (r) => r.documento || '—', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'email', label: 'Correo', field: 'email', align: 'left', sortable: true },
  { name: 'password', label: 'Contraseña', field: () => '••••••••', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: '_id', align: 'center' },
]

const dialogoEditar = ref(false)
const editando = ref({ _id: null, documento: '', nombre: '', email: '', password: '', passwordConfirm: '' })
const erroresEditar = ref([])
const guardandoEdicion = ref(false)
const verClaveEditar = ref(false)

const req = (v) => !!(v && String(v).trim()) || 'Campo obligatorio'
const emailValido = (v) => /^[^\s@]+@sena\.edu\.co$/i.test((v || '').trim()) || 'Solo se permiten correos @sena.edu.co'
const minimo = (v) => (v && v.length >= 6) || 'Mínimo 6 caracteres'
const minimoOpcional = (v) => !v || v.length >= 6 || 'Mínimo 6 caracteres'
const confirmarOpcional = (v) => {
  // Solo exige que coincida si se escribio una contraseña nueva.
  if (!editando.value.password) return true
  return v === editando.value.password || 'Las contraseñas no coinciden'
}
const documentoValido = (v) => /^\d{6,12}$/.test(v) || 'Solo números, de 6 a 12 dígitos'
const documentoOpcional = (v) => !v || /^\d{6,12}$/.test(v) || 'Solo números, de 6 a 12 dígitos'

const sincronizados = new Set()

const documentoLocal = (u) => {
  const guardado = auth.documentos[u._id]
  if (guardado) return guardado
  const s = solicitudes.value.find((x) => x.usuarioEmail === u.email && x.usuarioDocumento)
  return s ? s.usuarioDocumento : ''
}

const filas = computed(() =>
  usuarios.value.map((u) => ({ ...u, documento: u.documento || documentoLocal(u) })),
)

const sincronizarDocumentos = async () => {
  const pendientes = usuarios.value.filter(
    (u) => !u.documento && documentoLocal(u) && !sincronizados.has(u._id),
  )
  for (const u of pendientes) {
    sincronizados.add(u._id)
    try {
      await usuariosService.actualizar(u._id, {
        documento: documentoLocal(u),
        nombre: u.nombre,
        email: u.email,
      })
    } catch {
      continue
    }
  }
  if (pendientes.length) await cargar(true)
}

const cargar = async (silencioso = false) => {
  if (!silencioso) cargando.value = true
  try {
    const { data } = await usuariosService.listar()
    usuarios.value = data
    sincronizarDocumentos()
  } catch (e) {
    if (!silencioso) error(e)
  } finally {
    cargando.value = false
  }
}

const guardar = () => {
  errores.value = []
  dialogoConfirm.value = true
}

const crearUsuario = async () => {
  errores.value = []
  guardando.value = true
  try {
    const { data } = await usuariosService.registrar(form.value)
    ok(data.msg)
    form.value = { documento: '', nombre: '', email: '', password: '' }
    await nextTick()
    formRef.value?.resetValidation()
    await cargar(true)
  } catch (e) {
    errores.value = listaErrores(e)
  } finally {
    guardando.value = false
  }
}

const abrirEditar = (u) => {
  editando.value = { _id: u._id, documento: u.documento || '', nombre: u.nombre, email: u.email, password: '', passwordConfirm: '' }
  erroresEditar.value = []
  verClaveEditar.value = false
  dialogoEditar.value = true
}

const guardarEdicion = async () => {
  erroresEditar.value = []

  // Si se escribio una contraseña nueva, la confirmacion debe coincidir.
  // Con password vacio se ignora la confirmacion: significa "no cambiarla".
  if (editando.value.password && editando.value.password !== editando.value.passwordConfirm) {
    erroresEditar.value = ['Las contraseñas no coinciden']
    return
  }

  guardandoEdicion.value = true
  try {
    const { _id, passwordConfirm, ...datos } = editando.value
    const { data } = await usuariosService.actualizar(_id, datos)
    ok(data.msg)
    if (_id === auth.usuario?._id) auth.setSesion({ token: auth.token, usuario: data.usuario })
    dialogoEditar.value = false
    await cargar(true)
  } catch (e) {
    erroresEditar.value = listaErrores(e)
  } finally {
    guardandoEdicion.value = false
  }
}

onMounted(() => {
  cargar()
  temporizador = setInterval(() => cargar(true), 10000)
})

onBeforeUnmount(() => clearInterval(temporizador))
</script>

<template>
  <q-page class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Usuarios</h1>
        <p class="page-sub">Crear y administrar cuentas de acceso</p>
      </div>
    </div>

    <div class="usuarios-layout">
      <q-form ref="formRef" novalidate class="form-usuario form-col" @submit="guardar">
        <q-input
          outlined
          dense
          v-model="form.documento"
          label="Documento"
          inputmode="numeric"
          maxlength="12"
          autocomplete="off"
          :rules="[req, documentoValido]"
        />
        <q-input outlined dense v-model="form.nombre" label="Nombre" autocomplete="off" :rules="[req]" />
        <q-input
          outlined
          dense
          v-model="form.email"
          type="email"
          label="Correo"
          hint="Debe terminar en @sena.edu.co"
          autocomplete="off"
          :rules="[req, emailValido]"
        />
        <q-input
          outlined
          dense
          v-model="form.password"
          :type="verClave ? 'text' : 'password'"
          label="Contraseña"
          autocomplete="new-password"
          :rules="[req, minimo]"
        >
          <template #append>
            <q-icon :name="verClave ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="verClave = !verClave" />
          </template>
        </q-input>
        <error-list :errores="errores" />
        <q-btn unelevated color="primary" type="submit" label="Crear usuario" :loading="guardando" />
      </q-form>

      <q-table
        class="tabla tabla-scroll"
        :style="{ height: filas.length > 7 ? '520px' : 'auto' }"
        flat
        row-key="_id"
        v-model:pagination="paginacion"
        :rows-per-page-options="[0]"
        hide-pagination
        :rows="filas"
        :columns="columnas"
        :loading="cargando"
        :filter="filtro"
        no-data-label="No hay usuarios"
      >
        <template #top>
          <div class="tabla-top">
            <q-input outlined dense v-model="filtro" placeholder="Buscar usuario" clearable class="tabla-buscar">
              <template #prepend><q-icon name="search" /></template>
            </q-input>
            <div class="tabla-top-titulo">
              <div class="tabla-top-titulo-texto">
                Usuarios registrados
                <q-badge color="primary" :label="usuarios.length" class="tabla-top-badge" />
              </div>
              <div class="tabla-top-titulo-sub">Cuentas creadas en el sistema</div>
            </div>
          </div>
        </template>
        <template #body-cell-acciones="p">
          <q-td :props="p">
            <q-btn flat round dense icon="edit" title="Editar" @click="abrirEditar(p.row)" />
          </q-td>
        </template>
      </q-table>
    </div>

    <confirm-dialog
      v-model="dialogoConfirm"
      :mensaje="`¿Desea crear el usuario ${form.nombre} con el correo ${form.email}?`"
      texto-boton="Crear usuario"
      tipo="positive"
      @confirmar="crearUsuario"
    />

    <q-dialog v-model="dialogoEditar" persistent>
      <q-card class="dialog-card">
        <q-form novalidate @submit="guardarEdicion">
          <q-card-section class="dialog-titulo">Editar usuario</q-card-section>
          <q-card-section class="form-grid">
            <q-input
              outlined
              dense
              v-model="editando.documento"
              label="Documento"
              inputmode="numeric"
              maxlength="12"
              autocomplete="off"
              :rules="[documentoOpcional]"
            />
            <q-input outlined dense v-model="editando.nombre" label="Nombre" autocomplete="off" :rules="[req]" />
            <q-input
              outlined
              dense
              v-model="editando.email"
              type="email"
              label="Correo"
              class="completo"
              autocomplete="off"
              :rules="[req, emailValido]"
            />
            <q-input
              outlined
              dense
              v-model="editando.password"
              :type="verClaveEditar ? 'text' : 'password'"
              label="Nueva contraseña"
              hint="Déjala vacía para no cambiarla"
              class="completo"
              autocomplete="new-password"
              :rules="[minimoOpcional]"
            >
              <template #append>
                <q-icon :name="verClaveEditar ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="verClaveEditar = !verClaveEditar" />
              </template>
            </q-input>
            <q-input
              outlined
              dense
              v-model="editando.passwordConfirm"
              :type="verClaveEditar ? 'text' : 'password'"
              label="Confirmar contraseña"
              hint="Debe coincidir con la nueva contraseña"
              class="completo"
              autocomplete="new-password"
              :rules="[confirmarOpcional]"
            />
          </q-card-section>
          <q-card-section v-if="erroresEditar.length">
            <error-list :errores="erroresEditar" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn unelevated color="primary" type="submit" label="Guardar" :loading="guardandoEdicion" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>