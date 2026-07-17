import { NextResponse } from 'next/server';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const connectionString = "postgresql://postgres:BernavFood2026_Secure!@db.lxqbpdbivhmdztoivclw.supabase.co:5432/postgres";
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Read the schema.sql file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(sql);
    await client.end();
    
    return NextResponse.json({ success: true, message: "Schema applied successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
