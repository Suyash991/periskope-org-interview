import { pool } from "./postgres";

// Backward-compatible export while moving to PostgreSQL-first setup.
export const supabase = pool;
