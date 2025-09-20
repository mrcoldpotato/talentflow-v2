/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string
  readonly VITE_API_URL?: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  // add any other env variables you use, prefix with VITE_
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
