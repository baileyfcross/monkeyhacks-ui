<script setup lang="ts">
import MainPageCarousel from '@/components/MainPageCarousel.vue'
</script>

<template>
  <main class="home">
    <h1>MonkeyHacks</h1>

    <div>
      <RouterLink to="/diceGame">
        <button class="button">Go to Dice Roller →</button>
      </RouterLink>
      <MainPageCarousel />
    </div>
  </main>
</template>
