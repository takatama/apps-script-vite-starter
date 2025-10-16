import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";

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

try {
  if (deploymentId) {
    // Use deployment ID from .env
    console.log(`🔄 Updating deployment from .env: ${deploymentId}`);
    execSync(`clasp update-deployment ${deploymentId}`, { stdio: "inherit" });
    console.log("✅ Deployment updated successfully");
  } else {
    // Auto-detect deployments
    const output = execSync("clasp list-deployments --json", {
      encoding: "utf8",
    });
    const deployments = JSON.parse(output);

    if (deployments && deployments.length > 0) {
      const firstDeploymentId = deployments[0].deploymentId;
      console.log(`🔄 Updating first deployment: ${firstDeploymentId}`);
      execSync(`clasp update-deployment ${firstDeploymentId}`, {
        stdio: "inherit",
      });
      console.log("✅ Deployment updated successfully");
      console.log(
        "💡 Tip: Set DEPLOYMENT_ID in .env to always update a specific deployment"
      );
    } else {
      console.log("🆕 No existing deployments. Creating new deployment...");
      execSync("clasp create-deployment", { stdio: "inherit" });
      console.log("✅ New deployment created successfully");
    }
  }
} catch (error) {
  console.error("❌ Deployment failed:", error.message);
  process.exit(1);
}
