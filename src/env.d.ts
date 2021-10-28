declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    PORT: string;
    LIREDDIT_SESSION_SECRET: string;
    LIREDDIT_CORS_ORIGIN: string;
  }
}
