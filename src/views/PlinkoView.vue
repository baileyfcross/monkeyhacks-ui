<template>
  <main class="plinko-page">
    <section class="plinko-shell">
      <div class="header-row">
        <div>
          <p class="eyebrow">CS2 Mini Game</p>
          <h1>Plinko</h1>
          <p class="description">
            Click inside the board to choose a drop point, or use controls to drop automatically.
          </p>
        </div>
        <RouterLink to="/" class="back-link">Back to Hub</RouterLink>
      </div>

      <div class="layout-grid">
        <aside class="panel controls-panel">
          <p class="panel-label">Controls</p>
          <button class="action-button primary" @click="dropBallFromCenter">Drop Ball</button>
          <button class="action-button" @click="startAutoDrop" :disabled="autoDropping">
            Auto Drop (10)
          </button>
          <button class="action-button" @click="resetBoard">Reset</button>
          <p class="hint">Tip: click anywhere in the board to drop from that position.</p>
        </aside>

        <section class="panel board-panel">
          <div ref="canvasContainer" class="game-area" @click="handleCanvasClick">
            <div class="slot-labels">
              <div
                v-for="(position, index) in slotPositions"
                :key="index"
                class="slot-number"
                :style="{ left: `${position}%` }"
              >
                {{ index + 1 }}
              </div>
            </div>
          </div>
        </section>

        <aside class="panel score-panel">
          <p class="panel-label">Slot Hit Totals</p>
          <div class="slots-grid">
            <div class="slot-tile" v-for="(score, index) in scores" :key="index">
              <p class="slot-name">Slot {{ index + 1 }}</p>
              <p class="slot-score">{{ score }}</p>
            </div>
          </div>

          <div class="stats-row">
            <div>
              <p class="small-label">Total Balls Dropped</p>
              <p class="big-value">{{ totalBallsDropped }}</p>
            </div>
            <div>
              <p class="small-label">Last Slot</p>
              <p class="big-value">{{ lastSlotHit }}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Matter, {
  Bodies,
  Body,
  Composite,
  Engine,
  Events,
  Render,
  Runner,
  World,
} from 'matter-js'

const SLOT_COUNT = 7
const PEG_ROWS = 9
const BASE_PEG_COLUMNS = 7
const PLINKO_GRAVITY_Y = 0.72
const MAX_BALL_SPEED = 11

const canvasContainer = ref<HTMLElement | null>(null)
const scores = ref<number[]>(Array(SLOT_COUNT).fill(0))
const slotPositions = ref<number[]>([])
const autoDropping = ref(false)
const lastSlotHit = ref('-')

let engine: Matter.Engine | null = null
let render: Matter.Render | null = null
let runner: Matter.Runner | null = null
let autoDropTimer: number | null = null

const boardMetrics = {
  left: 0,
  right: 0,
  top: 0,
  slotTop: 0,
  slotWidth: 0,
}

const totalBallsDropped = computed(() => scores.value.reduce((sum, score) => sum + score, 0))

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function ballRadius(width: number): number {
  return clamp(width / 42, 6, 11)
}

function pegRadius(width: number): number {
  return clamp(width / 85, 5, 9)
}

function clearAutoDrop() {
  if (autoDropTimer !== null) {
    window.clearInterval(autoDropTimer)
    autoDropTimer = null
  }
  autoDropping.value = false
}

function createPlinkoBoard() {
  if (!canvasContainer.value || !engine) return

  const world = engine.world
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight

  Composite.clear(world, false, true)

  const pegSize = pegRadius(width)
  const paddingX = Math.max(22, pegSize * 2.8)
  const paddingTop = Math.max(48, height * 0.1)
  const slotHeight = Math.max(96, height * 0.18)
  const slotDividerHeight = slotHeight + 24
  const usableWidth = width - paddingX * 2
  const usableHeight = height - paddingTop - slotHeight - 24

  boardMetrics.left = paddingX
  boardMetrics.right = width - paddingX
  boardMetrics.top = paddingTop
  boardMetrics.slotTop = height - slotHeight
  boardMetrics.slotWidth = usableWidth / SLOT_COUNT

  const wallThickness = 14
  const sideWallHalfHeight = height / 2

  const leftWall = Bodies.rectangle(
    paddingX - wallThickness / 2,
    sideWallHalfHeight,
    wallThickness,
    height,
    {
      isStatic: true,
      render: { fillStyle: '#364252' },
    },
  )

  const rightWall = Bodies.rectangle(
    width - paddingX + wallThickness / 2,
    sideWallHalfHeight,
    wallThickness,
    height,
    {
      isStatic: true,
      render: { fillStyle: '#364252' },
    },
  )

  const ceilingThickness = 12
  const ceiling = Bodies.rectangle(width / 2, ceilingThickness / 2, usableWidth + 8, ceilingThickness, {
    isStatic: true,
    render: { fillStyle: '#121920' },
  })

  const floor = Bodies.rectangle(width / 2, height + 6, usableWidth + 14, 12, {
    isStatic: true,
    render: { fillStyle: '#364252' },
  })

  World.add(world, [leftWall, rightWall, ceiling, floor])

  const pegSpacingX = usableWidth / SLOT_COUNT
  const pegSpacingY = usableHeight / (PEG_ROWS - 1)

  for (let row = 0; row < PEG_ROWS - 1; row += 1) {
    const isOffsetRow = row % 2 === 0
    const rowOffset = isOffsetRow ? pegSpacingX / 2 : 0
    const pegsInRow = isOffsetRow ? SLOT_COUNT : SLOT_COUNT + 1

    for (let col = 0; col < pegsInRow; col += 1) {
      const x = paddingX + rowOffset + col * pegSpacingX
      if (x <= paddingX + pegSize * 0.7 || x >= width - paddingX - pegSize * 0.7) continue

      const y = paddingTop + row * pegSpacingY
      World.add(
        world,
        Bodies.circle(x, y, pegSize, {
          isStatic: true,
          restitution: 1,
          friction: 0,
          frictionStatic: 0,
          render: { fillStyle: '#f4a460' },
        }),
      )
    }
  }

  const slotCentersPercent: number[] = []
  const dividerWidth = 10
  const dividerY = height - slotDividerHeight / 2

  for (let index = 0; index <= SLOT_COUNT; index += 1) {
    const dividerX = paddingX + index * boardMetrics.slotWidth
    World.add(
      world,
      Bodies.rectangle(dividerX, dividerY, dividerWidth, slotDividerHeight, {
        isStatic: true,
        render: { fillStyle: '#495668' },
      }),
    )

    if (index < SLOT_COUNT) {
      const centerX = dividerX + boardMetrics.slotWidth / 2
      slotCentersPercent.push((centerX / width) * 100)
    }
  }

  slotPositions.value = slotCentersPercent
}

function dropBall(rawX: number) {
  if (!engine || !canvasContainer.value) return
  if (boardMetrics.slotWidth <= 0) return

  const width = canvasContainer.value.clientWidth
  const radius = ballRadius(width)
  const horizontalInset = radius + 12
  const spawnX = clamp(rawX, boardMetrics.left + horizontalInset, boardMetrics.right - horizontalInset)
  const spawnY = Math.max(radius + 14, boardMetrics.top - radius - 10)

  const ball = Bodies.circle(spawnX, spawnY, radius, {
    label: 'ball',
    restitution: 0.62,
    friction: 0.02,
    frictionAir: 0.01,
    density: 0.0012,
    render: { fillStyle: '#dbe8f4' },
  })

  Body.setVelocity(ball, { x: 0, y: 0 })
  World.add(engine.world, ball)
}

function dropBallFromCenter() {
  if (!canvasContainer.value) return
  const centerX = canvasContainer.value.clientWidth / 2
  dropBall(centerX)
}

function startAutoDrop() {
  if (autoDropping.value || !canvasContainer.value) return

  autoDropping.value = true
  let dropped = 0
  const boardWidth = boardMetrics.right - boardMetrics.left

  autoDropTimer = window.setInterval(() => {
    if (dropped >= 10) {
      clearAutoDrop()
      return
    }

    const randomX = boardMetrics.left + Math.random() * boardWidth
    dropBall(randomX)
    dropped += 1
  }, 140)
}

function resetBoard() {
  if (!engine) return

  clearAutoDrop()
  const world = engine.world
  const balls = Composite.allBodies(world).filter((body) => body.label === 'ball')
  balls.forEach((ball) => Composite.remove(world, ball))
  scores.value = Array(SLOT_COUNT).fill(0)
  lastSlotHit.value = '-'
}

function handleCanvasClick(event: MouseEvent) {
  if (!canvasContainer.value) return

  const rect = canvasContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  dropBall(x)
}

function handleBallScoring() {
  if (!engine || !canvasContainer.value) return

  const world = engine.world
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight

  for (const body of Composite.allBodies(world)) {
    if (body.label !== 'ball') continue

    const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y)
    if (speed > MAX_BALL_SPEED) {
      const scale = MAX_BALL_SPEED / speed
      Body.setVelocity(body, {
        x: body.velocity.x * scale,
        y: body.velocity.y * scale,
      })
    }

    if (body.position.y >= boardMetrics.slotTop - 8) {
      const normalized = (body.position.x - boardMetrics.left) / boardMetrics.slotWidth
      const slotIndex = clamp(Math.floor(normalized), 0, SLOT_COUNT - 1)
      const nextScores = [...scores.value]
      nextScores[slotIndex] = (nextScores[slotIndex] ?? 0) + 1
      scores.value = nextScores
      lastSlotHit.value = String(slotIndex + 1)
      Composite.remove(world, body)
      continue
    }

    if (body.position.y > height + 140 || body.position.x < -120 || body.position.x > width + 120) {
      Composite.remove(world, body)
    }
  }
}

function handleResize() {
  if (!canvasContainer.value || !render) return

  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  render.options.width = width
  render.options.height = height

  render.canvas.width = width
  render.canvas.height = height

  createPlinkoBoard()
}

onMounted(() => {
  if (!canvasContainer.value) return

  engine = Engine.create({ enableSleeping: false })
  engine.gravity.y = PLINKO_GRAVITY_Y

  render = Render.create({
    element: canvasContainer.value,
    engine,
    options: {
      width: canvasContainer.value.clientWidth,
      height: canvasContainer.value.clientHeight,
      wireframes: false,
      background: 'transparent',
      pixelRatio: window.devicePixelRatio || 1,
    },
  })

  runner = Runner.create()
  Runner.run(runner, engine)
  Render.run(render)

  createPlinkoBoard()
  Events.on(engine, 'beforeUpdate', handleBallScoring)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  clearAutoDrop()
  window.removeEventListener('resize', handleResize)

  if (engine) {
    Events.off(engine, 'beforeUpdate', handleBallScoring)
    World.clear(engine.world, true)
    Engine.clear(engine)
  }

  if (render) {
    Render.stop(render)
    render.canvas.remove()
    render.textures = {}
  }

  if (runner) {
    Runner.stop(runner)
  }

  engine = null
  render = null
  runner = null
})
</script>

<style scoped>
.plinko-page {
  width: 100%;
  min-height: 100vh;
  padding: clamp(1rem, 2.4vw, 1.6rem);
  background:
    radial-gradient(circle at 12% 10%, rgba(244, 164, 96, 0.14), transparent 42%),
    radial-gradient(circle at 86% 95%, rgba(126, 170, 212, 0.14), transparent 48%),
    #0f1319;
  color: #e8eef4;
}

.plinko-shell {
  width: min(1080px, 100%);
  margin: 0 auto;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #161c24;
  padding: 1rem;
}

.header-row {
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
  font-size: clamp(1.6rem, 4.4vw, 2.25rem);
}

.description {
  margin: 0.5rem 0 0;
  color: rgba(205, 218, 230, 0.9);
  max-width: 66ch;
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

.layout-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 240px;
  gap: 0.8rem;
}

.panel {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: #131820;
  padding: 0.75rem;
}

.panel-label,
.small-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  color: rgba(203, 220, 236, 0.74);
}

.controls-panel {
  display: grid;
  gap: 0.55rem;
  align-content: start;
}

.action-button {
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: #202834;
  color: #dbe8f4;
  font-weight: 700;
  cursor: pointer;
  padding: 0.56rem 0.72rem;
}

.action-button.primary {
  color: #12161c;
  border-color: #f4a460;
  background: #f4a460;
}

.action-button:hover {
  border-color: rgba(244, 164, 96, 0.55);
}

.action-button.primary:hover {
  background: #ffb06c;
}

.action-button:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.hint {
  margin: 0.25rem 0 0;
  color: rgba(205, 218, 230, 0.76);
  font-size: 0.84rem;
  line-height: 1.4;
}

.board-panel {
  padding: 0.55rem;
}

.game-area {
  position: relative;
  width: 100%;
  height: clamp(460px, 62vh, 620px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background:
    linear-gradient(180deg, rgba(41, 54, 72, 0.76), rgba(25, 33, 44, 0.82)),
    radial-gradient(circle at 50% 0%, rgba(236, 247, 255, 0.08), transparent 44%);
  overflow: hidden;
  cursor: crosshair;
}

.game-area :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.slot-labels {
  pointer-events: none;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(14, 19, 26, 0.78);
}

.slot-number {
  position: absolute;
  bottom: 8px;
  transform: translateX(-50%);
  width: 24px;
  text-align: center;
  color: rgba(220, 233, 245, 0.92);
  font-size: 0.75rem;
  font-weight: 700;
}

.score-panel {
  display: grid;
  gap: 0.65rem;
  align-content: start;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.slot-tile {
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #1a212b;
  padding: 0.45rem;
}

.slot-name {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(205, 218, 230, 0.82);
}

.slot-score {
  margin: 0.22rem 0 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #f4a460;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.big-value {
  margin: 0.24rem 0 0;
  font-size: 1.15rem;
  font-weight: 700;
}

@media (max-width: 980px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .game-area {
    height: clamp(420px, 56vh, 560px);
  }

  .slots-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .plinko-page {
    padding: 0.8rem;
  }

  .plinko-shell {
    padding: 0.75rem;
  }

  .slots-grid,
  .stats-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .game-area {
    height: 440px;
  }
}
</style>
