<script setup lang="ts">
import MainPageCarousel from '@/components/MainPageCarousel.vue'
</script>

<template>
  <main class="home">
    <h1>MonkeyHacks</h1>

    <div>
      <RouterLink to="/diceGame">
        <button>Go to Dice Roller →</button>
      </RouterLink>
      <p>Click below to start rolling some dice.</p>
      <MainPageCarousel />
    </div>
  </main>
</template>

<style scoped>
.home {
  text-align: center;
  margin-top: 3rem;
}
button {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
