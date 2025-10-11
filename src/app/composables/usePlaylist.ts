import { computed } from 'vue'
import { parse } from 'iptv-playlist-parser'
import { useSearch } from '~/composables/useSearch'

export type PlaylistEntry = {
  title: string
  url: string
  groupTitle: string
  groupTitleRaw?: string
  logo: string
  movieType?: 'film' | 'tv-series'
  seasons?: { number: string; episodes: PlaylistEntry[] }[]
}

const MOVIE_EXTENSIONS = new Set([
  'mkv', 'mp4', 'avi', 'mov', 'm4v', 'wmv', 'flv', 'ts', 'mpeg', 'mpg'
])

function getUrlExtension(inputUrl: string): string | null {
  const withoutQuery = inputUrl.split('?')[0] || inputUrl
  const match = withoutQuery.match(/\.([a-zA-Z0-9]+)$/)
  return match && match[1] ? match[1].toLowerCase() : null
}

function refineGroupTitle(raw: string): string {
  let s = (raw || '')
  const colon = s.indexOf(':')
  if (colon !== -1) s = s.slice(colon + 1)
  // Trim trailing numbers (e.g., "Drama 2" -> "Drama")
  s = s.replace(/\s*\d+\s*$/i, '')
  // Normalize spaces
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function mapItemToEntry(item: any): PlaylistEntry {
  const title = (item?.tvg?.name || item?.name || '').toString()
  const groupTitleRaw = (item?.group?.title || '').toString()
  const groupTitle = refineGroupTitle(groupTitleRaw)
  const logo = (item?.tvg?.logo || '').toString()
  const url = (item?.url || '').toString()
  return { title, url, groupTitle, groupTitleRaw, logo }
}

function inferMovieTypeFromGroup(groupTitle: string): 'film' | 'tv-series' | undefined {
  const upper = (groupTitle || '').toUpperCase()
  if (upper.includes('FILM')) return 'film'
  if (upper.includes('DIZI')) return 'tv-series'
  return undefined
}

function pad2(n: string | number): string {
  const s = String(n)
  return s.length === 1 ? `0${s}` : s
}

function parseEpisodeInfo(title: string): { seriesTitle: string; season: string; episode: string } | null {
  const t = title.trim()
  const patterns: RegExp[] = [
    /(.*?)[\s_.-]*S(\d{1,2})[\s_.-]*E(\d{1,3})/i,           // Title S01E02 or S01-E02
    /(.*?)[\s_.-]*(\d{1,2})x(\d{1,3})/i,                    // Title 1x02
    /(.*?)[\s_.-]*Season\s*(\d{1,2})[\s_.-]*Episode\s*(\d{1,3})/i, // Season 1 Episode 2
    /(.*?)[\s_.-]*S(\d{1,2})[\s_.-]*Ep?(\d{1,3})/i,        // S01E02 variants
  ]
  for (const rx of patterns) {
    const m = t.match(rx)
    if (m) {
      const rawTitle = (m[1] || '').replace(/[._]/g, ' ').replace(/\s+/g, ' ').trim()
      const season = pad2(m[2]!)
      const episode = pad2(m[3]!)
      const seriesTitle = rawTitle
      if (seriesTitle) return { seriesTitle, season, episode }
    }
  }
  return null
}

// Group only DIZI tv-series entries into aggregated series with seasons/episodes.
function groupAndClassifyEntries(entries: PlaylistEntry[]): { movies: PlaylistEntry[]; streams: PlaylistEntry[] } {
  type SeriesAccum = { title: string; groupTitleRaw: string; groupTitle: string; logo: string; seasons: Map<string, PlaylistEntry[]> }
  const seriesMap = new Map<string, SeriesAccum>()
  const movies: PlaylistEntry[] = []
  const streams: PlaylistEntry[] = []

  for (const base of entries) {
    const ext = getUrlExtension(base.url)
    if (ext && MOVIE_EXTENSIONS.has(ext)) {
      const movieType = inferMovieTypeFromGroup(base.groupTitleRaw || '') || 'film'
      if (movieType === 'tv-series') {
        const epi = parseEpisodeInfo(base.title)
        if (epi) {
          const key = epi.seriesTitle.toLowerCase()
          let acc = seriesMap.get(key)
          if (!acc) {
            acc = { title: epi.seriesTitle, groupTitleRaw: base.groupTitleRaw || '', groupTitle: base.groupTitle, logo: base.logo, seasons: new Map() }
            seriesMap.set(key, acc)
          } else {
            if (base.logo) acc.logo = base.logo
            if (base.groupTitleRaw) acc.groupTitleRaw = base.groupTitleRaw
            if (base.groupTitle) acc.groupTitle = base.groupTitle
          }
          const seasonKey = epi.season
          if (!acc.seasons.has(seasonKey)) acc.seasons.set(seasonKey, [])
          acc.seasons.get(seasonKey)!.push({ ...base, movieType })
          continue
        }
      }
      movies.push({ ...base, movieType })
    } else {
      streams.push(base)
    }
  }

  for (const acc of seriesMap.values()) {
    const seasons = Array.from(acc.seasons.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([number, episodes]) => ({ number, episodes }))
    movies.push({
      title: acc.title,
      url: '',
      logo: acc.logo,
      groupTitle: acc.groupTitle,
      groupTitleRaw: acc.groupTitleRaw,
      movieType: 'tv-series',
      seasons,
    })
  }

  return { movies, streams }
}

type PlaylistState = {
  liveStreams: PlaylistEntry[]
  movies: PlaylistEntry[]
  loading: boolean
  error?: Error
  elapsedMs?: number
  lastRefreshedAt?: string
}

export function usePlaylist() {
  const state = useState<PlaylistState>('playlist-state', () => ({
    liveStreams: [],
    movies: [],
    loading: false,
    error: undefined,
    elapsedMs: undefined,
    lastRefreshedAt: undefined,
  }))

  const liveStreams = computed(() => state.value.liveStreams)
  const movies = computed(() => state.value.movies)
  const loading = computed(() => state.value.loading)
  const error = computed(() => state.value.error)
  const elapsedMs = computed(() => state.value.elapsedMs)
  const lastRefreshedAt = computed(() => state.value.lastRefreshedAt)

  async function refresh() {
    if (state.value.loading) return
    const start = Date.now()
    state.value.loading = true
    state.value.error = undefined
    state.value.liveStreams = []
    state.value.movies = []
    try {
      const res = await $fetch.raw('/api/playlist/download', { responseType: 'stream' })
      const m3uContent = await res.text()

      const parsed = parse(m3uContent)
      const baseEntries = (parsed.items || []).map(mapItemToEntry)
      const grouped = groupAndClassifyEntries(baseEntries)
      state.value.movies = grouped.movies
      state.value.liveStreams = grouped.streams
      // Upsert all entries into search index (IndexedDB) on client
      const search = useSearch()
      await search.upsertAll([...state.value.movies, ...state.value.liveStreams])
      state.value.lastRefreshedAt = new Date().toISOString()
    } catch (e: any) {
      state.value.error = e instanceof Error ? e : new Error(String(e))
    } finally {
      state.value.elapsedMs = Date.now() - start
      state.value.loading = false
    }
  }

  return {
    liveStreams,
    movies,
    loading,
    error,
    elapsedMs,
    lastRefreshedAt,
    refresh,
  }
}


