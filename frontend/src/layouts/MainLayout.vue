<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import logo from '../assets/logo-sena.png'

const auth = useAuthStore()
const router = useRouter()
const menu = ref(false)

const salir = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="app-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" class="menu-btn" @click="menu = !menu" />
        <img :src="logo" alt="SENA" class="header-logo" />
        <span class="header-title">Cursos y Aprendices - SENA</span>
        <q-space />
        <span class="header-user">{{ auth.usuario?.nombre }}</span>
        <q-btn flat dense round icon="logout" title="Cerrar sesión" @click="salir" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="menu" show-if-above :width="220" :breakpoint="901" bordered>
      <q-list>
        <q-item clickable v-ripple to="/" exact active-class="item-activo">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/cursos" active-class="item-activo">
          <q-item-section avatar><q-icon name="menu_book" /></q-item-section>
          <q-item-section>Cursos</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/aprendices" active-class="item-activo">
          <q-item-section avatar><q-icon name="groups" /></q-item-section>
          <q-item-section>Aprendices</q-item-section>
        </q-item>
        <q-item v-if="auth.esAdmin" clickable v-ripple to="/usuarios" active-class="item-activo">
          <q-item-section avatar><q-icon name="manage_accounts" /></q-item-section>
          <q-item-section>Usuarios</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>