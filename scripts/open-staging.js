import {
  getDeployments,
  findHeadDeployment,
  openWebApp,
} from "./lib/clasp-utils.js";

/**
 * Opens the @HEAD deployment web app in browser
 */

const deployments = getDeployments();
const headDeployment = findHeadDeployment(deployments);

if (headDeployment) {
  const deploymentId = headDeployment.deploymentId;
  console.log(`🌐 Opening @HEAD deployment: ${deploymentId}`);
  openWebApp(deploymentId);
} else {
  console.error("❌ @HEAD deployment not found");
  console.log('💡 Run "npm run staging" first to create @HEAD deployment');
  process.exit(1);
}
