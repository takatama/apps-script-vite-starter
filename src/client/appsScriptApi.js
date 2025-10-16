import { googleScriptMock } from "../mocks/googleScript.js";

/**
 * Google Apps Script API wrapper
 * Automatically uses mock when google.script.run is not available (development)
 */
class AppsScriptApi {
  constructor() {
    // Use real google.script.run if available, otherwise use mock
    this.script =
      typeof google !== "undefined" && google.script
        ? google.script.run
        : googleScriptMock;

    this.isDevelopment = !window.google?.script;

    if (this.isDevelopment) {
      console.log("[Apps Script API] Running in development mode with mocks");
    }
  }

  /**
   * Example: Get user list from spreadsheet
   */
  getUserList() {
    return new Promise((resolve, reject) => {
      this.script
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getUserList();
    });
  }

  /**
   * Example: Get spreadsheet data
   */
  getSpreadsheetData() {
    return new Promise((resolve, reject) => {
      this.script
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getSpreadsheetData();
    });
  }

  /**
   * Example: Save data to spreadsheet
   */
  saveData(data) {
    return new Promise((resolve, reject) => {
      this.script
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .saveData(data);
    });
  }

  /**
   * Example: Get app settings
   */
  getSettings() {
    return new Promise((resolve, reject) => {
      this.script
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getSettings();
    });
  }

  /**
   * Generic method to call any Apps Script function
   * @param {string} functionName - Name of the server-side function
   * @param {...any} args - Arguments to pass to the function
   */
  call(functionName, ...args) {
    return new Promise((resolve, reject) => {
      this.script
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName](...args);
    });
  }
}

// Export singleton instance
export const appsScriptApi = new AppsScriptApi();
