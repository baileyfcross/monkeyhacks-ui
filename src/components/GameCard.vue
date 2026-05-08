<script setup lang="ts">
interface GameCardProps {
  title: string
  description: string
  route: string
  category?: string
  status?: string
  buttonText?: string
}

const props = withDefaults(defineProps<GameCardProps>(), {
  category: 'Utility',
  status: 'Playable',
  buttonText: 'Play Now',
})
</script>

<template>
  <article class="game-card">
    <div class="accent-line" aria-hidden="true"></div>
    <p class="category">{{ props.category }}</p>
    <div class="game-card-top-row">
      <h3>{{ props.title }}</h3>
      <span class="status-pill">{{ props.status }}</span>
    </div>
    <p>{{ props.description }}</p>
    <RouterLink :to="props.route" class="game-button">{{ props.buttonText }}</RouterLink>
  </article>
</template>

<style scoped>
.game-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 210px;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #131820;
  transition:
    border-color 140ms ease,
    transform 140ms ease,
    background-color 140ms ease;
}

.game-card:hover {
  transform: translateY(-1px);
  border-color: rgba(244, 164, 96, 0.55);
  background: #151b24;
}

.accent-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 46px;
  height: 3px;
  border-top-left-radius: 12px;
  background: #f4a460;
}

.category {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(210, 224, 236, 0.74);
}

.game-card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #eff3f7;
}

p {
  margin: 0;
  line-height: 1.5;
  color: rgba(210, 224, 236, 0.86);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.16rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #f7d7b8;
  background: rgba(244, 164, 96, 0.14);
  border: 1px solid rgba(244, 164, 96, 0.35);
}

.game-button {
  margin-top: auto;
  display: inline-flex;
  width: fit-content;
  padding: 0.56rem 0.9rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  color: #12161c;
  background: #f4a460;
  border: 1px solid #f4a460;
  transition:
    transform 150ms ease,
    background-color 150ms ease,
    color 150ms ease;
}

.game-button:hover {
  transform: translateY(-1px);
  background: #ffb06c;
}

.game-button:focus-visible {
  outline: 2px solid #f4a460;
  outline-offset: 2px;
}
</style>
