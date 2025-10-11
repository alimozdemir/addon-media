import { computed } from 'vue'
import { parse } from 'iptv-playlist-parser'
import { useSearch } from '~/composables/useSearch'

export type PlaylistEntry = {
  title: string
  url: string
  groupTitle: string
  logo: string
  movieType?: 'film' | 'tv series'
}

const MOVIE_EXTENSIONS = new Set([
  'mkv', 'mp4', 'avi', 'mov', 'm4v', 'wmv', 'flv', 'ts', 'mpeg', 'mpg'
])

function getUrlExtension(inputUrl: string): string | null {
  const withoutQuery = inputUrl.split('?')[0] || inputUrl
  const match = withoutQuery.match(/\.([a-zA-Z0-9]+)$/)
  return match && match[1] ? match[1].toLowerCase() : null
}

function mapItemToEntry(item: any): PlaylistEntry {
  const title = (item?.tvg?.name || item?.name || '').toString()
  const groupTitle = (item?.group?.title || '').toString()
  const logo = (item?.tvg?.logo || '').toString()
  const url = (item?.url || '').toString()
  return { title, url, groupTitle, logo }
}

function inferMovieTypeFromGroup(groupTitle: string): 'film' | 'tv series' | undefined {
  const upper = (groupTitle || '').toUpperCase()
  if (upper.includes('FILM')) return 'film'
  if (upper.includes('DIZI')) return 'tv series'
  return undefined
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

      for (const item of parsed.items || []) {
        const base = mapItemToEntry(item)
        const ext = getUrlExtension(base.url)
        if (ext && MOVIE_EXTENSIONS.has(ext)) {
          const movieType = inferMovieTypeFromGroup(base.groupTitle)
          state.value.movies.push({ ...base, movieType })
        } else {
          state.value.liveStreams.push(base)
        }
      }
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


