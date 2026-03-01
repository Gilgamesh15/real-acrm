import * as schema from "db/schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import * as fs from "fs";
import * as path from "path";
import postgres from "postgres";

// ── Config ──────────────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const DATABASE_URL = process.env.DATABASE_URL!;
const UPLOAD_PRESET = "other-preset";
const IMAGE_MAP_PATH = path.resolve("image-map.json");
const DOWNLOAD_DIR = path.resolve("downloaded-images");

// ── Types ───────────────────────────────────────────────────────────────────
interface ImageMapEntry {
  id: string;
  "original-url": string;
  "new-url"?: string;
}

// ── DB setup ────────────────────────────────────────────────────────────────
function createDb() {
  const queryClient = postgres(DATABASE_URL);
  const db = drizzle({ client: queryClient, schema });
  return { db, queryClient };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function readImageMap(): ImageMapEntry[] {
  return JSON.parse(fs.readFileSync(IMAGE_MAP_PATH, "utf-8"));
}

function writeImageMap(entries: ImageMapEntry[]) {
  fs.writeFileSync(IMAGE_MAP_PATH, JSON.stringify(entries, null, 2));
}

function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (ext && [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg", ".bmp", ".tiff"].includes(ext)) {
      return ext;
    }
  } catch {
    // ignore
  }
  return ".jpg";
}

// ── Step 1: Export image URLs ───────────────────────────────────────────────
async function step1() {
  console.log("Step 1: Export image URLs to image-map.json");

  if (fs.existsSync(IMAGE_MAP_PATH)) {
    const content = fs.readFileSync(IMAGE_MAP_PATH, "utf-8").trim();
    if (content.length > 0) {
      console.log("ABORT: image-map.json already exists and is non-empty. Delete it manually to re-run step 1.");
      process.exit(1);
    }
  }

  const { db, queryClient } = createDb();

  try {
    const rows = await db.execute<{ id: string; url: string }>(
      sql`SELECT id, url FROM images`
    );

    const entries: ImageMapEntry[] = rows.map((row) => ({
      id: row.id,
      "original-url": row.url,
    }));

    writeImageMap(entries);
    console.log(`Exported ${entries.length} images to image-map.json`);
  } finally {
    await queryClient.end();
  }
}

// ── Step 2: Download + upload to Cloudinary ─────────────────────────────────
async function step2() {
  console.log("Step 2: Download images + upload to new Cloudinary");

  if (!fs.existsSync(IMAGE_MAP_PATH)) {
    console.log("ABORT: image-map.json does not exist. Run step 1 first.");
    process.exit(1);
  }

  if (!CLOUDINARY_CLOUD_NAME) {
    console.log("ABORT: CLOUDINARY_CLOUD_NAME env var is not set.");
    process.exit(1);
  }

  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  const entries = readImageMap();
  const total = entries.length;
  let uploadedCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (entry["new-url"]) {
      uploadedCount++;
      continue;
    }

    const ext = getExtensionFromUrl(entry["original-url"]);
    const localPath = path.join(DOWNLOAD_DIR, `${entry.id}${ext}`);

    // Download if not already on disk
    if (!fs.existsSync(localPath)) {
      console.log(`[${i + 1}/${total}] Downloading ${entry.id}...`);
      const response = await fetch(entry["original-url"]);
      if (!response.ok) {
        console.error(`FAIL: Download failed for ${entry.id} (${entry["original-url"]}): ${response.status} ${response.statusText}`);
        process.exit(1);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(localPath, buffer);
    }

    // Upload to Cloudinary
    console.log(`[${i + 1}/${total}] Uploading ${entry.id}...`);
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(localPath);
    const blob = new Blob([fileBuffer]);
    formData.append("file", blob, `${entry.id}${ext}`);
    formData.append("upload_preset", UPLOAD_PRESET);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(`FAIL: Upload failed for ${entry.id}: ${uploadResponse.status} ${errorText}`);
      process.exit(1);
    }

    const result = await uploadResponse.json();
    entry["new-url"] = result.secure_url;
    uploadedCount++;

    // Persist after each upload for resumability
    writeImageMap(entries);
    console.log(`[${i + 1}/${total}] Uploaded image ${entry.id}`);
  }

  console.log(`Done. ${uploadedCount}/${total} images uploaded.`);
}

// ── Step 3: Update images table URLs ────────────────────────────────────────
async function step3() {
  console.log("Step 3: Update images table URLs");

  if (!fs.existsSync(IMAGE_MAP_PATH)) {
    console.log("ABORT: image-map.json does not exist. Run step 1 first.");
    process.exit(1);
  }

  const entries = readImageMap();

  const incomplete = entries.filter((e) => !e["new-url"]);
  if (incomplete.length > 0) {
    console.log(`ABORT: ${incomplete.length} entries are missing new-url. Run step 2 to completion first.`);
    process.exit(1);
  }

  const { db, queryClient } = createDb();

  try {
    // Backup
    const allImages = await db.execute<{ id: string; url: string }>(
      sql`SELECT id, url FROM images`
    );
    const backupPath = path.resolve(`backup-images-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(allImages, null, 2));
    console.log(`Backup written to ${backupPath} (${allImages.length} rows)`);

    // Update in a single transaction
    let updated = 0;
    let skipped = 0;

    await db.transaction(async (tx) => {
      for (const entry of entries) {
        const result = await tx.execute(
          sql`UPDATE images SET url = ${entry["new-url"]!} WHERE id = ${entry.id}::uuid AND url = ${entry["original-url"]}`
        );
        if (result.length > 0 || (result as unknown as { count: number }).count > 0) {
          updated++;
        } else {
          skipped++;
        }
      }
    });

    console.log(`Updated: ${updated}, Skipped (already updated or changed): ${skipped}`);

    // Verify
    const originalUrls = entries.map((e) => e["original-url"]);
    let remaining = 0;
    for (const url of originalUrls) {
      const check = await db.execute<{ count: string }>(
        sql`SELECT COUNT(*) as count FROM images WHERE url = ${url}`
      );
      remaining += parseInt(check[0].count, 10);
    }

    if (remaining === 0) {
      console.log("Verification passed: no images have original URLs anymore.");
    } else {
      console.warn(`WARNING: ${remaining} images still have original URLs.`);
    }
  } finally {
    await queryClient.end();
  }
}

// ── Step 4: Replace URLs in products.description ────────────────────────────
async function step4() {
  console.log("Step 4: Replace image URLs in products.description rich text");

  if (!fs.existsSync(IMAGE_MAP_PATH)) {
    console.log("ABORT: image-map.json does not exist. Run step 1 first.");
    process.exit(1);
  }

  const entries = readImageMap();

  const incomplete = entries.filter((e) => !e["new-url"]);
  if (incomplete.length > 0) {
    console.log(`ABORT: ${incomplete.length} entries are missing new-url. Run step 2 to completion first.`);
    process.exit(1);
  }

  const { db, queryClient } = createDb();

  try {
    // Backup
    const allProducts = await db.execute<{ id: string; description: unknown }>(
      sql`SELECT id, description FROM products WHERE description IS NOT NULL`
    );
    const backupPath = path.resolve(`backup-products-descriptions-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(allProducts, null, 2));
    console.log(`Backup written to ${backupPath} (${allProducts.length} rows)`);

    // Build nested replace() chain
    let replaceChain = sql`description::text`;
    for (const entry of entries) {
      replaceChain = sql`replace(${replaceChain}, ${entry["original-url"]}, ${entry["new-url"]!})`;
    }

    // Build WHERE clause: OR of LIKE conditions
    const likeConditions = entries.map(
      (entry) => sql`description::text LIKE ${"%" + entry["original-url"] + "%"}`
    );
    let whereClause = likeConditions[0];
    for (let i = 1; i < likeConditions.length; i++) {
      whereClause = sql`${whereClause} OR ${likeConditions[i]}`;
    }

    const result = await db.execute(
      sql`UPDATE products SET description = (${replaceChain})::jsonb WHERE ${whereClause}`
    );

    const updatedCount = (result as unknown as { count: number }).count ?? result.length;
    console.log(`Updated ${updatedCount} product rows`);

    // Verify: check if any original URLs remain
    let warnings = 0;
    for (const entry of entries) {
      const check = await db.execute<{ count: string }>(
        sql`SELECT COUNT(*) as count FROM products WHERE description::text LIKE ${"%" + entry["original-url"] + "%"}`
      );
      const count = parseInt(check[0].count, 10);
      if (count > 0) {
        console.warn(`WARNING: ${count} products still contain URL: ${entry["original-url"]}`);
        warnings++;
      }
    }

    if (warnings === 0) {
      console.log("Verification passed: no original URLs found in products.description.");
    }
  } finally {
    await queryClient.end();
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
const step = process.argv[2];

switch (step) {
  case "1":
    step1().catch((err) => { console.error(err); process.exit(1); });
    break;
  case "2":
    step2().catch((err) => { console.error(err); process.exit(1); });
    break;
  case "3":
    step3().catch((err) => { console.error(err); process.exit(1); });
    break;
  case "4":
    step4().catch((err) => { console.error(err); process.exit(1); });
    break;
  default:
    console.log("Usage: tsx exec.ts <step>");
    console.log("Steps: 1 (export), 2 (download+upload), 3 (update images table), 4 (update product descriptions)");
    process.exit(1);
}
