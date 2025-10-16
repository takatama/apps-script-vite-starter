import { googleScriptRun } from "../lib/googleScriptRun.js";

/**
 * Main application logic
 */
class App {
  constructor() {
    this.init();
  }

  async init() {
    console.log("🚀 Apps Script + Vite Starter initialized");

    // Example usage of google.script.run API
    this.setupExamples();
  }

  async setupExamples() {
    // Example 1: Get user list (async/await style)
    const userListBtn = document.getElementById("get-users");
    if (userListBtn) {
      userListBtn.addEventListener("click", async () => {
        try {
          const users = await googleScriptRun.getUserList();
          console.log("Users:", users);
          this.displayUsers(users);
        } catch (error) {
          console.error("Error getting users:", error);
        }
      });
    }

    // Example 2: Get spreadsheet data (callback style - traditional google.script.run way)
    const dataBtn = document.getElementById("get-data");
    if (dataBtn) {
      dataBtn.addEventListener("click", () => {
        googleScriptRun
          .withSuccessHandler((data) => {
            console.log("Spreadsheet data:", data);
            this.displayData(data);
          })
          .withFailureHandler((error) => {
            console.error("Error getting data:", error);
          })
          .getSpreadsheetData();
      });
    }

    // Example 3: Save data (async/await style)
    const saveBtn = document.getElementById("save-data");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        try {
          const result = await googleScriptRun.saveData({
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
