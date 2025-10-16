# Google Script Run API Usage

This template provides a `googleScriptRun` wrapper that works exactly like `google.script.run` but automatically uses mock data during local development.

## 🎯 Basic Usage

The API is identical to the official `google.script.run`, so if you already know how to use Apps Script, you can use this immediately!

### Method 1: Callback Style (Traditional google.script.run way)

```javascript
import { googleScriptRun } from "./lib/googleScriptRun.js";

// Get data with success/failure handlers
googleScriptRun
  .withSuccessHandler((result) => {
    console.log("Success:", result);
  })
  .withFailureHandler((error) => {
    console.error("Error:", error);
  })
  .yourServerFunction(arg1, arg2);

// With user object
googleScriptRun
  .withSuccessHandler(handleSuccess)
  .withFailureHandler(handleError)
  .withUserObject({ userId: 123 })
  .getUserData();
```

### Method 2: Async/Await Style (Modern approach)

```javascript
import { googleScriptRun } from "./lib/googleScriptRun.js";

async function loadData() {
  try {
    // Simply await the function call
    const users = await googleScriptRun.getUserList();
    console.log("Users:", users);

    const data = await googleScriptRun.getSpreadsheetData();
    console.log("Data:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

## 📝 Examples

### Example 1: Get User List

```javascript
// Async/await
const users = await googleScriptRun.getUserList();

// Callback
googleScriptRun.withSuccessHandler((users) => console.log(users)).getUserList();
```

### Example 2: Save Data

```javascript
// Async/await
const result = await googleScriptRun.saveData({
  name: "John",
  email: "john@example.com",
});

// Callback
googleScriptRun
  .withSuccessHandler((result) => console.log("Saved!", result))
  .withFailureHandler((error) => console.error("Failed:", error))
  .saveData({ name: "John", email: "john@example.com" });
```

### Example 3: Pass Multiple Arguments

```javascript
// Async/await
const result = await googleScriptRun.updateUser(userId, name, email);

// Callback
googleScriptRun
  .withSuccessHandler((result) => console.log(result))
  .updateUser(userId, name, email);
```

## 🔧 Development Mode

During local development (when `google.script.run` is not available), the wrapper automatically uses mock data from `src/mocks/mockData.js`.

### Adding Mock Data

Edit `src/mocks/mockData.js`:

```javascript
export const mockData = {
  // Function name matches your Apps Script function
  getUserList: [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ],

  // For functions with arguments, use a function
  updateUser: (userId, name, email) => {
    return {
      success: true,
      message: `Updated user ${userId}`,
      data: { userId, name, email },
    };
  },
};
```

## 🚀 Production Mode

In production (deployed as Apps Script web app), the wrapper automatically uses the real `google.script.run` with no code changes needed!

## ✅ Key Features

- **Identical API**: Works exactly like `google.script.run`
- **Auto-detection**: Automatically switches between mock and production
- **Dual Style**: Supports both callback and async/await styles
- **Type Safety**: Full TypeScript support (if using TypeScript)
- **Easy Testing**: Mock data is file-based and easy to manage
