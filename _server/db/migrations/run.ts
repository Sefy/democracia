import { readFileSync } from 'fs';
import { join } from 'path';
import { Container } from "../../services/container";

async function runMigrations() {
  const container = new Container();

  try {
    const sql = readFileSync(join(__dirname, '001_initial_schema.sql'), 'utf8');
    await container.em.query(sql);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
