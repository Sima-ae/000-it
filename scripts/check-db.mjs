#!/usr/bin/env node
import mysql from "mysql2/promise";

function config() {
  if (process.env.DATABASE_URL) {
    return { uri: process.env.DATABASE_URL };
  }
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "000it_app",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "000it_app",
  };
}

const cfg = config();
const conn =
  "uri" in cfg
    ? await mysql.createConnection(cfg.uri)
    : await mysql.createConnection(cfg);

try {
  await conn.query("SELECT 1");
  console.log("OK: MariaDB connection successful");
  process.exit(0);
} catch (err) {
  console.error("ERROR: MariaDB connection failed:", err.message);
  process.exit(1);
} finally {
  await conn.end();
}
