import type { SkinPrice, SkinPricesApiResponse } from '../src/types/skinPrice'
import { parseDisplayName, parseSkinName, parseWeapon, parseWear } from '../src/utils/skinParsing'

type SkinportItem = {
  market_hash_name?: string
  min_price?: number | null
  currency?: string
  quantity?: number
  market_page?: string
  item_page?: string
  image?: string
  updated_at?: number
}

const SKINPORT_ITEMS_URL = 'https://api.skinport.com/v1/items?app_id=730&currency=USD'
const CACHE_TTL_MS = 5 * 60 * 1000

let cachedPayload: { items: SkinPrice[]; lastUpdated: string; cachedAt: number } | null = null

function toLastUpdated(updatedAt?: number): string {
  if (!updatedAt) {
    return new Date().toISOString()
  }

  return new Date(updatedAt * 1000).toISOString()
}

function normalizeSkinportItem(item: SkinportItem): SkinPrice | null {
  const marketHashName = item.market_hash_name?.trim()

  if (!marketHashName) {
    return null
  }

  const currency = item.currency === 'USD' ? 'USD' : 'USD'

  return {
    marketHashName,
    displayName: parseDisplayName(marketHashName),
    weapon: parseWeapon(marketHashName),
    skinName: parseSkinName(marketHashName),
    wear: parseWear(marketHashName),
    market: 'Skinport',
    lowestPrice: typeof item.min_price === 'number' ? item.min_price : null,
    currency,
    quantity: typeof item.quantity === 'number' ? item.quantity : undefined,
    marketUrl: item.market_page ?? item.item_page,
    imageUrl: item.image,
    lastUpdated: toLastUpdated(item.updated_at),
  }
}

async function fetchSkinportItems(): Promise<SkinPrice[]> {
  const response = await fetch(SKINPORT_ITEMS_URL, {
    headers: {
      'Accept-Encoding': 'br',
    },
  })

  if (!response.ok) {
    throw new Error(`Skinport request failed with status ${response.status}`)
  }

  const data = (await response.json()) as SkinportItem[]

  return data
    .map(normalizeSkinportItem)
    .filter((item): item is SkinPrice => item !== null)
}

export async function getSkinPrices(): Promise<{ payload: SkinPricesApiResponse; statusCode: number }> {
  const now = Date.now()
  if (cachedPayload && now - cachedPayload.cachedAt < CACHE_TTL_MS) {
    return {
      statusCode: 200,
      payload: {
        items: cachedPayload.items,
        lastUpdated: cachedPayload.lastUpdated,
        stale: false,
      },
    }
  }

  try {
    const items = await fetchSkinportItems()
    const lastUpdated = new Date().toISOString()

    cachedPayload = {
      items,
      lastUpdated,
      cachedAt: now,
    }

    return {
      statusCode: 200,
      payload: {
        items,
        lastUpdated,
        stale: false,
      },
    }
  } catch {
    if (cachedPayload) {
      return {
        statusCode: 200,
        payload: {
          items: cachedPayload.items,
          lastUpdated: cachedPayload.lastUpdated,
          stale: true,
          error: 'Skinport is temporarily unavailable. Showing cached prices.',
        },
      }
    }

    return {
      statusCode: 502,
      payload: {
        items: [],
        lastUpdated: new Date().toISOString(),
        stale: false,
        error: 'Unable to load price data right now. Please try again shortly.',
      },
    }
  }
}
