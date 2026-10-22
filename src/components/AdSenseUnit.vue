
<script setup>
import { ref, onMounted, nextTick } from 'vue'

defineProps({
  slot: {
    type: String,
    required: true
  }
})

const adElement = ref(null)

onMounted(async () => {
  // Don't request real ads during local development.
  if (!import.meta.env.PROD) return

  await nextTick()

  // Prevent requesting an ad twice on the same element.
  if (!adElement.value) return
  if (adElement.value.dataset.adsbygoogleStatus) return

  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (error) {
    console.error('AdSense initialization failed:', error)
  }
})
</script>

<template>
  <div class="ad-placement" aria-label="Advertisement">
    <ins
      ref="adElement"
      class="adsbygoogle"
      style="display: block"
      data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
      :data-ad-slot="slot"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </div>
</template>

<style scoped>
.ad-placement {
  width: 100%;
  min-height: 120px;
  margin: 20px auto;
}
</style>
