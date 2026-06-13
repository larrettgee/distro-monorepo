/**
 * Central configuration. All env vars are parsed here exactly once with
 * documented defaults. No raw `process.env` access is allowed elsewhere.
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  swagger: {
    enabled: boolean;
    path: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  swagger: {
    enabled: (process.env.SWAGGER_ENABLED ?? 'true') === 'true',
    path: process.env.SWAGGER_PATH ?? 'docs',
  },
});
