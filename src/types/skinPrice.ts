export type SkinMarket = 'Skinport' | 'Steam' | 'CSFloat' | 'Pricempire' | 'SteamAnalyst'

export type SkinPrice = {
  marketHashName: string
  displayName: string
  weapon?: string
  skinName?: string
  wear?: string
  market: SkinMarket
  lowestPrice: number | null
  currency: 'USD'
  quantity?: number
  marketUrl?: string
  imageUrl?: string
  lastUpdated: string
}

export type SkinPricesApiResponse = {
  items: SkinPrice[]
  lastUpdated: string
  stale: boolean
  error?: string
}
