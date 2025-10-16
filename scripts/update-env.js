import { updateDeploymentIds } from "./lib/clasp-utils.js";

/**
 * Updates .env file with current deployment IDs
 * This runs automatically after every build
 */

try {
  updateDeploymentIds();
} catch (error) {
  // Silently fail if deployments don't exist yet
  // This is expected on first build before any deployments
}
