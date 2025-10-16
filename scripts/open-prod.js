import {
  getDeployments,
  findVersionedDeployment,
  openWebApp,
} from "./lib/clasp-utils.js";

/**
 * Opens the versioned (production) deployment web app in browser
 * Uses the same deployment that would be updated by the deploy script
 */

const deployments = getDeployments();
const versionedDeployment = findVersionedDeployment(deployments);

if (versionedDeployment) {
  const deploymentId = versionedDeployment.deploymentId;
  const version = versionedDeployment.deploymentConfig.versionNumber;
  console.log(`🌐 Opening versioned deployment: ${deploymentId} (@${version})`);
  openWebApp(deploymentId);
} else {
  console.error("❌ No versioned deployment found");
  console.log('💡 Run "npm run prod" first to create a versioned deployment');
  process.exit(1);
}
