/**
 * Serves the web page.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index.html")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("Apps Script + Vite Starter");
}

/**
 * Example: Get user list from a spreadsheet or database
 */
function getUserList() {
  // In real implementation, this would fetch from a spreadsheet
  return [
    { id: 1, name: "John Doe", email: "john@company.com" },
    { id: 2, name: "Jane Smith", email: "jane@company.com" },
    { id: 3, name: "Mike Johnson", email: "mike@company.com" },
  ];
}

/**
 * Example: Get spreadsheet data
 */
function getSpreadsheetData() {
  // In real implementation, this would use SpreadsheetApp
  return [
    ["Product", "Price", "Stock"],
    ["Widget A", "$10.99", "50"],
    ["Widget B", "$15.99", "25"],
    ["Widget C", "$8.99", "100"],
  ];
}

/**
 * Example: Save data to a spreadsheet
 */
function saveData(data) {
  // In real implementation, this would save to SpreadsheetApp
  console.log("Saving data:", data);

  return {
    success: true,
    message: "Data saved to spreadsheet",
    timestamp: new Date().toISOString(),
    rowsAffected: 1,
  };
}

/**
 * Example: Get application settings
 */
function getSettings() {
  // In real implementation, this might use PropertiesService
  return {
    theme: "light",
    language: "en",
    notifications: true,
    version: "1.0.0",
  };
}
