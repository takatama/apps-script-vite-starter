import { execSync } from "child_process";

/**
 * Deploys to Apps Script (versioned deployment):
 * - Finds the first non-@HEAD deployment and updates it
 * - If only @HEAD exists or no deployments exist, creates a new versioned deployment
 *
 * Note: @HEAD is automatically updated by `clasp push`, so we skip it here.
 */

try {
  // Get list of deployments
  const output = execSync("clasp list-deployments --json", {
    encoding: "utf8",
  });
  const deployments = JSON.parse(output);

  // Find first non-@HEAD deployment
  const versionedDeployment = deployments?.find(
    (d) =>
      d.deploymentConfig?.versionNumber &&
      d.deploymentConfig.versionNumber !== "HEAD"
  );

  if (versionedDeployment) {
    // Update existing versioned deployment
    const deploymentId = versionedDeployment.deploymentId;
    const version = versionedDeployment.deploymentConfig.versionNumber;
    console.log(
      `🔄 Updating versioned deployment: ${deploymentId} (@${version})`
    );
    execSync(`clasp update-deployment ${deploymentId}`, { stdio: "inherit" });
    console.log("✅ Versioned deployment updated successfully");
  } else {
    // No versioned deployment exists, create a new one
    console.log("🆕 Creating new versioned deployment...");
    console.log(
      "ℹ️  Note: @HEAD deployment is updated automatically by `clasp push`"
    );
    execSync("clasp create-deployment", { stdio: "inherit" });
    console.log("✅ New versioned deployment created successfully");
  }
} catch (error) {
  console.error("❌ Deployment failed:", error.message);
  process.exit(1);
}
