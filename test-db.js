import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url?.trim() || !authToken?.trim()) {
  throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running test-db.js.');
}

const client = createClient({
  url,
  authToken,
});

async function testConnection() {
  try {
    const result = await client.execute("SELECT 1");
    console.log("Connection successful!", result);
  } catch (e) {
    console.error("Connection failed:", e);
  }
}

testConnection();
