const WEAR_VALUES = [
  'Factory New',
  'Minimal Wear',
  'Field-Tested',
  'Well-Worn',
  'Battle-Scarred',
] as const

const WEAR_PATTERN = new RegExp(`\\((${WEAR_VALUES.join('|')})\\)$`)

export function parseWear(marketHashName: string): string | undefined {
  const match = marketHashName.match(WEAR_PATTERN)
  return match?.[1]
}

export function parseWeapon(marketHashName: string): string | undefined {
  const [weaponPart] = marketHashName.split('|')
  const weapon = weaponPart?.trim()
  return weapon ? weapon : undefined
}

export function parseSkinName(marketHashName: string): string | undefined {
  if (!marketHashName.includes('|')) {
    return undefined
  }

  const skinPart = marketHashName.split('|')[1]
  if (!skinPart) {
    return undefined
  }

  return skinPart.replace(WEAR_PATTERN, '').trim() || undefined
}

export function parseDisplayName(marketHashName: string): string {
  const weapon = parseWeapon(marketHashName)
  const skinName = parseSkinName(marketHashName)

  if (weapon && skinName) {
    return `${weapon} | ${skinName}`
  }

  return marketHashName.replace(WEAR_PATTERN, '').trim()
}
