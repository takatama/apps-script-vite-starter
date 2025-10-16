import * as readline from "readline";
import {
  getDeployments,
  createDeployment,
  updateDeployment,
} from "./lib/clasp-utils.js";

/**
 * Interactive deployment:
 * Shows existing deployments and lets user choose to update or create new
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function deploy() {
  try {
    const deployments = getDeployments();

    if (deployments && deployments.length > 0) {
      console.log("\n📋 Existing deployments:");
      deployments.forEach((deployment, index) => {
        const desc =
          deployment.deploymentConfig?.description || "No description";
        const version = deployment.deploymentConfig?.versionNumber || "HEAD";
        console.log(
          `  ${index + 1}. ${deployment.deploymentId} @${version} - ${desc}`
        );
      });

      console.log("\n🤔 What would you like to do?");
      console.log("  1-" + deployments.length + ": Update existing deployment");
      console.log("  n: Create new deployment");
      console.log("  q: Cancel");

      const answer = await question("\nYour choice: ");

      if (answer.toLowerCase() === "q") {
        console.log("❌ Deployment cancelled");
        rl.close();
        process.exit(0);
      } else if (answer.toLowerCase() === "n") {
        rl.close();
        createDeployment();
      } else {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < deployments.length) {
          const deploymentId = deployments[index].deploymentId;
          console.log(`🔄 Updating deployment ${deploymentId}...`);
          rl.close();
          updateDeployment(deploymentId);
        } else {
          console.log("❌ Invalid choice");
          rl.close();
          process.exit(1);
        }
      }
    } else {
      console.log("🆕 No existing deployments. Creating new deployment...");
      rl.close();
      createDeployment();
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    rl.close();
    process.exit(1);
  }
}

deploy();
