<script setup lang="ts">
import GameCard from '@/components/GameCard.vue'
import InfoPanel from '@/components/InfoPanel.vue'
import LandmarkErickEmbed from '@/components/LandmarkErickEmbed.vue'
import ArnieWoodsEmbed from '@/components/ArnieWoodsEmbed.vue'
import { games } from '@/data/games'

const infoPanels = [
  {
    label: 'Maps',
    title: 'Maps',
    description: 'Built around quick match decisions.',
  },
  {
    label: 'Site Calls',
    title: 'Site Calls',
    description: 'Use dice rolls to pick A, B, mid, or rotate calls.',
  },
  {
    label: 'Warmup',
    title: 'Warmup',
    description: 'Small games and tools for downtime between queues.',
  },
]
</script>

<template>
  <main class="home-cs2">
    <header class="intro-panel">
      <p class="intro-label">CS2 Utility Hub</p>
      <h1>MonkeyHacks</h1>
      <p class="intro-subtitle">
        Counter-Strike 2 tools, site rollers, and small match utilities.
      </p>
      <div class="action-row">
        <RouterLink to="/diceGame" class="action-button action-primary">Open Site Roller</RouterLink>
        <RouterLink to="/plinko" class="action-button action-secondary">Open Plinko</RouterLink>
        <RouterLink to="/aim-duel" class="action-button action-secondary">Open Aim Duel</RouterLink>
        <RouterLink to="/market" class="action-button action-secondary">Open Price Watch</RouterLink>
      </div>
    </header>

    <section class="panel" aria-labelledby="featured-tools-title">
      <div class="section-header compact-header">
        <p class="section-eyebrow">Featured</p>
        <h2 id="featured-tools-title">Featured Tools</h2>
      </div>
      <div class="games-grid">
        <GameCard
          v-for="game in games"
          :key="game.route"
          :title="game.title"
          :description="game.description"
          :route="game.route"
          :category="game.category"
          :status="game.status"
          :button-text="game.buttonText"
        />
      </div>
    </section>

    <section class="panel" aria-labelledby="match-brief-title">
      <div class="section-header compact-header">
        <p class="section-eyebrow">Brief</p>
        <h2 id="match-brief-title">Match Utility Notes</h2>
      </div>
      <div class="info-grid">
        <InfoPanel
          v-for="panel in infoPanels"
          :key="panel.title"
          :label="panel.label"
          :title="panel.title"
          :description="panel.description"
        />
      </div>
    </section>

    <section class="panel" aria-labelledby="extras-title">
      <div class="section-header compact-header">
        <p class="section-eyebrow">Extras</p>
        <h2 id="extras-title">Extras</h2>
      </div>
      <div class="extras-grid">
        <div class="music-stack">
          <LandmarkErickEmbed />
          <ArnieWoodsEmbed />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-cs2 {
  --bg: #0f1319;
  --panel: #161c24;
  --panel-soft: #1a212b;
  --text: #e8eef4;
  --text-muted: rgba(205, 218, 230, 0.83);
  --line: rgba(255, 255, 255, 0.12);
  --accent: #f4a460;
  width: 100%;
  min-height: 100vh;
  padding: clamp(1rem, 2.4vw, 1.7rem);
  background:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    var(--bg);
  background-size:
    36px 36px,
    36px 36px,
    auto;
  color: var(--text);
}

.intro-panel,
.panel {
  width: min(1020px, 100%);
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--panel);
}

.intro-panel {
  padding: clamp(1rem, 2.6vw, 1.5rem);
}

.intro-label {
  margin: 0;
  color: rgba(244, 164, 96, 0.92);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0.5rem 0 0;
  font-size: clamp(1.9rem, 4.2vw, 2.8rem);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.intro-subtitle {
  margin: 0.65rem 0 0;
  max-width: 64ch;
  color: var(--text-muted);
  line-height: 1.5;
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
  padding: 0.58rem 0.9rem;
  border-radius: 8px;
  border: 1px solid transparent;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 700;
  transition:
    background-color 140ms ease,
    border-color 140ms ease,
    transform 140ms ease;
}

.action-primary {
  color: #141920;
  background: var(--accent);
  border-color: var(--accent);
}

.action-secondary {
  color: #dbe8f4;
  background: #202834;
  border-color: rgba(255, 255, 255, 0.17);
}

.action-button:hover {
  transform: translateY(-1px);
}

.action-primary:hover {
  background: #ffb06c;
}

.action-secondary:hover {
  background: #252f3c;
  border-color: rgba(244, 164, 96, 0.5);
}

.action-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.panel {
  margin-top: 0.9rem;
  padding: 1rem;
}

.section-header {
  margin-bottom: 0.8rem;
}

.compact-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(203, 220, 236, 0.74);
}

h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 650;
}

.games-grid,
.info-grid,
.extras-grid {
  display: grid;
  gap: 0.8rem;
}

.games-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.info-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.extras-grid {
  grid-template-columns: 1fr;
}

.music-stack {
  display: grid;
  gap: 0.8rem;
}

@media (max-width: 900px) {
  .games-grid,
  .info-grid,
  .extras-grid {
    grid-template-columns: 1fr;
  }

  .compact-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.35rem;
  }
}
</style>
