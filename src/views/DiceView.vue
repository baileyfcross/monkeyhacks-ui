<template>
  <main>
    <h1>🎲 Dice Roller</h1>
    <div class="dice-container">
      <!-- Your DiceObject components -->
      <DiceObject ref="dice1" />
      <DiceObject ref="dice2" />
    </div>

    <button @click="rollBoth">Roll Dice</button>

    <RouterLink to="/">← Back Home</RouterLink>
  </main>
</template>

<script setup lang="ts">
import DiceObject from '../components/DiceObject.vue'
import { ref } from 'vue'
type DiceObjectInstance = InstanceType<typeof DiceObject>

const dice1 = ref<DiceObjectInstance | null>(null)
const dice2 = ref<DiceObjectInstance | null>(null)

function rollBoth() {
  dice1.value?.roll()
  dice2.value?.roll()
}
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.dice-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}
</style>
