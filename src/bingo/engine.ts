import { PRESETS } from './presets'

// --- Seed words for generating readable seeds ---
export const SEED_WORDS = [
  'AMBER','APPLE','ATLAS','BADGE','BEACH','BLAZE','BLOOM','BRAVE','BRICK',
  'BRISK','BROOK','CAMEL','CANDY','CEDAR','CHARM','CHESS','CHIEF','CHIMP',
  'CLIFF','CLOUD','CLOWN','COBRA','CORAL','COMET','CRANE','CRISP','CROWN',
  'DANCE','DELTA','DINGO','DRAKE','DREAM','DRIFT','EAGLE','EMBER','FABLE',
  'FAIRY','FLAME','FLASK','FLINT','FLORA','FORGE','FROST','GHOST','GIANT',
  'GLEAM','GLOBE','GRAPE','GROVE','GUARD','GUAVA','GUSTY','HAVEN','HAZEL',
  'HERON','HONEY','HORSE','IVORY','JEWEL','JOLLY','KARMA','KAYAK','KIOSK',
  'KNIFE','KOALA','LATCH','LEMON','LILAC','LLAMA','LUCKY','LUNAR','LYRIC',
  'MAGIC','MANGO','MAPLE','MARSH','MEDAL','MELON','MIRTH','MOOSE','MOUNT',
  'NOBLE','NORTH','NOVEL','OCEAN','OLIVE','OMEGA','ONION','ORBIT','OTTER',
  'OZONE','PANDA','PEACH','PEARL','PERCH','PILOT','PIXEL','PLAID','PLUME',
  'POLAR','PRISM','PULSE','QUAIL','QUEEN','QUEST','QUIET','QUIRK','QUOTA',
  'RADAR','RAVEN','RIDGE','RIVER','ROBIN','ROCKY','ROVER','ROYAL','RUSTY',
  'SCOUT','SHARK','SHELL','SHINE','SLOTH','SNOWY','SOLAR','SONIC','SPARK',
  'SPICE','SPIKE','SQUID','STEAM','STEEL','STONE','STORM','STORK','SUGAR',
  'SWIFT','TANGO','TIGER','TITAN','TOPAZ','TORCH','TROUT','TULIP','ULTRA',
  'UMBRA','UNITE','UPPER','VAPOR','VAULT','VENOM','VIGOR','VIOLA','VIVID',
  'WALTZ','WHALE','WHEAT','WINDS','WITTY','WOODY','XENON','YACHT','ZEBRA',
]

export function generateRandomSeed(): string {
  return SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)]
}

// --- Seeded PRNG ---
function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// --- Card types ---
export type BingoMode = 'conference' | 'number'

export interface CardState {
  items: (string | number)[]
  checkedCells: Set<number>
  seed: string
  mode: BingoMode
  preset: string
}

// --- Card Generation ---
export function generateConferenceCard(
  seed: string,
  presetId: string,
  customItems?: string[],
): (string | number)[] | null {
  const pool = customItems ?? (PRESETS[presetId] ?? PRESETS['generic']).items
  if (pool.length < 24) return null
  const rng = mulberry32(hashSeed(seed))
  const shuffled = seededShuffle(pool, rng)
  const selected = shuffled.slice(0, 24)
  selected.splice(12, 0, 'FREE')
  return selected
}

export function generateNumberCard(seed: string): (string | number)[] {
  const rng = mulberry32(hashSeed(seed))
  const ranges: [number, number][] = [[1,15],[16,30],[31,45],[46,60],[61,75]]
  const columns = ranges.map(([min, max]) => {
    const pool: number[] = []
    for (let n = min; n <= max; n++) pool.push(n)
    return seededShuffle(pool, rng).slice(0, 5)
  })
  const items: (string | number)[] = []
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      items.push(columns[col][row])
    }
  }
  items[12] = 'FREE'
  return items
}

// --- Winning line detection ---
export const WINNING_LINES: number[][] = [
  [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
  [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
  [0,6,12,18,24], [4,8,12,16,20],
]

export function checkBingo(checkedCells: Set<number>): number[] | null {
  const checked = new Set(checkedCells)
  checked.add(12) // FREE space is always checked
  for (const line of WINNING_LINES) {
    if (line.every(i => checked.has(i))) return line
  }
  return null
}

// --- LocalStorage persistence ---
function storageKey(mode: BingoMode, preset: string, seed: string): string {
  return `bingo-${mode}-${preset}-${seed}`
}

export function saveCheckedState(mode: BingoMode, preset: string, seed: string, cells: Set<number>): void {
  if (!seed) return
  localStorage.setItem(storageKey(mode, preset, seed), JSON.stringify([...cells]))
}

export function loadCheckedState(mode: BingoMode, preset: string, seed: string): Set<number> {
  if (!seed) return new Set()
  const saved = localStorage.getItem(storageKey(mode, preset, seed))
  if (!saved) return new Set()
  try {
    return new Set(JSON.parse(saved) as number[])
  } catch {
    return new Set()
  }
}

export function clearCheckedState(mode: BingoMode, preset: string, seed: string): void {
  if (!seed) return
  localStorage.removeItem(storageKey(mode, preset, seed))
}
