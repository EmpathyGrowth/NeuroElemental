/**
 * Reload PostgREST schema cache via direct PostgreSQL connection
 */

/// <reference path="./pg.d.ts" />
import { Client } from 'pg';

async function reloadSchema() {
  console.log('Connecting to PostgreSQL via Supavisor pooler...');

  // Use the Supavisor session pooler (port 5432) which has IPv4 support
  // Format: postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  if (!dbPassword) {
    console.error('Error: SUPABASE_DB_PASSWORD environment variable is not set');
    process.exit(1);
  }

  const client = new Client({
    host: process.env.SUPABASE_DB_HOST || 'aws-0-eu-central-1.pooler.supabase.com',
    port: parseInt(process.env.SUPABASE_DB_PORT || '5432', 10),
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    user: process.env.SUPABASE_DB_USER || 'postgres.ieqvhgqubvfruqfjggqf',
    password: dbPassword,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected successfully!\n');

    // Reload PostgREST schema cache
    console.log("Executing: NOTIFY pgrst, 'reload schema'");
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('Schema reload notification sent!\n');

    // Also try to reload config
    console.log("Executing: NOTIFY pgrst, 'reload config'");
    await client.query("NOTIFY pgrst, 'reload config'");
    console.log('Config reload notification sent!\n');

    // List all tables in public schema
    console.log('Listing all tables in public schema:');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`Found ${result.rows.length} tables:`);
    result.rows.forEach((row) => console.log(`  - ${(row as { table_name: string }).table_name}`));

    console.log('\n✅ Schema reload complete!');
    console.log('Note: It may take a few seconds for PostgREST to pick up the changes.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

reloadSchema();
