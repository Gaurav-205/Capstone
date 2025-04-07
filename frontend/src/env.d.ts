/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}