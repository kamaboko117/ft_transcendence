/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_APP_ID?: string;
    VITE_APP_URI?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}