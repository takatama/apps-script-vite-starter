import { mockData } from "./mockData.js";

/**
 * Mock implementation of google.script.run
 * Provides realistic delays and success/failure handlers
 */
class GoogleScriptMock {
  constructor(proxy = null) {
    this._proxy = proxy;
    this._successHandler = null;
    this._failureHandler = null;
    this._userObject = null;
    this._delay = 500; // Default delay in milliseconds
  }

  /**
   * Sets the proxy reference for chaining
   */
  setProxy(proxy) {
    this._proxy = proxy;
  }

  /**
   * Sets success handler (chainable)
   */
  withSuccessHandler(handler) {
    this._successHandler = handler;
    return this._proxy || this;
  }

  /**
   * Sets failure handler (chainable)
   */
  withFailureHandler(handler) {
    this._failureHandler = handler;
    return this._proxy || this;
  }

  /**
   * Sets user object (chainable)
   */
  withUserObject(userObject) {
    this._userObject = userObject;
    return this._proxy || this;
  }

  /**
   * Mock any Apps Script function call
   * @param {string} functionName - Name of the function to mock
   * @param {...any} args - Arguments passed to the function
   */
  _mockFunction(functionName, ...args) {
    console.log(`[MOCK] Calling ${functionName} with args:`, args);

    // Simulate network delay
    setTimeout(() => {
      try {
        // Check if mock data exists for this function
        if (mockData[functionName]) {
          const result =
            typeof mockData[functionName] === "function"
              ? mockData[functionName](...args)
              : mockData[functionName];

          console.log(`[MOCK] ${functionName} success:`, result);

          if (this._successHandler) {
            this._successHandler(result, this._userObject);
          }
        } else {
          throw new Error(`Mock data not found for function: ${functionName}`);
        }
      } catch (error) {
        console.error(`[MOCK] ${functionName} error:`, error);

        if (this._failureHandler) {
          this._failureHandler(error, this._userObject);
        }
      }

      // Reset handlers after execution
      this._reset();
    }, this._delay);
  }

  /**
   * Reset handlers after function execution
   */
  _reset() {
    this._successHandler = null;
    this._failureHandler = null;
    this._userObject = null;
  }

  /**
   * Set custom delay for testing
   */
  setDelay(ms) {
    this._delay = ms;
  }
}

// Create a proxy to dynamically handle any function call
const createMockProxy = () => {
  const mockInstance = new GoogleScriptMock();

  const proxy = new Proxy(mockInstance, {
    get(target, prop) {
      // Return existing methods/properties
      if (prop in target) {
        const value = target[prop];
        // If it's a method, bind it to the target
        return typeof value === "function" ? value.bind(target) : value;
      }

      // For any other property, assume it's a function call
      return function (...args) {
        target._mockFunction(prop, ...args);
      };
    },
  });

  // Set the proxy reference so chaining works
  mockInstance.setProxy(proxy);

  return proxy;
};

export const googleScriptMock = createMockProxy();
