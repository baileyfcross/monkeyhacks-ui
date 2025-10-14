<template>
  <div class="carousel-wrapper">
    <Swiper
      :modules="[Navigation, Pagination, Autoplay, EffectFade]"
      navigation
      :pagination="{ clickable: true }"
      effect="fade"
      loop
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      class="carousel"
    >
      <SwiperSlide v-for="(image, index) in images" :key="index">
        <img :src="image" class="carousel-image" />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

// Add your images here (public folder recommended)
const images = ['/pic1.png', '/pic2.png', '/pic3.png', '/pic4.png']
</script>

<style scoped>
.carousel-wrapper {
  max-width: 900px;
  margin: 2rem auto;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 500px;
  object-fit: cover;
  border-radius: 12px;
}

/* Optional: Adjust navigation arrow size */
.swiper-button-next,
.swiper-button-prev {
  color: #fff;
  font-size: 1.5rem;
}
</style>
