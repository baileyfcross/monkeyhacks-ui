<template>
  <section class="hero-section">
    <div class="hero-glow" aria-hidden="true"></div>
    <p class="eyebrow">Arcade Portal</p>
    <h1>MonkeyHacks</h1>
    <p class="tagline">Small games, experiments, and arcade-style web projects.</p>

    <div class="hero-actions">
      <RouterLink to="/diceGame" class="hero-link hero-link-primary">
        Play CS Site Roller
      </RouterLink>
      <RouterLink to="/plinko" class="hero-link hero-link-secondary">Play Plinko</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  width: min(1080px, 100%);
  margin: 0 auto;
  padding: clamp(2rem, 6vw, 4rem);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 150, 64, 0.18), transparent 52%),
    radial-gradient(circle at 80% 90%, rgba(29, 242, 186, 0.14), transparent 48%),
    rgba(12, 14, 23, 0.72);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  inset: -30%;
  background: conic-gradient(from 90deg, rgba(255, 98, 0, 0.16), rgba(23, 180, 240, 0.18), transparent 55%);
  filter: blur(56px);
  opacity: 0.8;
  pointer-events: none;
}

.eyebrow,
h1,
.tagline,
.hero-actions {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin: 0;
  font-size: 0.86rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(208, 228, 255, 0.78);
}

h1 {
  margin: 0.8rem 0 0;
  font-size: clamp(2.2rem, 7vw, 4.8rem);
  line-height: 1.02;
  letter-spacing: 0.03em;
  color: #f7fbff;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

.tagline {
  margin: 1rem 0 0;
  max-width: 60ch;
  font-size: clamp(1rem, 2.6vw, 1.2rem);
  line-height: 1.6;
  color: rgba(220, 232, 249, 0.9);
}

.hero-actions {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.hero-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.78rem 1.3rem;
  border-radius: 999px;
  border: 1px solid transparent;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.01em;
  transition:
    transform 170ms ease,
    box-shadow 170ms ease,
    border-color 170ms ease,
    background-color 170ms ease;
}

.hero-link-primary {
  color: #070d1a;
  background: linear-gradient(135deg, #f5e169, #f88a39);
  box-shadow: 0 12px 24px rgba(248, 138, 57, 0.35);
}

.hero-link-secondary {
  color: #dbeeff;
  background: rgba(22, 33, 58, 0.6);
  border-color: rgba(114, 191, 255, 0.45);
}

.hero-link:hover {
  transform: translateY(-2px);
}

.hero-link-primary:hover {
  box-shadow: 0 16px 30px rgba(248, 138, 57, 0.42);
}

.hero-link-secondary:hover {
  border-color: rgba(133, 223, 255, 0.85);
  background: rgba(30, 47, 80, 0.8);
}

.hero-link:focus-visible {
  outline: 3px solid #80dfff;
  outline-offset: 3px;
}
</style>
