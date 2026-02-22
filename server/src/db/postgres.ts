import { Pool } from "pg";

export const pool = new Pool({
  user: "suyashparashar",
  host: "localhost",
  database: "whatsappGroup",
  password: "password",
  port: 5432,
});
