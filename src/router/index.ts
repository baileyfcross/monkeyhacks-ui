import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DiceView from '@/views/DiceView.vue'
import PlinkoView from '@/views/PlinkoView.vue'
import AimDuelView from '@/views/AimDuelView.vue'
import MarketView from '@/views/MarketView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/diceGame', name: 'dice', component: DiceView },
    { path: '/plinko', name: 'plinko', component: PlinkoView },
    { path: '/aim-duel', name: 'aim-duel', component: AimDuelView },
    { path: '/market', name: 'market', component: MarketView },
  ],
})

export default router
