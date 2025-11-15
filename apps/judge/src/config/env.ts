interface EnvConfig {
  openai: {
    apiKey: string;
    baseUrl?: string;
  };
  langfuse: {
    publicKey: string;
    secretKey: string;
    host: string;
  };
}

function getEnvVar(name: string, required = true): string {
  const value = process.env[name]
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value || ""
}

export function loadConfig(): EnvConfig {
  return {
    openai: {
      apiKey: getEnvVar("OPENAI_API_KEY"),
      baseUrl: getEnvVar("OPENAI_BASE_URL", false) || undefined,
    },
    langfuse: {
      publicKey: getEnvVar("LANGFUSE_PUBLIC_KEY"),
      secretKey: getEnvVar("LANGFUSE_SECRET_KEY"),
      host: getEnvVar("LANGFUSE_HOST", false) || "https://cloud.langfuse.com",
    },
  }
}

let cachedConfig: EnvConfig | null = null

export function getConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfig()
  }
  return cachedConfig
}

