import { APIKey } from './types/server/api'
import { ENV } from './types/common/env'

declare module 'nuxt/schema' {

}

declare module '#app' {
    interface PageMeta {
        scrollSave?: boolean
    }
}

declare module '#auth-utils' {
}

export {}