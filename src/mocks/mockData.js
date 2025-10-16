/**
 * Mock data for Google Apps Script functions
 * Used during local development when google.script.run is not available
 */

export const mockData = {
  // Example: Mock data for a user list function
  getUserList: [
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@example.com" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
  ],

  // Example: Mock data for spreadsheet data
  getSpreadsheetData: [
    ["Name", "Age", "City"],
    ["Alice", "25", "Tokyo"],
    ["Bob", "30", "Osaka"],
    ["Charlie", "28", "Kyoto"],
  ],

  // Example: Mock response for saving data
  saveData: {
    success: true,
    message: "Data saved successfully",
    timestamp: new Date().toISOString(),
  },

  // Example: Mock settings data
  getSettings: {
    theme: "dark",
    language: "en",
    notifications: true,
  },
};
