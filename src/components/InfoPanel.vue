<script setup lang="ts">
interface InfoPanelProps {
  label: string
  title: string
  description: string
}

const props = defineProps<InfoPanelProps>()
</script>

<template>
  <article class="info-panel">
    <p class="label">{{ props.label }}</p>
    <h3>{{ props.title }}</h3>
    <p class="description">{{ props.description }}</p>
  </article>
</template>

<style scoped>
.info-panel {
  padding: 0.9rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: #131820;
}

.label {
  margin: 0;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(244, 164, 96, 0.82);
}

h3 {
  margin: 0.4rem 0;
  font-size: 1rem;
  color: #ebf2f8;
}

.description {
  margin: 0;
  line-height: 1.45;
  color: rgba(204, 220, 235, 0.85);
}
</style>
