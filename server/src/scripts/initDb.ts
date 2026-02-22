import fs from "fs";
import path from "path";
import { pool } from "../db/postgres";

async function main(): Promise<void> {
  const migrationPath = path.resolve(__dirname, "../db/migrations/001_init.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");

  await pool.query(sql);
  console.log("Database initialized: 001_init.sql applied.");
}

main()
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
