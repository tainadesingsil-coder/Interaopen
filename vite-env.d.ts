interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_KEY?: string;
  readonly NEXT_PUBLIC_ANTHROPIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

