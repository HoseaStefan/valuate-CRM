<template>
  <div id="app">
    <header>
      <h1>TUBES RPLL - Web Application</h1>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
header {
  background-color: #42b983;
  padding: 2rem;
  text-align: center;
  color: white;
}

main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
