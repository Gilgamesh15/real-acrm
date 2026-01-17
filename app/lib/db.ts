import * as schema from "db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(process.env.DATABASE_URL!);
const db = drizzle({ client: queryClient, schema });

type DbClient = typeof db;

type DbTransactionClient = Parameters<
  Parameters<DbClient["transaction"]>[0]
>[0];

export { db, type DbClient, type DbTransactionClient };
