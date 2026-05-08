export interface GameInfo {
  title: string
  description: string
  route: string
  category: string
  status: string
  buttonText: string
}

export const games: GameInfo[] = [
  {
    title: 'CS Site Roller',
    description: 'Roll for a site call when your group cannot decide where to go next.',
    route: '/diceGame',
    category: 'Utility',
    status: 'Ready',
    buttonText: 'Open Site Roller',
  },
  {
    title: 'Plinko',
    description: 'A small downtime mini game for between queues and warmup breaks.',
    route: '/plinko',
    category: 'Mini Game',
    status: 'Ready',
    buttonText: 'Open Plinko',
  },
  {
    title: 'Aim Duel Odds Simulator',
    description: 'Pick a duel setup, estimate your odds, and simulate the peek result.',
    route: '/aim-duel',
    category: 'Mini Game',
    status: 'Ready',
    buttonText: 'Open Aim Duel',
  },
  {
    title: 'CS2 Skin Price Watch',
    description: 'Read-only market snapshots for quick checks of lowest listed public prices.',
    route: '/market',
    category: 'Market Utility',
    status: 'Ready',
    buttonText: 'Open Price Watch',
  },
]
