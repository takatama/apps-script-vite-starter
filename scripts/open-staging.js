import { execSync } from "child_process";

/**
 * Opens the @HEAD deployment web app in browser
 */

try {
  // Get list of deployments
  const output = execSync("clasp list-deployments --json", {
    encoding: "utf8",
  });
  const deployments = JSON.parse(output);

  // Find @HEAD deployment
  const headDeployment = deployments?.find(
    (d) =>
      !d.deploymentConfig?.versionNumber ||
      d.deploymentConfig.versionNumber === "HEAD"
  );

  if (headDeployment) {
    const deploymentId = headDeployment.deploymentId;
    console.log(`🌐 Opening @HEAD deployment: ${deploymentId}`);
    execSync(`clasp open-web-app ${deploymentId}`, { stdio: "inherit" });
  } else {
    console.error("❌ @HEAD deployment not found");
    console.log('💡 Run "npm run staging" first to create @HEAD deployment');
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Failed to open web app:", error.message);
  process.exit(1);
}
