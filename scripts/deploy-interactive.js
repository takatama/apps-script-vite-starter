import { execSync } from "child_process";
import * as readline from "readline";

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
    // Get list of deployments
    const output = execSync("clasp list-deployments --json", {
      encoding: "utf8",
    });
    const deployments = JSON.parse(output);

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
        console.log("🆕 Creating new deployment...");
        execSync("clasp create-deployment", { stdio: "inherit" });
        console.log("✅ New deployment created");
      } else {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < deployments.length) {
          const deploymentId = deployments[index].deploymentId;
          console.log(`🔄 Updating deployment ${deploymentId}...`);
          execSync(`clasp update-deployment ${deploymentId}`, {
            stdio: "inherit",
          });
          console.log("✅ Deployment updated");
        } else {
          console.log("❌ Invalid choice");
          rl.close();
          process.exit(1);
        }
      }
    } else {
      console.log("🆕 No existing deployments. Creating new deployment...");
      execSync("clasp create-deployment", { stdio: "inherit" });
      console.log("✅ New deployment created");
    }

    rl.close();
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    rl.close();
    process.exit(1);
  }
}

deploy();
