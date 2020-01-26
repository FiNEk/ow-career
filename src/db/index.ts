import { Pool, QueryResult, PoolClient } from "pg";
import config from "config";
// import winston from "winston";

export const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "wnm_owfavorites",
  password: config.get("keys.postgres")
});

export default {
  query: async (text: string, params: string[]): Promise<QueryResult> => {
    const result = await pool.query(text, params);
    return result;
  },
  getClient: async (): Promise<PoolClient> => {
    const client = await pool.connect();
    return client;
  }
};
