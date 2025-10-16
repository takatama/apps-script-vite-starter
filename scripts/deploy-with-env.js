import { readFileSync, existsSync } from "fs";
import {
  getDeployments,
  createDeployment,
  updateDeployment,
} from "./lib/clasp-utils.js";

/**
 * Smart deployment with .env support:
 * 1. If DEPLOYMENT_ID is set in .env, update that deployment
 * 2. Otherwise, auto-detect and update the first deployment
 * 3. If no deployments exist, create a new one
 */

// Read deployment ID from .env if it exists
let deploymentId = null;
if (existsSync(".env")) {
  const envContent = readFileSync(".env", "utf8");
  const match = envContent.match(/DEPLOYMENT_ID=(.+)/);
  if (match && match[1].trim()) {
    deploymentId = match[1].trim();
  }
}

if (deploymentId) {
  // Use deployment ID from .env
  console.log(`🔄 Updating deployment from .env: ${deploymentId}`);
  updateDeployment(deploymentId);
} else {
  // Auto-detect deployments
  const deployments = getDeployments();

  if (deployments && deployments.length > 0) {
    const firstDeploymentId = deployments[0].deploymentId;
    console.log(`🔄 Updating first deployment: ${firstDeploymentId}`);
    updateDeployment(firstDeploymentId);
    console.log(
      "💡 Tip: Set DEPLOYMENT_ID in .env to always update a specific deployment"
    );
  } else {
    createDeployment();
  }
}
