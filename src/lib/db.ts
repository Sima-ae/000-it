import mysql from "mysql2/promise";

export async function pingDatabase(): Promise<boolean> {
  const url = process.env.DATABASE_URL?.trim();
  const conn = url
    ? await mysql.createConnection(url)
    : await mysql.createConnection({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || "3306"),
        user: process.env.DB_USER || "000it_app",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "000it_app",
      });
  try {
    await conn.query("SELECT 1");
    return true;
  } finally {
    await conn.end();
  }
}
