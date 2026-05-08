<template>
  <div class="diceobject" @click="roll">
    <div class="dice-face">
      <span class="dice-label">Die</span>
      <p>{{ displayValue }}</p>
    </div>
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

<style scoped>
.diceobject {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(96px, 12vw, 118px);
  height: clamp(96px, 12vw, 118px);
  padding: 0.4rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0)),
    #10161e;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  cursor: pointer;
  user-select: none;
  transition:
    transform 140ms ease,
    border-color 140ms ease,
    background-color 140ms ease;
}

.diceobject:hover {
  transform: translateY(-1px);
  border-color: rgba(244, 164, 96, 0.55);
}

.diceobject:active {
  transform: translateY(0);
}

.dice-face {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.15rem;
  border-radius: 12px;
  background: #171e27;
}

.dice-label {
  font-size: 0.68rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(214, 227, 239, 0.68);
}

p {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #f5f8fb;
  line-height: 1;
}
</style>
