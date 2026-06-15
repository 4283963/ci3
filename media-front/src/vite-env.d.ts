/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_AUTH_BASE: string
  readonly VITE_API_DIST_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
