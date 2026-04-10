/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
