import { prisma } from '../lib/db';
import { migrateAadhaarRecords } from '../lib/aadhaar';

async function main() {
  console.log('[MIGRATE-AADHAAR] Starting Aadhaar record migration...');
  const result = await migrateAadhaarRecords(prisma);
  console.log(
    `[MIGRATE-AADHAAR] Completed: ${result.totalChecked} records checked, ${result.migrated} migrated to secure format.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('[MIGRATE-AADHAAR] Error migrating Aadhaar records:', err);
  process.exit(1);
});
