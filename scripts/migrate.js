const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./load-env');

loadEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in environment or .env.local');
  process.exit(1);
}

async function runMigrations() {
  console.log('Connecting to Supabase PostgreSQL...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected successfully to Supabase DB!');

    const migrationFiles = [
      'database/migrations/001_initial_schema.sql',
      'database/migrations/002_functions_and_triggers.sql',
      'database/migrations/003_rls_policies.sql',
      'database/seed.sql',
    ];

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}...`);
      const sql = fs.readFileSync(path.resolve(file), 'utf-8');
      await client.query(sql);
      console.log(`✓ Applied ${file}`);
    }

    // Verify tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nVerified public tables in Supabase:');
    res.rows.forEach((r) => console.log(` - ${r.table_name}`));

    console.log('\nAll Supabase database migrations applied successfully!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
