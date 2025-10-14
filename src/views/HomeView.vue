<template>
  <main class="home">
    <h1>Welcome to Dice Roller!</h1>
    <p>Click below to start rolling some dice.</p>

    <RouterLink to="/diceGame">
      <button>Go to Dice Roller →</button>
    </RouterLink>
  </main>
</template>

<style scoped>
.home {
  text-align: center;
  margin-top: 3rem;
}
button {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
