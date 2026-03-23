import { getDeploymentId, findVersionedDeployment, openWebApp } from "./lib/clasp-utils.js";

/**
 * Opens the production deployment web app in browser
 */

async function main() {
  const deploymentId = getDeploymentId("PROD_DEPLOYMENT_ID", findVersionedDeployment);

  if (deploymentId) {
    console.log(`🌐 Opening production deployment: ${deploymentId}`);
    openWebApp(deploymentId);
  } else {
    console.error("❌ Production deployment not found");
    console.log('💡 Run "npm run prod" first to create production deployment');
    process.exit(1);
  }
}

main();
