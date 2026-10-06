<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { cursosService } from '../services/cursos.service'
import { aprendicesService } from '../services/aprendices.service'
import { useNotify } from '../composables/useNotify'

const auth = useAuthStore()
const { error } = useNotify()

const cursos = ref([])
const aprendices = ref([])
const cargando = ref(false)

const tarjetas = computed(() => [
  { titulo: 'Cursos', valor: cursos.value.length, icono: 'menu_book' },
  { titulo: 'Cursos activos', valor: cursos.value.filter((c) => c.status === 0).length, icono: 'check_circle' },
  { titulo: 'Aprendices', valor: aprendices.value.length, icono: 'groups' },
  { titulo: 'Aprendices activos', valor: aprendices.value.filter((a) => a.status === 0).length, icono: 'how_to_reg' },
])

onMounted(async () => {
  cargando.value = true
  try {
    const [c, a] = await Promise.all([cursosService.listar(), aprendicesService.listar()])
    cursos.value = c.data
    aprendices.value = a.data
  } catch (e) {
    error(e)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <q-page class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Bienvenido, {{ auth.usuario?.nombre }}</h1>
        <p class="page-sub">Resumen general del sistema</p>
      </div>
    </div>
    <div class="stats">
      <div v-for="t in tarjetas" :key="t.titulo" class="stat-card">
        <q-icon :name="t.icono" class="stat-icono" />
        <div>
          <div class="stat-num">{{ t.valor }}</div>
          <div class="stat-label">{{ t.titulo }}</div>
        </div>
      </div>
      <q-inner-loading :showing="cargando" />
    </div>
  </q-page>
</template>