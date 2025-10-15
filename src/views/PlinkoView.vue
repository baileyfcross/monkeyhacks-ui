<template>
  <main class="main">
    <div class="three-column">
      <div class="left-column">
        <!-- Left column intentionally left empty -->
        <div class="controls">
          <button @click="dropBallFromCenter">Drop Ball</button>
          <button @click="startAutoDrop" :disabled="autoDropping">Auto Drop (10)</button>
          <button @click="resetBoard">Reset</button>
        </div>

        <div class="score-board">
          <h3>Scores</h3>
          <div class="slots">
            <div class="slot" v-for="(s, i) in scores" :key="i">
              <div class="slot-label">Slot {{ i + 1 }}</div>
              <div class="slot-score">{{ s }}</div>
            </div>
          </div>
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
          <div
            ref="canvasContainer"
            class="canvas-container"
            @click="handleCanvasClick"
          ></div>
        </div>
      </div>
      <div class="right-column">
        <!-- Right column intentionally left empty -->
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import Matter, { Engine, World, Runner, Render, Composite, Bodies, Events } from 'matter-js';

const canvasContainer: Ref<HTMLElement | null> = ref(null);
let engine: Matter.Engine | null = null;
let render: Matter.Render | null = null;
let runner: Matter.Runner | null = null;
let world: Matter.World | null = null;
const scores = ref<number[]>(Array(7).fill(0));
const autoDropping = false;
const showBounds = ref(false);

const PEG_RADIUS = 6;
const ROWS = 9;
const COLUMNS = 7;

function createPlinkoBoard() {
  if (!world || !canvasContainer.value) return;

  const containerWidth = canvasContainer.value.clientWidth;
  const containerHeight = canvasContainer.value.clientHeight;

  // Clear existing bodies
  Composite.clear(world, false, true);

  const ballRadius = 10; // Radius of the ball
  const paddingTop = Math.max(60, containerHeight * 0.15);
  const paddingSides = PEG_RADIUS * 2; // Adjust padding to match the extra posts
  const usableWidth = containerWidth - paddingSides * 2;
  const usableHeight = containerHeight - paddingTop - 80;

  // Walls
  const leftWall = Bodies.rectangle(paddingSides / 2, containerHeight / 2, paddingSides, containerHeight, {
    isStatic: true,
    restitution: 0.8,
    render: { fillStyle: '#333' },
  });
  const rightWall = Bodies.rectangle(containerWidth - paddingSides / 2, containerHeight / 2, paddingSides, containerHeight, {
    isStatic: true,
    restitution: 0.8,
    render: { fillStyle: '#333' },
  });
  const topWall = Bodies.rectangle(containerWidth / 2, paddingTop / 2, usableWidth + paddingSides * 2, paddingTop, {
    isStatic: true,
    render: { fillStyle: '#333' },
  });
  World.add(world, [leftWall, rightWall, topWall]);

  // Pegs
  const pegSpacingX = usableWidth / (COLUMNS - 1);
  const pegSpacingY = usableHeight / (ROWS - 1);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const offsetX = row % 2 === 0 ? 0 : pegSpacingX / 2; // Stagger odd rows
      const x = paddingSides + col * pegSpacingX + offsetX;
      const y = paddingTop + row * pegSpacingY * 0.9;

      // Ensure pegs are not placed too close to the walls
      if (x > paddingSides + ballRadius && x < containerWidth - paddingSides - ballRadius) {
        const peg = Bodies.circle(x, y, PEG_RADIUS, {
          isStatic: true,
          render: { fillStyle: '#222' },
        });
        World.add(world, peg);
      }
    }

    // Add extra pegs on odd rows towards the outside
    if (row % 2 === 0) {
      const leftExtraPegX = paddingSides;
      const rightExtraPegX = containerWidth - paddingSides;
      const y = paddingTop + row * pegSpacingY * 0.9;

      const leftPeg = Bodies.circle(leftExtraPegX, y, PEG_RADIUS, {
        isStatic: true,
        render: { fillStyle: '#222' },
      });
      const rightPeg = Bodies.circle(rightExtraPegX, y, PEG_RADIUS, {
        isStatic: true,
        render: { fillStyle: '#222' },
      });

      World.add(world, [leftPeg, rightPeg]);
    }
  }

  // Add slots at the bottom inside the padded area
  const slotY = containerHeight - 30;
  const slotHeight = 100;
  for (let i = 0; i <= COLUMNS; i++) {
    const gridX = i / COLUMNS; // 0..1
    const scaledX = paddingSides + gridX * usableWidth;
    const slot = Bodies.rectangle(scaledX, slotY, 10, slotHeight, { isStatic: true, label: `slot-${i}`, render: { fillStyle: '#444' } });
    World.add(world, slot);

    // Add half domes at the top of the slot walls
    const domeRadius = 5; // Smaller radius for half domes
    const dome = Bodies.circle(scaledX, slotY - slotHeight / 2 - domeRadius / 2, domeRadius, {
      isStatic: true,
      render: { fillStyle: '#444' },
    });
    World.add(world, dome);
  }

  // Add floor inside the padded area (narrower than full canvas so walls are visible)
  const floor = Bodies.rectangle(containerWidth / 2, containerHeight + 5, containerWidth - paddingSides * 0.5, 10, { isStatic: true, render: { fillStyle: '#222' } });
  World.add(world, floor);

  // Add a CSS overlay boundary (invisible physics body already exists via walls)
  // We'll set data attributes on the container so the template CSS can draw the bounding box if needed.
  if (canvasContainer.value) {
    canvasContainer.value.dataset.boundLeft = String(paddingSides);
    canvasContainer.value.dataset.boundRight = String(containerWidth - paddingSides);
    canvasContainer.value.dataset.boundTop = String(paddingTop);
    canvasContainer.value.dataset.boundBottom = String(slotY - slotHeight / 2);
    if (showBounds.value) {
      // apply inline style to visualize bounds
      const left = Number(canvasContainer.value.dataset.boundLeft || 0);
      const top = Number(canvasContainer.value.dataset.boundTop || 0);
      const right = Number(canvasContainer.value.dataset.boundRight || containerWidth);
      const bottom = Number(canvasContainer.value.dataset.boundBottom || containerHeight);
      canvasContainer.value.style.outline = '2px dashed rgba(255,0,0,0.7)';
      canvasContainer.value.style.clipPath = `inset(${top}px ${containerWidth - right}px ${containerHeight - bottom}px ${left}px)`;
    } else {
      canvasContainer.value.style.outline = '';
      canvasContainer.value.style.clipPath = '';
    }
  }
}

function dropBall(x: number) {
  if (!world || !canvasContainer.value) {
    console.error('World or canvas container is not initialized.', {
      worldInitialized: !!world,
      canvasContainerInitialized: !!canvasContainer.value,
    });
    return;
  }

  const containerWidth = canvasContainer.value.clientWidth;
  const containerHeight = canvasContainer.value.clientHeight;
  const ballX = Math.max(10, Math.min((x / canvasContainer.value.offsetWidth) * containerWidth, containerWidth - 10));

  // Adjust spawn position to ensure the ball starts within the visible area
  const spawnY = Math.max(20, containerHeight * 0.1); // Start slightly below the top

  const ball = Bodies.circle(ballX, spawnY, 10, {
    restitution: 0.8,
    label: 'ball',
    friction: 0.01, // Adjust friction for smoother behavior
    frictionAir: 0.1, // Further increase air resistance to slow down the fall
  });

  World.add(world, ball);
  console.debug('[Plinko] Spawned ball at', { x: ballX, y: spawnY });
}

function startAutoDrop() {
  console.log('Start Auto Drop functionality not implemented yet.');
}

function resetBoard() {
  if (world) {
    const allBodies = Composite.allBodies(world);
    allBodies.forEach((body) => {
      if (body.label === 'ball' && world) {
        Composite.remove(world, body);
      }
    });
  }
}

function handleCanvasClick(event: MouseEvent) {
  const container = canvasContainer.value;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left; // Calculate the x-coordinate relative to the canvas
  dropBall(x);
}

function handleResize() {
  if (!canvasContainer.value || !engine || !render) return;

  const container = canvasContainer.value;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Update render dimensions
  render.options.width = width;
  render.options.height = height;

  // Reposition the canvas
  Render.setPixelRatio(render, window.devicePixelRatio || 1);
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: width, y: height },
  });

  // Recreate the Plinko board to fit the new dimensions
  createPlinkoBoard();
}

function dropBallFromCenter() {
  const container = canvasContainer.value;
  if (!container) {
    console.error('Canvas container is not initialized.');
    return;
  }

  // Generate a random x-coordinate within the board's width
  const randomX = Math.random() * container.clientWidth;
  dropBall(randomX);
}

onMounted(() => {
  const container = canvasContainer.value;
  if (!container) {
    console.error('Canvas container is not defined');
    return;
  }

  engine = Engine.create();
  world = engine.world;

  // Reset gravity to default value
  engine.gravity.y = 1; // Default gravity

  render = Render.create({
    element: container,
    engine: engine,
    options: {
      width: container.clientWidth,
      height: container.clientHeight,
      wireframes: false,
    },
  });

  if (world) {
    createPlinkoBoard();

    // Add collision detection for slots
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const ball = bodyA.label === 'ball' ? bodyA : bodyB.label === 'ball' ? bodyB : null;
        const slot = bodyA.label?.startsWith('slot-') ? bodyA : bodyB.label?.startsWith('slot-') ? bodyB : null;

        if (ball) {
          console.debug('[Plinko] Ball collision detected', {
            ballId: ball.id,
            ballPosition: ball.position,
            pair,
          });
        }

        if (ball && slot && slot.label) {
          const slotIndex = parseInt(slot.label.split('-')[1] || '0', 10);
          const ballY = ball.position?.y || 0;
          const slotYPos = slot.position?.y || 0;
          const slotHeight = slot.bounds?.max?.y - slot.bounds?.min?.y || 100;

          console.debug('[Plinko] Ball collided with slot', {
            slotLabel: slot.label,
            slotYPos,
            ballY,
            slotHeight,
          });

          // Ensure the ball is fully inside the slot before removal
          if (ballY >= slotYPos - slotHeight / 2 && ballY <= slotYPos + slotHeight / 2) {
            if (!isNaN(slotIndex)) {
              scores.value = scores.value.map((score, index) => (index === slotIndex ? score + 1 : score));
            }
            if (world) {
              console.debug('[Plinko] Removing ball for slot', { slotIndex, ballId: ball.id });
              Composite.remove(world, ball);
            }
          } else {
            console.debug('[Plinko] Ignoring slot collision; ball is not fully inside the slot', { ballY, slotYPos, slotHeight });
          }
        }
      });
    });

    // Add collision end event to track ball lifecycle
    Events.on(engine, 'collisionEnd', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const ball = bodyA.label === 'ball' ? bodyA : bodyB.label === 'ball' ? bodyB : null;
        if (ball) {
          console.debug('[Plinko] Ball collision ended', {
            ballId: ball.id,
            ballPosition: ball.position,
          });
        }
      });
    });
  }

  runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (engine && world) {
    Matter.World.clear(world, true);
  }
  if (render) {
    Matter.Render.stop(render);
  }
  if (runner) {
    Matter.Runner.stop(runner);
  }
  engine = null;
  world = null;
  render = null;
  runner = null;

  window.removeEventListener('resize', handleResize);
});
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
}

.slots {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.slot {
  flex: 1;
  text-align: center;
}

.slot-label {
  font-weight: bold;
}

.slot-score {
  font-size: 24px;
  color: #007bff;
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
  border: 2px dashed rgba(255,0,0,0.7);
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
</style>
