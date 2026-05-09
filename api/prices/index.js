let cachedPayload = null;
let cachedAt = 0;

const CACHE_TTL_MS = 5 * 60 * 1000;
const SKINPORT_URL = 'https://api.skinport.com/v1/items?app_id=730&currency=USD';
const WEAR_VALUES = [
  'Factory New',
  'Minimal Wear',
  'Field-Tested',
  'Well-Worn',
  'Battle-Scarred',
];

function parseWear(marketHashName) {
  return WEAR_VALUES.find((wear) => marketHashName.includes(`(${wear})`));
}

function parseWeapon(marketHashName) {
  const [weapon] = marketHashName.split('|');
  const trimmedWeapon = weapon && weapon.trim();
  return trimmedWeapon || undefined;
}

function parseSkinName(marketHashName) {
  const parts = marketHashName.split('|');

  if (parts.length < 2) {
    return undefined;
  }

  return parts[1]
    .replace(/\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)$/, '')
    .trim() || undefined;
}

function parseDisplayName(marketHashName) {
  const weapon = parseWeapon(marketHashName);
  const skinName = parseSkinName(marketHashName);

  if (weapon && skinName) {
    return `${weapon} | ${skinName}`;
  }

  return marketHashName.replace(/\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)$/, '').trim();
}

function toLastUpdated(item) {
  if (typeof item.updated_at === 'number') {
    return new Date(item.updated_at * 1000).toISOString();
  }

  return new Date().toISOString();
}

function normalizeSkinportItem(item) {
  const marketHashName = (item.market_hash_name || item.name || '').trim();

  if (!marketHashName) {
    return null;
  }

  const lastUpdated = toLastUpdated(item);

  return {
    marketHashName,
    displayName: parseDisplayName(marketHashName),
    weapon: parseWeapon(marketHashName),
    skinName: parseSkinName(marketHashName),
    wear: parseWear(marketHashName),
    market: 'Skinport',
    lowestPrice: typeof item.min_price === 'number' ? item.min_price : null,
    currency: 'USD',
    quantity: typeof item.quantity === 'number' ? item.quantity : undefined,
    marketUrl: item.market_page || item.item_page || undefined,
    imageUrl: item.image || undefined,
    lastUpdated,
  };
}

module.exports = async function (context) {
  const now = Date.now();

  context.res = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  };

  try {
    if (cachedPayload && now - cachedAt < CACHE_TTL_MS) {
      context.res.status = 200;
      context.res.body = cachedPayload;
      return;
    }

    const response = await fetch(SKINPORT_URL, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'br',
        'User-Agent': 'MonkeyHacks-Price-Watch/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Skinport returned status ${response.status}`);
    }

    const rawItems = await response.json();
    const items = Array.isArray(rawItems)
      ? rawItems.map(normalizeSkinportItem).filter(Boolean)
      : [];
    const lastUpdated = new Date().toISOString();

    cachedPayload = {
      items,
      lastUpdated,
      stale: false,
    };

    cachedAt = now;

    context.res.status = 200;
    context.res.body = cachedPayload;
  } catch (error) {
    context.log.error('Failed to fetch skin prices:', error);

    if (cachedPayload) {
      context.res.status = 200;
      context.res.body = {
        items: cachedPayload.items,
        lastUpdated: cachedPayload.lastUpdated,
        stale: true,
        error: 'Skinport is temporarily unavailable. Showing cached prices.',
      };
      return;
    }

    context.res.status = 502;
    context.res.body = {
      items: [],
      lastUpdated: new Date().toISOString(),
      stale: false,
      error: 'Unable to load price data right now. Please try again shortly.',
    };
  }
};
