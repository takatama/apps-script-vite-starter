/**
 * Serves the web page.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index.html")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("Apps Script + Vite Starter");
}

/**
 * Determines the current deployment environment based on the web app URL.
 *
 * Executions that have no web app URL (e.g., time-driven triggers) are
 * treated as production.
 *
 * @return {string} "staging" or "production"
 */
function getEnvironment_() {
  const url = ScriptApp.getService().getUrl();
  if (url && url.endsWith("/dev")) {
    return "staging";
  }
  return "production";
}

/**
 * Returns the Script Property key holding the spreadsheet ID for the
 * current environment.
 *
 * @return {string} "STG_SPREADSHEET_ID" or "PROD_SPREADSHEET_ID"
 */
function getSpreadsheetIdKey_() {
  return getEnvironment_() === "staging" ? "STG_SPREADSHEET_ID" : "PROD_SPREADSHEET_ID";
}

/**
 * Opens the environment-appropriate Spreadsheet using IDs stored in
 * Script Properties (STG_SPREADSHEET_ID / PROD_SPREADSHEET_ID).
 *
 * @return {Spreadsheet} The opened Spreadsheet for the current environment.
 */
function getSpreadsheet_() {
  const propertyKey = getSpreadsheetIdKey_();
  const id = PropertiesService.getScriptProperties().getProperty(propertyKey);

  if (!id) {
    throw new Error(
      `Missing Script Property "${propertyKey}". Set it in the Apps Script editor under Project Settings > Script Properties.`
    );
  }

  return SpreadsheetApp.openById(id);
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
 *
 * Falls back to hardcoded sample data if the environment's spreadsheet ID
 * property is not configured, so the starter works with zero configuration.
 */
function getSpreadsheetData() {
  const isConfigured = !!PropertiesService.getScriptProperties().getProperty(
    getSpreadsheetIdKey_()
  );

  if (!isConfigured) {
    // Sample data — replace once STG_SPREADSHEET_ID / PROD_SPREADSHEET_ID are set.
    return [
      ["Product", "Price", "Stock"],
      ["Widget A", "$10.99", "50"],
      ["Widget B", "$15.99", "25"],
      ["Widget C", "$8.99", "100"],
    ];
  }

  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheets()[0];
  return serializeSheetValues_(sheet.getDataRange().getValues());
}

/**
 * Converts sheet values into types supported by google.script.run.
 *
 * @param {Array<Array<*>>} values The values returned by Range.getValues().
 * @return {Array<Array<*>>} A copy with Date values converted to ISO strings.
 */
function serializeSheetValues_(values) {
  return values.map((row) =>
    row.map((value) => (value instanceof Date ? value.toISOString() : value))
  );
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
