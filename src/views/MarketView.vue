<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { SkinPrice, SkinPricesApiResponse } from '@/types/skinPrice'

const loading = ref(true)
const errorMessage = ref('')
const apiNotice = ref('')
const items = ref<SkinPrice[]>([])
const apiLastUpdated = ref('')

const searchQuery = ref('')
const selectedWear = ref('all')
const selectedWeapon = ref('all')
const maxPrice = ref('')

const DISPLAY_LIMIT = 250

const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred']

const weaponOptions = computed(() => {
  return Array.from(
    new Set(
      items.value
        .map((item) => item.weapon)
        .filter((weapon): weapon is string => typeof weapon === 'string' && weapon.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b))
})

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const wear = selectedWear.value
  const weapon = selectedWeapon.value
  const parsedMaxPrice = Number.parseFloat(maxPrice.value)
  const shouldFilterByPrice = Number.isFinite(parsedMaxPrice) && parsedMaxPrice >= 0

  return items.value.filter((item) => {
    const matchesQuery =
      query.length === 0 ||
      item.displayName.toLowerCase().includes(query) ||
      item.marketHashName.toLowerCase().includes(query)

    if (!matchesQuery) {
      return false
    }

    if (wear !== 'all' && item.wear !== wear) {
      return false
    }

    if (weapon !== 'all' && item.weapon !== weapon) {
      return false
    }

    if (shouldFilterByPrice) {
      if (item.lowestPrice === null) {
        return false
      }

      return item.lowestPrice <= parsedMaxPrice
    }

    return true
  })
})

const visibleItems = computed(() => filteredItems.value.slice(0, DISPLAY_LIMIT))
const isLimited = computed(() => filteredItems.value.length > DISPLAY_LIMIT)

const showEmptyState = computed(() => !loading.value && !errorMessage.value && filteredItems.value.length === 0)

function formatPrice(price: number | null): string {
  if (price === null) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return date.toLocaleString()
}

async function loadPrices() {
  loading.value = true
  errorMessage.value = ''
  apiNotice.value = ''

  try {
    const response = await fetch('/api/skins/prices')
    const payload = (await response.json()) as SkinPricesApiResponse
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
    throw new Error(`Price API failed with status ${response.status}`);
  }

    if (!contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Expected JSON but received:", text.slice(0, 300));
    throw new Error("Price API returned a non-JSON response.");
  }

    items.value = payload.items
    apiLastUpdated.value = payload.lastUpdated

    if (payload.error) {
      apiNotice.value = payload.error
    } else if (payload.stale) {
      apiNotice.value = 'Showing cached data.'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load skin prices.'
    errorMessage.value = message
    items.value = []
    apiLastUpdated.value = ''
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadPrices()
})
</script>

<template>
  <main class="market-view">
    <section class="hero-panel">
      <p class="eyebrow">Read-Only Price Watch</p>
      <h1>CS2 Skin Price Watch</h1>
      <p class="subtitle">
        Track the lowest listed prices across selected CS2 skin markets. No buying, no selling, just quick
        price checks.
      </p>
      <div class="hero-links">
        <RouterLink to="/" class="nav-link">Back to Home</RouterLink>
      </div>
    </section>

    <section class="controls-panel" aria-label="Filters">
      <label class="control">
        <span>Search skin name</span>
        <input v-model="searchQuery" type="search" placeholder="e.g. Redline" />
      </label>

      <label class="control">
        <span>Wear</span>
        <select v-model="selectedWear">
          <option value="all">All</option>
          <option v-for="wear in wears" :key="wear" :value="wear">{{ wear }}</option>
        </select>
      </label>

      <label class="control">
        <span>Weapon</span>
        <select v-model="selectedWeapon">
          <option value="all">All</option>
          <option v-for="weapon in weaponOptions" :key="weapon" :value="weapon">{{ weapon }}</option>
        </select>
      </label>

      <label class="control">
        <span>Max price (USD)</span>
        <input v-model="maxPrice" type="number" min="0" step="0.01" placeholder="Optional" />
      </label>
    </section>

    <section class="results-panel" aria-label="Price results">
      <div class="results-header">
        <h2>Price Results</h2>
        <p v-if="apiLastUpdated" class="updated">Last sync: {{ formatDate(apiLastUpdated) }}</p>
      </div>

      <p v-if="apiNotice" class="notice">{{ apiNotice }}</p>
      <p v-if="loading" class="state">Loading skin prices...</p>
      <p v-else-if="errorMessage" class="state error">{{ errorMessage }}</p>
      <p v-else-if="showEmptyState" class="state">No skins matched your search.</p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Skin</th>
              <th>Wear</th>
              <th>Lowest Price</th>
              <th>Currency</th>
              <th>Quantity</th>
              <th>Market</th>
              <th>Source</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleItems" :key="`${item.market}-${item.marketHashName}`">
              <td>
                <div class="name-cell">
                  <strong>{{ item.displayName }}</strong>
                  <small>{{ item.marketHashName }}</small>
                </div>
              </td>
              <td>{{ item.wear || 'Unknown' }}</td>
              <td>{{ formatPrice(item.lowestPrice) }}</td>
              <td>{{ item.currency }}</td>
              <td>{{ typeof item.quantity === 'number' ? item.quantity : 'Unknown' }}</td>
              <td>{{ item.market }}</td>
              <td>
                <a
                  v-if="item.marketUrl"
                  :href="item.marketUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="source-link"
                >
                  View on market
                </a>
                <span v-else>N/A</span>
              </td>
              <td>{{ formatDate(item.lastUpdated) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!loading && !errorMessage && isLimited" class="limit-note">
        Showing first {{ DISPLAY_LIMIT }} results for performance.
      </p>
    </section>

    <section class="disclaimer-panel">
      <p>
        Prices are informational, may be delayed, and can change at any time. MonkeyHacks does not process
        purchases, sales, trades, deposits, or withdrawals.
      </p>
    </section>
  </main>
</template>

<style scoped>
.market-view {
  --bg: #0f141b;
  --panel: #171e27;
  --panel-soft: #1c2430;
  --line: rgba(255, 255, 255, 0.12);
  --text: #e4edf5;
  --muted: rgba(212, 224, 235, 0.78);
  --accent: #f2ad5f;
  --danger: #ff7f7f;

  width: 100%;
  min-height: 100vh;
  padding: clamp(1rem, 2.5vw, 1.8rem);
  display: grid;
  gap: 0.9rem;
  background:
    radial-gradient(circle at 20% 0%, rgba(242, 173, 95, 0.08), transparent 34%),
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    var(--bg);
  background-size:
    auto,
    32px 32px,
    32px 32px,
    auto;
  color: var(--text);
}

.hero-panel,
.controls-panel,
.results-panel,
.disclaimer-panel {
  width: min(1120px, 100%);
  margin: 0 auto;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--panel);
}

.hero-panel,
.results-panel,
.disclaimer-panel {
  padding: clamp(1rem, 2.4vw, 1.4rem);
}

.controls-panel {
  padding: 0.9rem;
  background: var(--panel-soft);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: rgba(242, 173, 95, 0.95);
}

h1 {
  margin: 0.5rem 0 0;
  font-size: clamp(1.7rem, 3.6vw, 2.4rem);
  letter-spacing: 0.01em;
}

.subtitle {
  margin: 0.65rem 0 0;
  max-width: 75ch;
  color: var(--muted);
  line-height: 1.5;
}

.hero-links {
  margin-top: 1rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.56rem 0.85rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: var(--text);
  background: #202938;
  text-decoration: none;
  font-weight: 650;
  transition: background-color 140ms ease;
}

.nav-link:hover {
  background: #293548;
}

.control {
  display: grid;
  gap: 0.35rem;
}

.control span {
  font-size: 0.82rem;
  color: var(--muted);
}

input,
select {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #111822;
  color: var(--text);
  padding: 0.58rem 0.64rem;
}

input:focus-visible,
select:focus-visible,
.source-link:focus-visible,
.nav-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.6rem;
}

h2 {
  margin: 0;
  font-size: 1.08rem;
}

.updated {
  margin: 0;
  font-size: 0.82rem;
  color: var(--muted);
}

.notice,
.state,
.limit-note {
  margin: 0.75rem 0 0;
  color: var(--muted);
}

.state.error {
  color: var(--danger);
}

.table-wrap {
  margin-top: 0.8rem;
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 10px;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

th,
td {
  padding: 0.58rem 0.66rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  vertical-align: top;
}

th {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(214, 226, 238, 0.75);
  background: rgba(10, 14, 20, 0.55);
}

tbody tr:hover {
  background: rgba(242, 173, 95, 0.06);
}

.name-cell {
  display: grid;
  gap: 0.2rem;
}

.name-cell strong {
  font-size: 0.92rem;
}

.name-cell small {
  color: var(--muted);
  word-break: break-word;
}

.source-link {
  color: var(--accent);
}

.disclaimer-panel p {
  margin: 0;
  color: var(--muted);
  line-height: 1.45;
}

@media (max-width: 960px) {
  .controls-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .controls-panel {
    grid-template-columns: 1fr;
  }

  .market-view {
    padding: 0.8rem;
  }
}
</style>
