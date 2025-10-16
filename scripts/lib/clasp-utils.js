import { execSync } from "child_process";

/**
 * Utility functions for managing Google Apps Script deployments
 */

/**
 * Executes a shell command and returns the output
 * @param {string} command - The command to execute
 * @param {object} options - Execution options
 * @returns {string} Command output
 */
export function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: "utf8", ...options });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

/**
 * Fetches all deployments from Apps Script
 * @returns {Array} List of deployments
 */
export function getDeployments() {
  try {
    const output = exec("clasp list-deployments --json");
    return JSON.parse(output);
  } catch (error) {
    console.error("❌ Failed to fetch deployments:", error.message);
    process.exit(1);
  }
}

/**
 * Finds the @HEAD deployment
 * @param {Array} deployments - List of deployments
 * @returns {object|null} @HEAD deployment or null
 */
export function findHeadDeployment(deployments) {
  return (
    deployments?.find(
      (d) =>
        !d.deploymentConfig?.versionNumber ||
        d.deploymentConfig.versionNumber === "HEAD"
    ) || null
  );
}

/**
 * Finds the first versioned (non-@HEAD) deployment
 * @param {Array} deployments - List of deployments
 * @returns {object|null} Versioned deployment or null
 */
export function findVersionedDeployment(deployments) {
  return (
    deployments?.find(
      (d) =>
        d.deploymentConfig?.versionNumber &&
        d.deploymentConfig.versionNumber !== "HEAD"
    ) || null
  );
}

/**
 * Opens a web app deployment in the browser
 * @param {string} deploymentId - The deployment ID to open
 */
export function openWebApp(deploymentId) {
  try {
    exec(`clasp open-web-app ${deploymentId}`, { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Failed to open web app:", error.message);
    process.exit(1);
  }
}

/**
 * Creates a new versioned deployment
 */
export function createDeployment() {
  try {
    console.log("🆕 Creating new versioned deployment...");
    console.log(
      "ℹ️  Note: @HEAD deployment is updated automatically by `clasp push`"
    );
    exec("clasp create-deployment", { stdio: "inherit" });
    console.log("✅ New versioned deployment created successfully");
  } catch (error) {
    console.error("❌ Deployment creation failed:", error.message);
    process.exit(1);
  }
}

/**
 * Updates an existing deployment
 * @param {string} deploymentId - The deployment ID to update
 */
export function updateDeployment(deploymentId) {
  try {
    exec(`clasp update-deployment ${deploymentId}`, { stdio: "inherit" });
    console.log("✅ Deployment updated successfully");
  } catch (error) {
    console.error("❌ Deployment update failed:", error.message);
    process.exit(1);
  }
}

/**
 * Deletes a deployment
 * @param {string} deploymentId - The deployment ID to delete
 */
export function deleteDeployment(deploymentId) {
  try {
    exec(`clasp delete-deployment ${deploymentId}`, { stdio: "inherit" });
    console.log("✅ Deployment deleted successfully");
  } catch (error) {
    console.error("❌ Deployment deletion failed:", error.message);
    process.exit(1);
  }
}

/**
 * Recreates the production deployment (deletes all versioned deployments and creates a new one)
 */
export function recreateProductionDeployment() {
  const deployments = getDeployments();
  const versionedDeployments = deployments.filter(
    (d) =>
      d.deploymentConfig?.versionNumber &&
      d.deploymentConfig.versionNumber !== "HEAD"
  );

  if (versionedDeployments.length > 0) {
    console.log(
      `🗑️  Deleting ${versionedDeployments.length} existing versioned deployment(s)...`
    );
    for (const deployment of versionedDeployments) {
      console.log(`   Deleting ${deployment.deploymentId}...`);
      deleteDeployment(deployment.deploymentId);
    }
  }

  console.log("🆕 Creating new production deployment...");
  createDeployment();
}
