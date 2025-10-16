import { recreateProductionDeployment } from "./lib/clasp-utils.js";

/**
 * Recreates the production deployment:
 * - Deletes all existing versioned deployments
 * - Creates a new versioned deployment
 *
 * Use this when you want to start fresh with a new production deployment.
 */

console.log(
  "⚠️  This will delete all existing production deployments and create a new one."
);
recreateProductionDeployment();
