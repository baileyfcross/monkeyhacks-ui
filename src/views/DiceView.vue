<script setup lang="ts">
import DiceObject from '../components/DiceObject.vue'
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

/**  Debugging flag to show extra info */
const isDebug = false

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

<template>
  <main class="site-roller-view">
    <section class="hero-panel">
      <p class="eyebrow">CS2 Utility</p>
      <h1>🎲 CS Site Roller</h1>
      <p class="intro-copy">
        Roll the pair and let the site call happen for you. Same logic, cleaner presentation, and a layout
        that matches the rest of MonkeyHacks.
      </p>
      <div class="action-row">
        <button class="action-button action-primary" @click="rollBoth">Roll Dice</button>
        <RouterLink to="/" class="action-button action-secondary">Back to Home</RouterLink>
      </div>
    </section>

    <section class="panel dice-three-column" aria-labelledby="site-roller-title">
      <div class="dice-text text-box info-panel">
        <p class="section-eyebrow">Brief</p>
        <h2 id="site-roller-title">CS Site Roller</h2>
        <p>
          Based on a simple chance roll. Fire both dice, read the call, and run the round without overthinking
          the entry.
        </p>
        <p class="muted-note">
          If you're curious, try to work out which totals route to A, B, or Mid.
        </p>
      </div>

      <div class="dice-stage panel-inset">
        <p class="section-eyebrow">Dice Feed</p>
        <div class="dice-container">
          <DiceObject ref="dice1" />
          <DiceObject ref="dice2" />
        </div>
      </div>

      <div class="sum-column">
        <div class="sum-box">
          <p class="section-eyebrow">Result</p>
          <h2>Current Call</h2>
          <p class="sum-value" v-if="bothFinished">{{ lastMessage || 'Ready for next roll' }}</p>
          <p class="sum-rolling" v-else>Rolling...</p>
          <p class="sum-debug" v-if="isDebug">Total: {{ lastSum }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.site-roller-view {
  --bg: #0f1319;
  --panel: #161c24;
  --panel-soft: #1b232e;
  --line: rgba(255, 255, 255, 0.12);
  --text: #e7edf3;
  --text-muted: rgba(209, 221, 233, 0.8);
  --accent: #f4a460;

  width: 100%;
  min-height: 100vh;
  padding: clamp(1rem, 2.6vw, 1.7rem);
  display: grid;
  gap: 0.9rem;
  background:
    radial-gradient(circle at 14% 0%, rgba(244, 164, 96, 0.1), transparent 28%),
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    var(--bg);
  background-size:
    auto,
    34px 34px,
    34px 34px,
    auto;
  color: var(--text);
}

.hero-panel,
.panel {
  width: min(1040px, 100%);
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--panel);
}

.hero-panel {
  padding: clamp(1rem, 2.4vw, 1.5rem);
}

.panel {
  padding: 1rem;
}

.eyebrow,
.section-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.eyebrow {
  color: rgba(244, 164, 96, 0.92);
}

.section-eyebrow {
  color: rgba(207, 220, 232, 0.74);
}

h1 {
  margin: 0.5rem 0 0;
  font-size: clamp(1.9rem, 4vw, 2.6rem);
}

.intro-copy {
  margin: 0.7rem 0 0;
  max-width: 62ch;
  line-height: 1.55;
  color: var(--text-muted);
}

.action-row {
  margin-top: 1rem;
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.58rem 0.92rem;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 140ms ease,
    border-color 140ms ease,
    background-color 140ms ease;
}

.action-button:hover {
  transform: translateY(-1px);
}

.action-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #141920;
}

.action-primary:hover {
  background: #ffb06c;
}

.action-secondary {
  background: #202834;
  border-color: rgba(255, 255, 255, 0.17);
  color: var(--text);
}

.action-secondary:hover {
  background: #252f3c;
  border-color: rgba(244, 164, 96, 0.45);
}

.action-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.dice-three-column {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) auto minmax(260px, 0.9fr);
  gap: 1rem;
  align-items: stretch;
}

.info-panel,
.panel-inset,
.sum-box {
  height: 100%;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--panel-soft);
}

.info-panel,
.panel-inset,
.sum-box {
  padding: 1rem;
}

.dice-text {
  display: grid;
  gap: 0.65rem;
  align-content: start;
}

.dice-text h2,
.sum-box h2 {
  margin: 0;
  font-size: 1.15rem;
}

.dice-text p,
.sum-box p {
  margin: 0;
  line-height: 1.5;
}

.muted-note {
  color: var(--text-muted);
}

.dice-stage {
  display: grid;
  gap: 0.8rem;
  align-content: start;
}

.dice-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 100%;
  padding: 0.3rem 0;
}

.sum-column {
  display: flex;
}

.sum-box {
  display: grid;
  gap: 0.65rem;
  width: 100%;
  align-content: start;
}

.sum-value {
  font-size: clamp(1.35rem, 2vw, 1.7rem);
  font-weight: 700;
  color: #f9fbfd;
}

.sum-rolling,
.sum-debug {
  color: var(--text-muted);
}

@media (max-width: 940px) {
  .dice-three-column {
    grid-template-columns: 1fr;
  }

  .dice-container {
    justify-content: flex-start;
  }
}

@media (max-width: 620px) {
  .site-roller-view {
    padding: 0.8rem;
  }

  .dice-container {
    gap: 0.75rem;
    flex-wrap: wrap;
  }
}
</style>
