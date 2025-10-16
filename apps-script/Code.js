/**
 * Serves the web page.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile("src/index.html")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("Apps Script + Vite Starter");
}
