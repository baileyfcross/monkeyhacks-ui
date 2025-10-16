<template>
  <main class="main">
    <div class="three-column">
      <div class="left-column">
        <!-- Left column intentionally left empty -->
        <div class="controls">
          <button @click="dropBallFromCenter">Drop Ball</button>
          <button @click="startAutoDrop" :disabled="autoDropping">Auto Drop (10) (WIP)</button>
          <button @click="resetBoard">Reset</button>
        </div>
      </div>
      <div class="plinko-view">
        <div class="header-row">
          <h1>Plinko</h1>
          <RouterLink to="/"><button class="button">← Back</button></RouterLink>
        </div>
        <p>Drop the puck and watch it bounce into a random slot!</p>

        <div class="game-area">
          <!-- Your Plinko game will go here -->
          <div ref="canvasContainer" class="canvas-container" @click="handleCanvasClick"></div>
          <!-- Slot labels at the bottom -->
          <div class="slot-labels">
            <div
              class="slot-number"
              v-for="(pos, i) in slotPositions"
              :key="i"
              :style="{ left: pos + '%' }"
            >
              {{ i + 1 }}
            </div>
          </div>
        </div>
      </div>
      <div class="right-column">
        <div class="score-board">
          <h3>Slot Hit Totals</h3>
          <div class="slots">
            <div class="slot" v-for="(s, i) in scores" :key="i">
              <div class="slot-label">Slot {{ i + 1 }}</div>
              <div class="slot-score">{{ s }}</div>
            </div>
          </div>
          <div class="total-balls">
            <div class="total-label">Total Balls Dropped</div>
            <div class="total-score">{{ totalBallsDropped }}</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import Matter, { Engine, World, Runner, Render, Composite, Bodies, Events, Body } from 'matter-js'

const canvasContainer: Ref<HTMLElement | null> = ref(null)
let engine: Matter.Engine | null = null
let render: Matter.Render | null = null
let runner: Matter.Runner | null = null
let world: Matter.World | null = null
const scores = ref<number[]>(Array(7).fill(0))
const autoDropping = ref(false)
const showBounds = ref(false)
const slotPositions = ref<number[]>([])

const totalBallsDropped = computed(() => scores.value.reduce((sum, score) => sum + score, 0))

const ROWS = 9
const COLUMNS = 7

function calculatePegRadius(): number {
  // Different peg sizing based on actual screen/viewport width
  const screenWidth = window.innerWidth
  if (screenWidth <= 900) {
    // Mobile and tablets (650px or less): smaller pegs
    return 5
  } else {
    // Desktop screens (larger than 650px): larger pegs
    return 10
  }
}

function calculateBallRadius(containerWidth: number): number {
  const screenWidth = window.innerWidth
  // Different ball sizing based on screen breakpoint
  if (screenWidth <= 650) {
    // Mobile and tablets (650px or less): smaller scaling
    return Math.max(5, containerWidth / 35)
  } else {
    // Desktop screens (larger than 650px): larger scaling
    return Math.max(5, containerWidth / 40)
  }
}

function createPlinkoBoard() {
  if (!world || !canvasContainer.value) return

  const containerWidth = canvasContainer.value.clientWidth
  const containerHeight = canvasContainer.value.clientHeight

  // Clear existing bodies
  Composite.clear(world, false, true)

  const ballRadius = calculateBallRadius(containerWidth)
  const pegRadius = calculatePegRadius()
  const paddingTop = Math.max(60, containerHeight * 0.15)
  const paddingSides = pegRadius * 2 // Adjust padding to match the extra posts
  const usableWidth = containerWidth - paddingSides * 2
  const usableHeight = containerHeight - paddingTop - 80

  // Walls
  const leftWall = Bodies.rectangle(
    paddingSides / 2,
    containerHeight / 2,
    paddingSides,
    containerHeight,
    {
      isStatic: true,
      restitution: 0.8,
      render: { fillStyle: '#333' },
    },
  )
  const rightWall = Bodies.rectangle(
    containerWidth - paddingSides / 2,
    containerHeight / 2,
    paddingSides,
    containerHeight,
    {
      isStatic: true,
      restitution: 0.8,
      render: { fillStyle: '#333' },
    },
  )
  const topWall = Bodies.rectangle(
    containerWidth / 2,
    paddingTop / 2,
    usableWidth + paddingSides * 2,
    paddingTop,
    {
      isStatic: true,
      render: { fillStyle: '#333' },
    },
  )
  World.add(world, [leftWall, rightWall, topWall])

  // Pegs
  const pegSpacingX = usableWidth / (COLUMNS - 1)
  const pegSpacingY = usableHeight / (ROWS - 1) // Ensure uniform vertical spacing

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const offsetX = row % 2 === 0 ? 0 : pegSpacingX / 2 // Stagger odd rows
      const x = paddingSides + col * pegSpacingX + offsetX
      const y = paddingTop + row * pegSpacingY * 0.9

      // Ensure pegs are not placed too close to the walls
      if (x > paddingSides + ballRadius && x < containerWidth - paddingSides - ballRadius) {
        const peg = Bodies.circle(x, y, pegRadius, {
          isStatic: true,
          restitution: 1.2, // Increase restitution for more bounciness
          friction: 0, // Reduce friction to prevent stickiness
          frictionStatic: 0, // Reduce static friction to prevent stickiness
          render: { fillStyle: '#222' },
        })
        World.add(world, peg)
      }
    }

    // Add extra pegs on odd rows towards the outside
    if (row % 2 === 0) {
      const leftExtraPegX = paddingSides
      const rightExtraPegX = containerWidth - paddingSides
      const y = paddingTop + row * pegSpacingY * 0.9

      const leftPeg = Bodies.circle(leftExtraPegX, y, pegRadius, {
        isStatic: true,
        restitution: 1.2, // Increase restitution for more bounciness
        friction: 0, // Reduce friction to prevent stickiness
        frictionStatic: 0, // Reduce static friction to prevent stickiness
        render: { fillStyle: '#222' },
      })
      const rightPeg = Bodies.circle(rightExtraPegX, y, pegRadius, {
        isStatic: true,
        restitution: 1.2, // Increase restitution for more bounciness
        friction: 0, // Reduce friction to prevent stickiness
        frictionStatic: 0, // Reduce static friction to prevent stickiness
        render: { fillStyle: '#222' },
      })

      World.add(world, [leftPeg, rightPeg])
    }
  }

  // Add slots at the bottom inside the padded area
  const slotY = containerHeight - 10
  const slotHeight = 100
  const positions: number[] = []
  for (let i = 0; i <= COLUMNS; i++) {
    const gridX = i / COLUMNS // 0..1
    const scaledX = paddingSides + gridX * usableWidth
    const slot = Bodies.rectangle(scaledX, slotY, 10, slotHeight, {
      isStatic: true,
      label: `slot-${i}`,
      render: { fillStyle: '#444' },
    })
    World.add(world, slot)

    // Store the percentage position (0-100) for slot label alignment
    const percentPosition = gridX * 100
    positions.push(percentPosition)

    // Add half domes at the top of the slot walls
    const domeRadius = 5 // Smaller radius for half domes
    const dome = Bodies.circle(scaledX, slotY - slotHeight / 2 - domeRadius / 2, domeRadius, {
      isStatic: true,
      render: { fillStyle: '#444' },
    })
    World.add(world, dome)
  }

  // Update the slot positions for UI alignment
  slotPositions.value = positions

  // Add floor inside the padded area (narrower than full canvas so walls are visible)
  const floor = Bodies.rectangle(
    containerWidth / 2,
    containerHeight + 5,
    containerWidth - paddingSides * 0.5,
    10,
    { isStatic: true, render: { fillStyle: '#222' } },
  )
  World.add(world, floor)

  // Add a CSS overlay boundary (invisible physics body already exists via walls)
  // We'll set data attributes on the container so the template CSS can draw the bounding box if needed.
  if (canvasContainer.value) {
    canvasContainer.value.dataset.boundLeft = String(paddingSides)
    canvasContainer.value.dataset.boundRight = String(containerWidth - paddingSides)
    canvasContainer.value.dataset.boundTop = String(paddingTop)
    canvasContainer.value.dataset.boundBottom = String(slotY - slotHeight / 2)
    if (showBounds.value) {
      // apply inline style to visualize bounds
      const left = Number(canvasContainer.value.dataset.boundLeft || 0)
      const top = Number(canvasContainer.value.dataset.boundTop || 0)
      const right = Number(canvasContainer.value.dataset.boundRight || containerWidth)
      const bottom = Number(canvasContainer.value.dataset.boundBottom || containerHeight)
      canvasContainer.value.style.outline = '2px dashed rgba(255,0,0,0.7)'
      canvasContainer.value.style.clipPath = `inset(${top}px ${containerWidth - right}px ${containerHeight - bottom}px ${left}px)`
    } else {
      canvasContainer.value.style.outline = ''
      canvasContainer.value.style.clipPath = ''
    }
  }
}

function dropBall(x: number) {
  if (!world || !canvasContainer.value) {
    console.error('World or canvas container is not initialized.', {
      worldInitialized: !!world,
      canvasContainerInitialized: !!canvasContainer.value,
    })
    return
  }

  const containerWidth = canvasContainer.value.clientWidth
  const containerHeight = canvasContainer.value.clientHeight
  const ballX = Math.max(
    10,
    Math.min((x / canvasContainer.value.offsetWidth) * containerWidth, containerWidth - 10),
  )

  // Adjust spawn position to ensure the ball starts within the visible area
  const spawnY = Math.max(20, containerHeight * 0.1) // Start slightly below the top
  const ballRadius = calculateBallRadius(containerWidth)

  const ball = Bodies.circle(ballX, spawnY, ballRadius, {
    restitution: 0.6,
    label: 'ball',
    friction: 0.5,
    frictionAir: 0.005,
    density: 0.04,
  })

  // Set initial velocity to zero
  Body.setVelocity(ball, { x: 0, y: 0 })

  World.add(world, ball)
  console.debug('[Plinko] Spawned ball at', { x: ballX, y: spawnY, radius: ballRadius })
}

function startAutoDrop() {
  if (autoDropping.value) return

  autoDropping.value = true
  const container = canvasContainer.value
  if (!container) {
    console.error('Canvas container is not initialized.')
    autoDropping.value = false
    return
  }

  const containerWidth = container.clientWidth
  const pegRadius = calculatePegRadius()
  const paddingSides = pegRadius * 2
  const usableWidth = containerWidth - paddingSides * 2

  let ballsDropped = 0
  const ballsToDropEach = 10
  const intervalTime = 100 // Drop one ball every 100ms

  const dropInterval = setInterval(() => {
    if (ballsDropped >= ballsToDropEach) {
      clearInterval(dropInterval)
      autoDropping.value = false
      console.debug('[Plinko] Auto drop completed', { ballsDropped })
      return
    }

    // Generate random X position within the valid playable area
    const randomX = paddingSides + Math.random() * usableWidth
    dropBall(randomX)
    ballsDropped++

    console.debug('[Plinko] Auto drop ball', { ballNumber: ballsDropped })
  }, intervalTime)
}

function resetBoard() {
  if (world) {
    const allBodies = Composite.allBodies(world)
    allBodies.forEach((body) => {
      if (body.label === 'ball' && world) {
        Composite.remove(world, body)
      }
    })
  }
  // Clear the slot scores
  scores.value = Array(7).fill(0)
}

function handleCanvasClick(event: MouseEvent) {
  const container = canvasContainer.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const x = event.clientX - rect.left // Calculate the x-coordinate relative to the canvas
  dropBall(x)
}

function handleResize() {
  if (!canvasContainer.value || !engine || !render) return

  const container = canvasContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  // Update render dimensions
  render.options.width = width
  render.options.height = height

  // Reposition the canvas
  Render.setPixelRatio(render, window.devicePixelRatio || 1)
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: width, y: height },
  })

  // Recreate the Plinko board to fit the new dimensions
  createPlinkoBoard()
}

function dropBallFromCenter() {
  const container = canvasContainer.value
  if (!container) {
    console.error('Canvas container is not initialized.')
    return
  }

  // Generate a random x-coordinate within the board's width
  const randomX = Math.random() * container.clientWidth
  dropBall(randomX)
}

onMounted(() => {
  const container = canvasContainer.value
  if (!container) {
    console.error('Canvas container is not defined')
    return
  }

  engine = Engine.create({
    enableSleeping: false,
  })
  engine.world.gravity.y = 1

  world = engine.world

  // Reset gravity to default value
  engine.gravity.y = 1 // Default gravity

  render = Render.create({
    element: container,
    engine: engine,
    options: {
      width: container.clientWidth,
      height: container.clientHeight,
      wireframes: false,
    },
  })

  if (world) {
    createPlinkoBoard()

    // Check every frame if balls should be removed (simplified approach)
    Events.on(engine, 'beforeUpdate', () => {
      if (!world) return

      const allBodies = Composite.allBodies(world)
      const containerHeight = canvasContainer.value?.clientHeight || 0
      const removalThreshold = containerHeight - 50 // Remove balls that reach near the bottom

      allBodies.forEach((body) => {
        if (body.label === 'ball') {
          const ballY = body.position?.y || 0
          const ballX = body.position?.x || 0

          // If ball reaches the bottom area, find which slot it's in and remove it
          if (ballY > removalThreshold) {
            // Determine which slot based on X position
            const containerWidth = canvasContainer.value?.clientWidth || 0
            const pegRadius = calculatePegRadius()
            const paddingSides = pegRadius * 2
            const usableWidth = containerWidth - paddingSides * 2

            // Calculate slot index based on ball's X position
            const relativeX = ballX - paddingSides
            const slotIndex = Math.round((relativeX / usableWidth) * COLUMNS)
            const constrainedSlotIndex = Math.max(0, Math.min(COLUMNS, slotIndex))

            console.debug('[Plinko] Removing ball at bottom', {
              ballId: body.id,
              ballY,
              ballX,
              slotIndex: constrainedSlotIndex,
            })

            // Increment the score for the appropriate slot
            scores.value = scores.value.map((score, index) =>
              index === constrainedSlotIndex ? score + 1 : score,
            )

            // Remove the ball
            if (world) {
              Composite.remove(world, body)
            }
          }
        }
      })
    })

    // Add collision end event to track ball lifecycle
    Events.on(engine, 'collisionEnd', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair
        const ball = bodyA.label === 'ball' ? bodyA : bodyB.label === 'ball' ? bodyB : null
        if (ball) {
          console.debug('[Plinko] Ball collision ended', {
            ballId: ball.id,
            ballPosition: ball.position,
          })
        }
      })
    })
  }

  runner = Runner.create()
  Runner.run(runner, engine)
  Render.run(render)

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (engine && world) {
    Matter.World.clear(world, true)
  }
  if (render) {
    Matter.Render.stop(render)
  }
  if (runner) {
    Matter.Runner.stop(runner)
  }
  engine = null
  world = null
  render = null
  runner = null

  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f0f0f0;
}

.three-column {
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.left-column,
.right-column {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 0 10px;
}

.plinko-view {
  flex: 2;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 0 10px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

button {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.score-board {
  margin-top: 20px;
  text-align: center; /* Center the text */
}

.slots {
  display: flex;
  justify-content: center; /* Center the slots container */
  flex-wrap: wrap; /* Allow wrapping to new rows */
  margin-top: 10px;
}

.slot {
  flex: 1 1 calc(33.33% - 10px); /* Adjust to fit 3 slots per row with spacing */
  text-align: center;
  margin: 5px; /* Add spacing between rows */
}

@media (max-width: 600px) {
  .slot {
    flex: 1 1 calc(50% - 10px); /* Adjust to fit 2 slots per row on smaller screens */
  }
}

@media (max-width: 400px) {
  .slot {
    flex: 1 1 100%; /* Stack slots in a single column on very small screens */
  }
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-area {
  position: relative;
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
  /* Debugging overlay: toggle by adding 'show-bounds' class to .canvas-container */
  .canvas-container.show-bounds::after {
    content: '';
    position: absolute;
    left: attr(data-bound-left px);
    top: attr(data-bound-top px);
    width: calc(attr(data-bound-right px) - attr(data-bound-left px));
    height: calc(attr(data-bound-bottom px) - attr(data-bound-top px));
    border: 2px dashed rgba(255, 0, 0, 0.7);
    pointer-events: none;
  }
  overflow: hidden;
  background-color: #e9ecef;
}

.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible; /* Ensure the outer walls are not cut off */
}

.slot-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 25px;
  background-color: rgba(255, 255, 255, 0.8);
  border-top: 1px solid #ddd;
  font-size: 12px;
  font-weight: bold;
}

.slot-number {
  position: absolute;
  bottom: 50%;
  transform: translate(-50%, 50%);
  color: #333;
  width: 30px;
  text-align: center;
  line-height: 1;
}
</style>
