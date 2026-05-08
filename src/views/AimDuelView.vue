<script setup lang="ts">
import { computed, ref } from 'vue'

type SideType = 'T' | 'CT'
type PreviousRoundType =
  | 'Won previous round'
  | 'Lost previous round'
  | 'Saved weapon'
  | 'Force buy situation'
  | 'Eco round'
type TeamEconomyType = 'Weak' | 'Stable' | 'Strong'
type RangeType = 'Close' | 'Mid' | 'Long'
type PositionType = 'Holding angle' | 'Swinging' | 'Rotating'
type BehaviorType = 'Patient' | 'Aggressive' | 'Jiggle peeking'
type EnemyUtilityType = 'Likely flash setup' | 'Likely smoke setup' | 'Low utility threat'
type PlayerUtilityType = 'None' | 'Flashbang' | 'Smoke' | 'Molotov'
type ActionType =
  | 'Dry peek'
  | 'Shoulder bait'
  | 'Flash and swing'
  | 'Smoke isolate and peek'
  | 'Hold for teammate'

const weaponData = {
  'AK-47': { close: 0.77, mid: 0.73, long: 0.61, cost: 2700 },
  'M4A1-S': { close: 0.72, mid: 0.72, long: 0.64, cost: 2900 },
  Galil: { close: 0.67, mid: 0.63, long: 0.52, cost: 1800 },
  FAMAS: { close: 0.66, mid: 0.62, long: 0.55, cost: 2050 },
  AWP: { close: 0.61, mid: 0.78, long: 0.9, cost: 4750 },
  MP9: { close: 0.78, mid: 0.51, long: 0.28, cost: 1250 },
  Deagle: { close: 0.6, mid: 0.52, long: 0.45, cost: 700 },
  P250: { close: 0.46, mid: 0.41, long: 0.28, cost: 300 },
} as const

type WeaponName = keyof typeof weaponData

interface RoundContext {
  side: SideType
  previousRound: PreviousRoundType
  playerMoney: number
  teamEconomy: TeamEconomyType
  recommendedBuy: string
  enemyWeapon: WeaponName
  enemyArmor: boolean
  enemyPosition: PositionType
  range: RangeType
  enemyBehavior: BehaviorType
  enemyUtilityPossibility: EnemyUtilityType
}

interface PlayerDecision {
  boughtWeapon: WeaponName
  boughtArmor: boolean
  boughtUtility: PlayerUtilityType
  action: ActionType
}

const previousRoundPool: PreviousRoundType[] = [
  'Won previous round',
  'Lost previous round',
  'Saved weapon',
  'Force buy situation',
  'Eco round',
]
const sidePool: SideType[] = ['T', 'CT']
const teamEconomyPool: TeamEconomyType[] = ['Weak', 'Stable', 'Strong']
const rangePool: RangeType[] = ['Close', 'Mid', 'Long']
const enemyPositionPool: PositionType[] = ['Holding angle', 'Swinging', 'Rotating']
const enemyBehaviorPool: BehaviorType[] = ['Patient', 'Aggressive', 'Jiggle peeking']
const enemyUtilityPool: EnemyUtilityType[] = [
  'Likely flash setup',
  'Likely smoke setup',
  'Low utility threat',
]

const playerUtilities: PlayerUtilityType[] = ['None', 'Flashbang', 'Smoke', 'Molotov']
const playerActions: ActionType[] = [
  'Dry peek',
  'Shoulder bait',
  'Flash and swing',
  'Smoke isolate and peek',
  'Hold for teammate',
]
const weapons = Object.keys(weaponData) as WeaponName[]

const context = ref<RoundContext>(generateRoundContext())
const playerDecision = ref<PlayerDecision>({
  boughtWeapon: 'Galil',
  boughtArmor: true,
  boughtUtility: 'Flashbang',
  action: 'Flash and swing',
})

const duelResult = ref<'win' | 'lose' | null>(null)
const decisionAssessment = ref<'smart' | 'risky' | 'poor' | null>(null)
const assessmentText = ref('Choose your buy and action, then simulate the duel.')
const roundCount = ref(0)
const wins = ref(0)

const rangeKey = computed(() => context.value.range.toLowerCase() as 'close' | 'mid' | 'long')

const totalSpend = computed(() => {
  const weaponSpend = weaponData[playerDecision.value.boughtWeapon].cost
  const armorSpend = playerDecision.value.boughtArmor ? 1000 : 0
  const utilSpend = playerDecision.value.boughtUtility === 'None' ? 0 : playerDecision.value.boughtUtility === 'Molotov' ? 600 : 300
  return weaponSpend + armorSpend + utilSpend
})

const decisionNotes = computed(() => {
  let score = 0
  const notes: string[] = []

  if (totalSpend.value > context.value.playerMoney) {
    score -= 0.22
    notes.push('-22% plan exceeds your money')
  } else {
    notes.push('Budget check passed')
  }

  if (context.value.recommendedBuy.includes('Eco')) {
    if (totalSpend.value <= 1800) {
      score += 0.08
      notes.push('+8% economy discipline on eco recommendation')
    } else {
      score -= 0.1
      notes.push('-10% over-commit on eco recommendation')
    }
  }

  if (context.value.recommendedBuy.includes('Full buy')) {
    if (totalSpend.value >= 3200) {
      score += 0.06
      notes.push('+6% full buy aligns with recommendation')
    } else {
      score -= 0.06
      notes.push('-6% under-buy on full buy recommendation')
    }
  }

  if (context.value.enemyPosition === 'Holding angle' && playerDecision.value.action === 'Dry peek') {
    score -= 0.12
    notes.push('-12% dry peeking held angle')
  }

  if (context.value.enemyPosition === 'Holding angle' && playerDecision.value.action === 'Flash and swing') {
    if (playerDecision.value.boughtUtility === 'Flashbang') {
      score += 0.12
      notes.push('+12% flash entry into held angle')
    } else {
      score -= 0.05
      notes.push('-5% flash action without flash')
    }
  }

  if (playerDecision.value.action === 'Smoke isolate and peek') {
    if (playerDecision.value.boughtUtility === 'Smoke') {
      score += 0.08
      notes.push('+8% smoke isolate used correctly')
    } else {
      score -= 0.04
      notes.push('-4% smoke isolate called without smoke')
    }
  }

  if (playerDecision.value.boughtArmor) {
    score += 0.03
    notes.push('+3% armor durability')
  }

  if (context.value.teamEconomy === 'Weak' && totalSpend.value > context.value.playerMoney * 0.9) {
    score -= 0.06
    notes.push('-6% little reserve in weak team economy')
  }

  if (playerDecision.value.action === 'Hold for teammate') {
    score += 0.04
    notes.push('+4% lower-risk trade setup')
  }

  return { score, notes }
})

const winChance = computed(() => {
  const attacker = weaponData[playerDecision.value.boughtWeapon][rangeKey.value]
  const defender = weaponData[context.value.enemyWeapon][rangeKey.value]

  let chance = 0.5 + (attacker - defender) * 0.55

  if (context.value.enemyArmor) chance -= 0.04
  if (context.value.enemyBehavior === 'Patient') chance -= 0.03
  if (context.value.enemyBehavior === 'Aggressive') chance += 0.02

  chance += decisionNotes.value.score

  return clamp(chance, 0.04, 0.96)
})

const winPercent = computed(() => `${Math.round(winChance.value * 100)}%`)

const summaryLine = computed(() => {
  if (duelResult.value === null) return 'Run simulation to resolve the duel.'
  if (duelResult.value === 'win') return 'Outcome: You won the duel.'
  return 'Outcome: You lost the duel.'
})

const historicalWinRate = computed(() => {
  if (roundCount.value === 0) return 'N/A'
  return `${Math.round((wins.value / roundCount.value) * 100)}%`
})

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function pickRandom<T>(arr: readonly T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot pick random value from an empty array.')
  }
  return arr[Math.floor(Math.random() * arr.length)] as T
}

function recommendedBuyFromMoney(money: number, previousRound: PreviousRoundType): string {
  if (previousRound === 'Saved weapon') return 'Play around saved rifle, add utility'
  if (previousRound === 'Force buy situation') return 'Light force with armor and utility'
  if (previousRound === 'Eco round') return 'Hard eco or pistols only'

  if (money >= 4300) return 'Full buy'
  if (money >= 2800) return 'Save or light force'
  return 'Eco round recommended'
}

function enemyWeaponFromEconomy(teamEconomy: TeamEconomyType): WeaponName {
  if (teamEconomy === 'Weak') return pickRandom(['Deagle', 'MP9', 'FAMAS', 'Galil', 'P250'] as const)
  if (teamEconomy === 'Strong') return pickRandom(['AK-47', 'M4A1-S', 'AWP', 'AK-47', 'M4A1-S'] as const)
  return pickRandom(['AK-47', 'M4A1-S', 'FAMAS', 'Galil', 'MP9', 'Deagle'] as const)
}

function generateRoundContext(): RoundContext {
  const previousRound = pickRandom(previousRoundPool)
  const side = pickRandom(sidePool)
  const moneyByResult: Record<PreviousRoundType, [number, number]> = {
    'Won previous round': [3500, 6900],
    'Lost previous round': [1800, 3200],
    'Saved weapon': [2400, 5200],
    'Force buy situation': [1900, 3400],
    'Eco round': [1200, 2400],
  }

  const [minMoney, maxMoney] = moneyByResult[previousRound]
  const rawMoney = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney
  const playerMoney = Math.round(rawMoney / 50) * 50

  const teamEconomy = pickRandom(teamEconomyPool)
  const recommendedBuy = recommendedBuyFromMoney(playerMoney, previousRound)

  return {
    side,
    previousRound,
    playerMoney,
    teamEconomy,
    recommendedBuy,
    enemyWeapon: enemyWeaponFromEconomy(teamEconomy),
    enemyArmor: Math.random() > 0.28,
    enemyPosition: pickRandom(enemyPositionPool),
    range: pickRandom(rangePool),
    enemyBehavior: pickRandom(enemyBehaviorPool),
    enemyUtilityPossibility: pickRandom(enemyUtilityPool),
  }
}

function newRoundContext() {
  context.value = generateRoundContext()
  duelResult.value = null
  decisionAssessment.value = null
  assessmentText.value = 'New context generated. Choose your buy and action.'
}

function simulateDuel() {
  const roll = Math.random()
  const didWin = roll <= winChance.value
  duelResult.value = didWin ? 'win' : 'lose'
  roundCount.value += 1
  if (didWin) wins.value += 1

  const score = decisionNotes.value.score
  if (score >= 0.06) {
    decisionAssessment.value = 'smart'
    assessmentText.value = 'Decision quality: Smart economy-aware plan for this context.'
  } else if (score >= -0.04) {
    decisionAssessment.value = 'risky'
    assessmentText.value = 'Decision quality: Playable but risky for the economy context.'
  } else {
    decisionAssessment.value = 'poor'
    assessmentText.value = 'Decision quality: Poor economy fit for the round situation.'
  }
}

function resetStats() {
  duelResult.value = null
  decisionAssessment.value = null
  assessmentText.value = 'Choose your buy and action, then simulate the duel.'
  roundCount.value = 0
  wins.value = 0
}
</script>

<template>
  <main class="aim-duel-view">
    <section class="duel-panel">
      <div class="duel-header-row">
        <div>
          <p class="eyebrow">CS2 Mini Game</p>
          <h1>Aim Duel Odds Simulator</h1>
          <p class="description">
            Enemy context is randomized each round. Build your buy and action from economy context, then
            simulate the duel.
          </p>
        </div>
        <RouterLink to="/" class="back-link">Back to Hub</RouterLink>
      </div>

      <div class="scenario-grid">
        <div class="context-box">
          <p class="stat-label">Round context</p>
          <p class="context-line"><span>Side:</span> {{ context.side }}</p>
          <p class="context-line"><span>Previous round:</span> {{ context.previousRound }}</p>
          <p class="context-line"><span>Money:</span> ${{ context.playerMoney }}</p>
          <p class="context-line"><span>Team economy:</span> {{ context.teamEconomy }}</p>
          <p class="context-line"><span>Recommended buy:</span> {{ context.recommendedBuy }}</p>
          <button class="sim-button" @click="newRoundContext">Generate New Round</button>
        </div>

        <div class="context-box">
          <p class="stat-label">Enemy setup</p>
          <p class="context-line"><span>Weapon:</span> {{ context.enemyWeapon }}</p>
          <p class="context-line"><span>Armor:</span> {{ context.enemyArmor ? 'Yes' : 'No' }}</p>
          <p class="context-line"><span>Range:</span> {{ context.range }}</p>
          <p class="context-line"><span>Position:</span> {{ context.enemyPosition }}</p>
          <p class="context-line"><span>Behavior:</span> {{ context.enemyBehavior }}</p>
          <p class="context-line"><span>Utility possibility:</span> {{ context.enemyUtilityPossibility }}</p>
        </div>

        <label>
          Your buy this round
          <select v-model="playerDecision.boughtWeapon">
            <option v-for="weapon in weapons" :key="weapon" :value="weapon">{{ weapon }}</option>
          </select>
        </label>

        <label class="toggle-field">
          <input v-model="playerDecision.boughtArmor" type="checkbox" />
          Bought armor
        </label>

        <label>
          Utility bought
          <select v-model="playerDecision.boughtUtility">
            <option v-for="u in playerUtilities" :key="u" :value="u">{{ u }}</option>
          </select>
        </label>

        <label>
          Duel action
          <select v-model="playerDecision.action">
            <option v-for="action in playerActions" :key="action" :value="action">{{ action }}</option>
          </select>
        </label>
      </div>

      <div class="result-panel">
        <div class="odds-block">
          <p class="stat-label">Estimated win odds</p>
          <p class="odds-value">{{ winPercent }}</p>
          <p class="result-text" :class="duelResult">{{ summaryLine }}</p>
          <p class="result-text" :class="decisionAssessment">{{ assessmentText }}</p>
        </div>

        <div class="sim-controls">
          <button class="sim-button primary" @click="simulateDuel">Simulate Duel</button>
          <button class="sim-button" @click="resetStats">Reset Stats</button>
        </div>

        <div class="history-grid">
          <div class="history-item">
            <p class="stat-label">Simulated rounds</p>
            <p class="stat-value">{{ roundCount }}</p>
          </div>
          <div class="history-item">
            <p class="stat-label">Wins</p>
            <p class="stat-value">{{ wins }}</p>
          </div>
          <div class="history-item">
            <p class="stat-label">Historical win rate</p>
            <p class="stat-value">{{ historicalWinRate }}</p>
          </div>
        </div>

        <div class="modifiers">
          <p class="stat-label">Decision and context impact</p>
          <p class="context-line spend-line">
            <span>Total spend:</span> ${{ totalSpend }} / ${{ context.playerMoney }}
          </p>
          <ul>
            <li v-for="note in decisionNotes.notes" :key="note">{{ note }}</li>
            <li v-if="decisionNotes.notes.length === 0">No situational modifiers applied.</li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.aim-duel-view {
  width: 100%;
  min-height: 100vh;
  padding: 1.2rem;
  background: #0f1319;
  color: #e8eef4;
}

.duel-panel {
  width: min(1020px, 100%);
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #161c24;
  padding: 1rem;
}

.duel-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
  color: rgba(244, 164, 96, 0.92);
}

h1 {
  margin: 0.45rem 0 0;
  font-size: clamp(1.6rem, 4.2vw, 2.2rem);
}

.description {
  margin: 0.55rem 0 0;
  color: rgba(205, 218, 230, 0.9);
  max-width: 64ch;
  line-height: 1.45;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  padding: 0.5rem 0.78rem;
  border-radius: 8px;
  text-decoration: none;
  color: #dbe8f4;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: #202834;
}

.back-link:hover {
  border-color: rgba(244, 164, 96, 0.55);
}

.scenario-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  font-size: 0.88rem;
  color: rgba(205, 218, 230, 0.9);
}

.context-box {
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: #1b222d;
  padding: 0.7rem;
  display: grid;
  gap: 0.35rem;
}

.context-line {
  margin: 0;
  color: rgba(214, 227, 239, 0.92);
  line-height: 1.35;
}

.context-line span {
  color: rgba(203, 220, 236, 0.74);
  font-size: 0.88rem;
}

select {
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: #1b222d;
  color: #eef3f8;
  padding: 0.52rem 0.65rem;
}

.toggle-field {
  flex-direction: row;
  align-items: center;
  gap: 0.55rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: #1b222d;
  padding: 0.6rem;
}

.result-panel {
  margin-top: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: #131820;
  padding: 0.9rem;
}

.odds-block {
  display: grid;
  gap: 0.25rem;
}

.stat-label {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(203, 220, 236, 0.74);
}

.odds-value {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #f4a460;
}

.result-text {
  margin: 0;
  color: rgba(217, 229, 241, 0.92);
}

.result-text.win {
  color: #b5f0c6;
}

.result-text.lose {
  color: #ffc2b8;
}

.result-text.smart {
  color: #b5f0c6;
}

.result-text.risky {
  color: #ffe5b0;
}

.result-text.poor {
  color: #ffbeb3;
}

.sim-controls {
  margin-top: 0.85rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.sim-button {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: #202834;
  color: #dbe8f4;
  font-weight: 700;
  cursor: pointer;
}

.sim-button.primary {
  color: #12161c;
  background: #f4a460;
  border-color: #f4a460;
}

.sim-button:hover {
  border-color: rgba(244, 164, 96, 0.5);
}

.sim-button.primary:hover {
  background: #ffb06c;
}

.history-grid {
  margin-top: 0.85rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
}

.history-item {
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1a212b;
  padding: 0.55rem;
}

.stat-value {
  margin: 0.35rem 0 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.modifiers {
  margin-top: 0.85rem;
}

.spend-line {
  margin-top: 0.45rem;
}

ul {
  margin: 0.45rem 0 0;
  padding-left: 1rem;
  color: rgba(207, 221, 236, 0.9);
}

li {
  margin-bottom: 0.2rem;
}

@media (max-width: 820px) {
  .scenario-grid,
  .history-grid {
    grid-template-columns: 1fr;
  }
}
</style>
