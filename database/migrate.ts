import {Pool} from 'pg';
import {readFile} from 'node:fs/promises';
const pool=new Pool({connectionString:process.env.DATABASE_URL});
await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));await pool.end();console.log('Database migration complete.');
