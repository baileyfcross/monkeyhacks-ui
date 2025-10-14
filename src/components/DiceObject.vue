<template>
  <div class="diceobject" @click="roll">
    <p>{{ displayValue }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref(1)
const displayValue = ref(1)
const isRolling = ref(false)

let intervalId: ReturnType<typeof setInterval> | null = null

function roll() {
  const duration = Math.random() * 1000 + 800
  value.value = Math.ceil(Math.random() * 6)
  isRolling.value = true

  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(() => {
    displayValue.value = Math.ceil(Math.random() * 6)
  }, 50)

  setTimeout(() => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    displayValue.value = value.value
    isRolling.value = false
  }, duration)
}

// Expose the roll method and the current display value to be callable/readable from parent components
defineExpose({ roll, displayValue, isRolling })
</script>
