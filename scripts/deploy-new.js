import { recreateProductionDeployment } from "./lib/clasp-utils.js";

/**
 * Recreates the production deployment:
 * - Deletes all existing versioned deployments
 * - Creates a new versioned deployment
 * - Updates .env with new deployment IDs
 *
 * Use this when you want to start fresh with a new production deployment.
 */

console.log("⚠️  Recreating production deployment...");
recreateProductionDeployment();
