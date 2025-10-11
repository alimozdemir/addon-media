// Web worker to run IndexedDB searches off the main thread

type PlaylistEntry = {
  title: string
  url: string
  groupTitle: string
  groupTitleRaw?: string
  logo: string
  movieType?: 'film' | 'tv-series'
  seasons?: { number: string; episodes: PlaylistEntry[] }[]
}

const DB_NAME = 'addon-media'
const DB_VERSION = 4
const STORE_NAME = 'playlist'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      let store: IDBObjectStore
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'title' })
      } else {
        store = req.transaction!.objectStore(STORE_NAME)
      }
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

async function idbSearchByTitleContains(db: IDBDatabase, query: string, limit = 50): Promise<PlaylistEntry[]> {
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

type Req = { id: number; type: 'searchTitle' | 'getAll' | 'searchGroup'; payload?: any }
type Res = { id: number; ok: true; result: any } | { id: number; ok: false; error: string }

self.onmessage = async (ev: MessageEvent<Req>) => {
  const { id, type, payload } = ev.data
  try {
    const db = await openDb()
    let result: any
    if (type === 'searchTitle') {
      result = await idbSearchByTitleContains(db, payload?.query || '', payload?.limit || 50)
    } else if (type === 'getAll') {
      result = await idbGetAll(db)
    } else if (type === 'searchGroup') {
      result = await idbSearchByGroupTitleContains(db, payload?.query || '', payload?.limit || 100)
    } else {
      throw new Error('Unknown request type')
    }
    const res: Res = { id, ok: true, result }
    ;(self as any).postMessage(res)
  } catch (e: any) {
    const res: Res = { id, ok: false, error: e?.message || String(e) }
    ;(self as any).postMessage(res)
  }
}


