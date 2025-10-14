<template>
  <div class="diceobject" @click="roll">
    <p>{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref(1)

function roll() {
  value.value = Math.ceil(Math.random() * 6)
}

// Expose the roll method to be callable from parent components
defineExpose({ roll })
</script>

<style scoped>
.diceobject {
  width: 100px;
  height: 100px;
  background: #eee;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.2s;
}
.diceobject:hover {
  transform: scale(1.1);
}
</style>
