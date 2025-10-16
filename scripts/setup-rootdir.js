import { existsSync, readFileSync, writeFileSync } from "fs";

/**
 * Ensures .clasp.json has rootDir set to "dist"
 * This runs automatically before builds to configure clasp correctly
 */

if (existsSync(".clasp.json")) {
  try {
    const config = JSON.parse(readFileSync(".clasp.json", "utf8"));

    if (!config.rootDir || config.rootDir !== "dist") {
      config.rootDir = "dist";
      writeFileSync(".clasp.json", JSON.stringify(config, null, 2) + "\n");
      console.log('✅ Updated .clasp.json: rootDir set to "dist"');
    }
  } catch (error) {
    console.error("❌ Error updating .clasp.json:", error.message);
    process.exit(1);
  }
} else {
  console.log(
    'ℹ️  .clasp.json not found. Run "clasp create-script" or "clasp clone-script" first.'
  );
  console.log('   Then run "npm run build" to deploy your app.');
}
