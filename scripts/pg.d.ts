/**
 * Type declaration for pg module (used by reload-schema-direct.ts)
 */
declare module 'pg' {
  interface ClientConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    ssl?: { rejectUnauthorized?: boolean } | boolean;
  }

  interface QueryResult<T = Record<string, unknown>> {
    rows: T[];
    rowCount: number;
  }

  class Client {
    constructor(config?: ClientConfig);
    connect(): Promise<void>;
    query<T = Record<string, unknown>>(text: string): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
