<template>
  <main class="main">
    <h1>🎲 Dice Roller</h1>
    <div class="three-column">
      <div class="dice-text">
        <div class="text-box">
          <h1>CS Roller</h1>
          <p></p>
          Based on a classic game of chance. This simple dice roll will tell you where to go on
          each. If you're curious, try and figure out the set of numbers for each sum that I use.
        </div>
      </div>

      <div class="dice-container">
        <!-- Your DiceObject components -->
        <DiceObject ref="dice1" />
        <DiceObject ref="dice2" />
      </div>

      <div class="sum-column">
        <div class="sum-box">
          <h2>Sum</h2>
          <p class="sum-value" v-if="bothFinished">{{ lastSum }}</p>
          <p class="sum-rolling" v-else>Rolling…</p>
        </div>
      </div>
    </div>
    <button class="button" @click="rollBoth">Roll Dice</button>
    <RouterLink to="/"><button class="button">← Back</button></RouterLink>
  </main>
</template>

<script setup lang="ts">
import DiceObject from '../components/DiceObject.vue'
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

type DiceObjectInstance = InstanceType<typeof DiceObject>

// Public interface for the child component that we expose
type DicePublic = DiceObjectInstance & { displayValue?: number | Ref<number> }

const dice1 = ref<DicePublic | null>(null)
const dice2 = ref<DicePublic | null>(null)

import { onMounted, watch } from 'vue'

const sum = computed(() => {
  const raw1 = dice1.value?.displayValue
  const raw2 = dice2.value?.displayValue
  const v1 = typeof raw1 === 'number' ? raw1 : ((raw1 as unknown as Ref<number>)?.value ?? 0)
  const v2 = typeof raw2 === 'number' ? raw2 : ((raw2 as unknown as Ref<number>)?.value ?? 0)
  return v1 + v2
})

const bothFinished = computed(() => {
  const r1 = dice1.value?.isRolling
  const r2 = dice2.value?.isRolling
  const rolling1 = typeof r1 === 'boolean' ? r1 : ((r1 as unknown as Ref<boolean>)?.value ?? false)
  const rolling2 = typeof r2 === 'boolean' ? r2 : ((r2 as unknown as Ref<boolean>)?.value ?? false)
  return !rolling1 && !rolling2
})

const lastSum = ref<number>(0)

onMounted(() => {
  // initialize lastSum with the current sum
  lastSum.value = sum.value
})

// Update lastSum only when both dice have finished rolling
watch(bothFinished, (finished) => {
  if (finished) {
    lastSum.value = sum.value
  }
})

function rollBoth() {
  dice1.value?.roll()
  dice2.value?.roll()
}
</script>
