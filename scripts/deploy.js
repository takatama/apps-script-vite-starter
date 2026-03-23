import {
  getDeploymentId,
  findVersionedDeployment,
  createDeployment,
  updateDeployment,
  updateDeploymentIds,
} from "./lib/clasp-utils.js";

/**
 * Deploys to Apps Script (production deployment):
 * - Updates existing production deployment if it exists
 * - Creates new production deployment if it doesn't exist
 *
 * Note: @HEAD is automatically updated by `clasp push`, so we skip it here.
 */

async function main() {
  const deploymentId = getDeploymentId("PROD_DEPLOYMENT_ID", findVersionedDeployment);

  if (deploymentId) {
    // Update existing production deployment
    console.log(`🔄 Updating production deployment: ${deploymentId}`);
    updateDeployment(deploymentId);
  } else {
    // No production deployment exists, create a new one
    createDeployment();
    updateDeploymentIds();
  }
}

main();
