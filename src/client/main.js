import { appsScriptApi } from "./appsScriptApi.js";

/**
 * Main application logic
 */
class App {
  constructor() {
    this.init();
  }

  async init() {
    console.log("🚀 Apps Script + Vite Starter initialized");

    // Example usage of GAS API
    this.setupExamples();
  }

  async setupExamples() {
    // Example 1: Get user list
    const userListBtn = document.getElementById("get-users");
    if (userListBtn) {
      userListBtn.addEventListener("click", async () => {
        try {
          const users = await appsScriptApi.getUserList();
          console.log("Users:", users);
          this.displayUsers(users);
        } catch (error) {
          console.error("Error getting users:", error);
        }
      });
    }

    // Example 2: Get spreadsheet data
    const dataBtn = document.getElementById("get-data");
    if (dataBtn) {
      dataBtn.addEventListener("click", async () => {
        try {
          const data = await appsScriptApi.getSpreadsheetData();
          console.log("Spreadsheet data:", data);
          this.displayData(data);
        } catch (error) {
          console.error("Error getting data:", error);
        }
      });
    }

    // Example 3: Save data
    const saveBtn = document.getElementById("save-data");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        try {
          const result = await appsScriptApi.saveData({
            test: "data",
            timestamp: new Date(),
          });
          console.log("Save result:", result);
          this.showMessage("Data saved successfully!");
        } catch (error) {
          console.error("Error saving data:", error);
        }
      });
    }
  }

  displayUsers(users) {
    const container = document.getElementById("users-container");
    if (container) {
      container.innerHTML = users
        .map(
          (user) =>
            `<div class="user-item">
          <strong>${user.name}</strong> - ${user.email}
        </div>`
        )
        .join("");
    }
  }

  displayData(data) {
    const container = document.getElementById("data-container");
    if (container) {
      const table = this.createTable(data);
      container.innerHTML = table;
    }
  }

  createTable(data) {
    if (!data || data.length === 0) return "<p>No data available</p>";

    const headers = data[0];
    const rows = data.slice(1);

    return `
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            ${headers
              .map(
                (h) =>
                  `<th style="border: 1px solid #ccc; padding: 8px;">${h}</th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr>
              ${row
                .map(
                  (cell) =>
                    `<td style="border: 1px solid #ccc; padding: 8px;">${cell}</td>`
                )
                .join("")}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  showMessage(message) {
    const container = document.getElementById("message-container");
    if (container) {
      container.innerHTML = `<div style="color: green; margin: 10px 0;">${message}</div>`;
      setTimeout(() => {
        container.innerHTML = "";
      }, 3000);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
