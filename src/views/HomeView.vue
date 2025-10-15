<script setup lang="ts">
import MainPageCarousel from '@/components/MainPageCarousel.vue'
</script>

<template>
  <main class="home">
    <h1>MonkeyHacks</h1>

    <div>
      <RouterLink to="/diceGame">
        <button class="button">Go to CS Site Roller →</button>
      </RouterLink>
      <RouterLink to="/plinko">
        <button class="button">Go to Plinko Game →</button>
      </RouterLink>
      <MainPageCarousel />
    </div>
  </main>
</template>
