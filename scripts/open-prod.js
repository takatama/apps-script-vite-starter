import { execSync } from "child_process";

/**
 * Opens the versioned (production) deployment web app in browser
 * Uses the same deployment that would be updated by the deploy script
 */

try {
  // Get list of deployments
  const output = execSync("clasp list-deployments --json", {
    encoding: "utf8",
  });
  const deployments = JSON.parse(output);

  // Find first non-@HEAD deployment (same logic as deploy.js)
  const versionedDeployment = deployments?.find(
    (d) =>
      d.deploymentConfig?.versionNumber &&
      d.deploymentConfig.versionNumber !== "HEAD"
  );

  if (versionedDeployment) {
    const deploymentId = versionedDeployment.deploymentId;
    const version = versionedDeployment.deploymentConfig.versionNumber;
    console.log(
      `🌐 Opening versioned deployment: ${deploymentId} (@${version})`
    );
    execSync(`clasp open-web-app ${deploymentId}`, { stdio: "inherit" });
  } else {
    console.error("❌ No versioned deployment found");
    console.log('💡 Run "npm run prod" first to create a versioned deployment');
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Failed to open web app:", error.message);
  process.exit(1);
}
