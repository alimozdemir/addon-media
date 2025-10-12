import { computed } from 'vue'

import type { PlaylistEntry } from '~/composables/usePlaylist'

type SearchState = {
  ready: boolean
  lastSyncAt?: string
}

const DB_NAME = 'addon-media'
const DB_VERSION = 4
const STORE_NAME = 'playlist'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      // When running on server, IndexedDB is not available. Resolve with a dummy error.
      return reject(new Error('IndexedDB not available'))
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      let store: IDBObjectStore
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'title' })
      } else {
        store = req.transaction!.objectStore(STORE_NAME)
      }
      // Ensure indexes exist
      if (!Array.from(store.indexNames).includes('title_idx')) {
        store.createIndex('title_idx', 'title', { unique: true })
      }
      if (!Array.from(store.indexNames).includes('title_lower')) {
        store.createIndex('title_lower', 'titleLower', { unique: false })
      }
      if (!Array.from(store.indexNames).includes('group_title_lower')) {
        store.createIndex('group_title_lower', 'groupTitleLower', { unique: false })
      }
      if (!Array.from(store.indexNames).includes('group_title')) {
        store.createIndex('group_title', 'groupTitle', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbBulkUpsert(db: IDBDatabase, entries: PlaylistEntry[]): Promise<void> {
  function toPlainSerializable<T>(value: T): T {
    try {
      return JSON.parse(JSON.stringify(value)) as T
    } catch {
      return value
    }
  }

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue
      const plain = toPlainSerializable(entry) as any
      const toStore: any = {
        ...plain,
        titleLower: (plain.title || '').toLowerCase(),
        groupTitleLower: (plain.groupTitle || '').toLowerCase(),
      }
      if (Array.isArray(toStore)) continue
      store.put(toStore)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

async function idbGetByTitle(db: IDBDatabase, title: string): Promise<PlaylistEntry | undefined> {
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(title)
    req.onsuccess = () => resolve(req.result as PlaylistEntry | undefined)
    req.onerror = () => reject(req.error)
  })
}

async function idbGetByTitleLower(db: IDBDatabase, titleLower: string): Promise<PlaylistEntry | undefined> {
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('title_lower')
    const req = index.get((titleLower || '').toLowerCase())
    req.onsuccess = () => resolve(req.result as PlaylistEntry | undefined)
    req.onerror = () => reject(req.error)
  })
}

async function idbSearchByTitleContains(db: IDBDatabase, query: string, limit = 50): Promise<PlaylistEntry[]> {
  // Case-insensitive substring search by scanning title_lower index; stops at `limit` results
  return await new Promise((resolve, reject) => {
    const results: PlaylistEntry[] = []
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('title_lower')
    const lower = query.toLowerCase()
    const cursorReq = index.openCursor()
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result
      if (!cursor) return resolve(results)
      const value = cursor.value as any
      const titleLower = (value?.titleLower || value?.title || '').toLowerCase()
      if (titleLower.includes(lower)) {
        results.push(value as PlaylistEntry)
        if (results.length >= limit) return resolve(results)
      }
      cursor.continue()
    }
    cursorReq.onerror = () => reject(cursorReq.error)
  })
}

async function idbSearchByGroupTitleContains(db: IDBDatabase, query: string, limit = 100): Promise<PlaylistEntry[]> {
  return await new Promise((resolve, reject) => {
    const results: PlaylistEntry[] = []
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('group_title_lower')
    const lower = query.toLowerCase()
    const cursorReq = index.openCursor()
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result
      if (!cursor) return resolve(results)
      const value = cursor.value as any
      const gtl = (value?.groupTitleLower || value?.groupTitle || '').toLowerCase()
      if (gtl.includes(lower)) {
        results.push(value as PlaylistEntry)
        if (results.length >= limit) return resolve(results)
      }
      cursor.continue()
    }
    cursorReq.onerror = () => reject(cursorReq.error)
  })
}

async function idbGetAll(db: IDBDatabase): Promise<PlaylistEntry[]> {
  return await new Promise((resolve, reject) => {
    const results: PlaylistEntry[] = []
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.openCursor()
    req.onsuccess = () => {
      const cursor = req.result
      if (!cursor) return resolve(results)
      results.push(cursor.value as PlaylistEntry)
      cursor.continue()
    }
    req.onerror = () => reject(req.error)
  })
}

async function idbGetAllGroups(db: IDBDatabase): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    const groups = new Set<string>()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('group_title')
    const req = index.openCursor()
    req.onsuccess = () => {
      const cursor = req.result
      if (!cursor) return resolve(Array.from(groups).sort((a, b) => a.localeCompare(b)))
      const val = cursor.value as any
      const gt = (val?.groupTitle || '').toString().trim()
      if (gt) groups.add(gt)
      cursor.continue()
    }
    req.onerror = () => reject(req.error)
  })
}

export function useSearch() {
  const state = useState<SearchState>('search-state', () => ({
    ready: false,
    lastSyncAt: undefined,
  }))

  // Web worker plumbing for off-main-thread queries
  const workerRef = useState<Worker | null>('search-worker', () => null)
  const reqIdRef = useState<number>('search-worker-reqid', () => 0)

  function ensureWorker(): Worker | null {
    if (typeof window === 'undefined') return null
    if (workerRef.value) return workerRef.value
    try {
      const w = new Worker(new URL('~/workers/search.worker.ts', import.meta.url), { type: 'module' })
      workerRef.value = w
      return w
    } catch {
      return null
    }
  }

  function callWorker<T>(type: 'searchTitle' | 'getAll' | 'searchGroup' | 'searchTitlePaged' | 'getAllPaged' | 'getGroups', payload?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const w = ensureWorker()
      if (!w) return reject(new Error('Worker not available'))
      const id = ++reqIdRef.value
      const onMessage = (ev: MessageEvent<any>) => {
        const data = ev.data
        if (!data || data.id !== id) return
        w.removeEventListener('message', onMessage)
        if (data.ok) resolve(data.result as T)
        else reject(new Error(String(data.error)))
      }
      w.addEventListener('message', onMessage)
      w.postMessage({ id, type, payload })
    })
  }

  async function getAllPaged(offset: number, limit: number, filter: 'all' | 'film' | 'tv-series', groups: string[] = []): Promise<PlaylistEntry[]> {
    try {
      return await callWorker<PlaylistEntry[]>('getAllPaged', { offset, limit, filter, groups })
    } catch {
      // fallback: main-thread scan with filter
      const all = await getAll()
      const byType = filter === 'all' ? all : all.filter(i => i.movieType === filter)
      const items = (groups && groups.length > 0) ? byType.filter(i => groups.includes(i.groupTitle)) : byType
      return items.slice(offset, offset + limit)
    }
  }

  async function searchByTitlePaged(query: string, offset: number, limit: number, filter: 'all' | 'film' | 'tv-series', groups: string[] = []): Promise<PlaylistEntry[]> {
    const q = (query || '').trim().toLowerCase()
    if (!q) return await getAllPaged(offset, limit, filter, groups)
    try {
      return await callWorker<PlaylistEntry[]>('searchTitlePaged', { query: q, offset, limit, filter, groups })
    } catch {
      // fallback
      const res = await searchByTitle(q, Number.MAX_SAFE_INTEGER)
      const byType = filter === 'all' ? res : res.filter(i => i.movieType === filter)
      const items = (groups && groups.length > 0) ? byType.filter(i => groups.includes(i.groupTitle)) : byType
      return items.slice(offset, offset + limit)
    }
  }

  async function getGroups(filter: 'all' | 'film' | 'tv-series'): Promise<string[]> {
    try {
      return await callWorker<string[]>('getGroups', { filter })
    } catch {
      const all = await getAll()
      const byType = filter === 'all' ? all : all.filter(i => i.movieType === filter)
      return Array.from(new Set(byType.map(i => i.groupTitle))).sort((a, b) => a.localeCompare(b))
    }
  }

  const ready = computed(() => state.value.ready)
  const lastSyncAt = computed(() => state.value.lastSyncAt)

  async function ensureDb(): Promise<IDBDatabase | null> {
    try {
      const db = await openDb()
      if (!state.value.ready) state.value.ready = true
      return db
    } catch {
      // Likely SSR or unsupported environment; fall back to memory only
      return null
    }
  }

  async function upsertAll(entries: PlaylistEntry[]) {
    state.value.lastSyncAt = new Date().toISOString()
    const db = await ensureDb()
    if (db) await idbBulkUpsert(db, entries)
  }

  async function searchByTitle(query: string, limit = 50): Promise<PlaylistEntry[]> {
    const q = (query || '').trim().toLowerCase()
    if (!q) return []
    // Prefer worker
    try {
      return await callWorker<PlaylistEntry[]>('searchTitle', { query: q, limit })
    } catch {
      const db = await ensureDb()
      if (!db) return []
      return await idbSearchByTitleContains(db, q, limit)
    }
  }

  async function getByTitle(title: string): Promise<PlaylistEntry | undefined> {
    const db = await ensureDb()
    if (!db) return undefined
    return await idbGetByTitle(db, title)
  }

  async function getByTitleLower(titleLower: string): Promise<PlaylistEntry | undefined> {
    const db = await ensureDb()
    if (!db) return undefined
    return await idbGetByTitleLower(db, (titleLower || '').toLowerCase())
  }

  async function searchByGroupTitle(query: string, limit = 100): Promise<PlaylistEntry[]> {
    const q = (query || '').trim().toLowerCase()
    if (!q) return []
    try {
      return await callWorker<PlaylistEntry[]>('searchGroup', { query: q, limit })
    } catch {
      const db = await ensureDb()
      if (!db) return []
      return await idbSearchByGroupTitleContains(db, q, limit)
    }
  }

  async function getAll(): Promise<PlaylistEntry[]> {
    try {
      return await callWorker<PlaylistEntry[]>('getAll')
    } catch {
      const db = await ensureDb()
      if (!db) return []
      return await idbGetAll(db)
    }
  }

  async function getAllGroups(): Promise<string[]> {
    const db = await ensureDb()
    if (!db) return []
    return await idbGetAllGroups(db)
  }

  return {
    ready,
    lastSyncAt,
    upsertAll,
    searchByTitle,
    searchByGroupTitle,
    getByTitle,
    getByTitleLower,
    getAll,
    getAllPaged,
    searchByTitlePaged,
    getGroups,
    getAllGroups,
  }
}


