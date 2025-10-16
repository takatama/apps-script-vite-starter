import {
  getDeployments,
  findVersionedDeployment,
  createDeployment,
  updateDeployment,
} from "./lib/clasp-utils.js";

/**
 * Deploys to Apps Script (versioned deployment):
 * - Finds the first non-@HEAD deployment and updates it
 * - If only @HEAD exists or no deployments exist, creates a new versioned deployment
 *
 * Note: @HEAD is automatically updated by `clasp push`, so we skip it here.
 */

const deployments = getDeployments();
const versionedDeployment = findVersionedDeployment(deployments);

if (versionedDeployment) {
  // Update existing versioned deployment
  const deploymentId = versionedDeployment.deploymentId;
  const version = versionedDeployment.deploymentConfig.versionNumber;
  console.log(
    `🔄 Updating versioned deployment: ${deploymentId} (@${version})`
  );
  updateDeployment(deploymentId);
} else {
  // No versioned deployment exists, create a new one
  createDeployment();
}
