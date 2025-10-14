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
        <DiceObject ref="dice1" />
        <DiceObject ref="dice2" />
      </div>

      <div class="sum-column">
        <div class="sum-box">
          <h2>Result:</h2>
          <p class="sum-value" v-if="bothFinished">{{ lastMessage }}</p>
          <p class="sum-rolling" v-else>Rolling…</p>
           <p class="sum-value" v-if="isDebug">{{ lastSum }}</p>
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


/**  Debugging flag to show extra info */
const isDebug = false;

type DiceObjectInstance = InstanceType<typeof DiceObject>
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
const lastMessage = ref<string>('')
const csMessage = ref<string>('')

onMounted(() => {
  lastMessage.value = csMessage.value
  lastSum.value = sum.value
})

// Update lastSum only when both dice have finished rolling
watch(bothFinished, (finished) => {
  if (finished) {
    lastMessage.value = csMessage.value
    lastSum.value = sum.value

    const currentValue = lastSum.value

    const aNumbers = [2, 3, 5, 6]
    const bNumbers = [4, 7, 10]
    const midnumbers = [8, 9, 11, 12]

    if (aNumbers.includes(currentValue)) {
      csMessage.value = 'Go to A site'
    } else if (bNumbers.includes(currentValue)) {
      csMessage.value = 'Go to B site'
    } else if (midnumbers.includes(currentValue)) {
      csMessage.value = 'Go to Mid'
    } else {
      csMessage.value = 'Error Rolling'
    }
    lastMessage.value = csMessage.value
    lastSum.value = currentValue
  }
})

function rollBoth() {
  dice1.value?.roll()
  dice2.value?.roll()
}
</script>
