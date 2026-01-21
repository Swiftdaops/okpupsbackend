import { seedCats } from './seedCats.js';
import { seedLivestocks } from './seedLivestocks.js';

// Runs both seeders. Each seeder already connects to DB.
// Keep this script simple: run sequentially for predictable output.
await seedCats();
await seedLivestocks();

process.exit(0);
