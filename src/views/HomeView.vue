<script setup lang="ts">
import MainPageCarousel from '@/components/MainPageCarousel.vue'
import LandmarkErickEmbed from '@/components/LandmarkErickEmbed.vue'
</script>

<template>
  <main class="home">
    <h1>MonkeyHacks</h1>
    <div class="home-three-column-layout">
      <!-- Left Column: Spotify Widget -->
      <div class="left-column">
        <LandmarkErickEmbed />
      </div>

      <!-- Center Column: Photo Carousel -->
      <div class="center-column">
        <MainPageCarousel />
      </div>

      <!-- Right Column: Buttons -->
      <div class="right-column">
        <div class="main-button-group">
          <RouterLink to="/diceGame">
            <button class="button">Go to CS Site Roller →</button>
          </RouterLink>
          <RouterLink to="/plinko">
            <!--<button class="button">Go to Plinko Game →</button> -->
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
