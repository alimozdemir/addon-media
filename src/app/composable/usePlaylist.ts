import { ref } from 'vue'
import { parse } from 'iptv-playlist-parser'

export type PlaylistEntry = {
  title: string
  url: string
  groupTitle: string
  logo: string
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

export function usePlaylist() {
  const liveStreams = ref<PlaylistEntry[]>([])
  const movies = ref<PlaylistEntry[]>([])
  const loading = ref(false)
  const error = ref<Error>()
  const elapsedMs = ref<number>()
  const lastRefreshedAt = ref<string>()

  async function refresh() {
    const start = Date.now()
    loading.value = true
    error.value = undefined;
    liveStreams.value = []
    movies.value = []
    try {
      const res = await $fetch.raw('/api/playlist/download', { responseType: 'stream' })
      const m3uContent = await res.text();

      const parsed = parse(m3uContent)

      for (const item of parsed.items || []) {
        const entry = mapItemToEntry(item)
        const ext = getUrlExtension(entry.url)
        if (ext && MOVIE_EXTENSIONS.has(ext)) {
          movies.value.push(entry)
        } else {
          liveStreams.value.push(entry)
        }
      }
      lastRefreshedAt.value = new Date().toISOString()
    } catch (e: any) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      elapsedMs.value = Date.now() - start
      loading.value = false
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


