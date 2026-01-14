import dotenv from 'dotenv';
dotenv.config();

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`;

async function testQuery(sql) {
    const response = await fetch(`${baseUrl}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    return data;
}

// Testa criar tabela vendors
console.log('Testing CREATE TABLE vendors...\n');

const createVendors = `CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  whatsapp_number TEXT UNIQUE,
  status TEXT DEFAULT 'offline',
  is_active INTEGER DEFAULT 1,
  session_data TEXT,
  qr_code TEXT,
  total_messages INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  performance_score REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_seen TEXT DEFAULT CURRENT_TIMESTAMP
)`;

await testQuery(createVendors);

console.log('\n\nTesting SELECT from vendors...\n');
await testQuery('SELECT * FROM vendors');
