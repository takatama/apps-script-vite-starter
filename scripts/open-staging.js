import { getDeploymentId, findHeadDeployment, openWebApp } from "./lib/clasp-utils.js";

/**
 * Opens the @HEAD deployment web app in browser
 */

async function main() {
  const deploymentId = getDeploymentId("STAGING_DEPLOYMENT_ID", findHeadDeployment);

  if (deploymentId) {
    console.log(`🌐 Opening staging deployment: ${deploymentId}`);
    openWebApp(deploymentId);
  } else {
    console.error("❌ Staging deployment not found");
    console.log('💡 Run "npm run stg" first to create staging deployment');
    process.exit(1);
  }
}

main();
