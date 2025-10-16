import { mockData } from "../mocks/mockData.js";

/**
 * Simple wrapper for google.script.run
 * Automatically uses mock in development mode
 *
 * Usage (same as google.script.run):
 *   googleScriptRun
 *     .withSuccessHandler(data => console.log(data))
 *     .withFailureHandler(error => console.error(error))
 *     .yourServerFunction(arg1, arg2);
 *
 * Or with async/await:
 *   const data = await googleScriptRun.yourServerFunction(arg1, arg2);
 */

// Check if we're in Apps Script environment
const isAppsScriptEnvironment =
  typeof google !== "undefined" && google?.script?.run;

/**
 * Mock implementation for development
 */
class MockScriptRun {
  constructor() {
    this._successHandler = null;
    this._failureHandler = null;
    this._userObject = null;
    this._delay = 500;
  }

  withSuccessHandler(handler) {
    this._successHandler = handler;
    return this;
  }

  withFailureHandler(handler) {
    this._failureHandler = handler;
    return this;
  }

  withUserObject(userObject) {
    this._userObject = userObject;
    return this;
  }

  /**
   * Execute mock function
   */
  _execute(functionName, args, resolve, reject) {
    setTimeout(() => {
      try {
        const result =
          typeof mockData[functionName] === "function"
            ? mockData[functionName](...args)
            : mockData[functionName];

        if (result === undefined) {
          throw new Error(`Mock data not found for function: ${functionName}`);
        }

        console.log(
          `[MOCK] ${functionName}(${JSON.stringify(args)}) =>`,
          result
        );

        if (this._successHandler) {
          this._successHandler(result, this._userObject);
        }
        if (resolve) {
          resolve(result);
        }
      } catch (error) {
        console.error(`[MOCK] ${functionName} error:`, error);

        if (this._failureHandler) {
          this._failureHandler(error, this._userObject);
        }
        if (reject) {
          reject(error);
        }
      }
    }, this._delay);
  }

  /**
   * Create a proxy to handle any function call
   */
  _createProxy() {
    return new Proxy(this, {
      get: (target, prop) => {
        // Return existing methods
        if (prop in target || typeof prop === "symbol") {
          return target[prop];
        }

        // For any other property, treat it as a server function call
        return (...args) => {
          // If handlers are set, use callback style
          if (target._successHandler || target._failureHandler) {
            target._execute(prop, args);
            // Reset handlers after execution
            const newInstance = new MockScriptRun();
            return newInstance._createProxy();
          }

          // Otherwise, return a promise for async/await style
          return new Promise((resolve, reject) => {
            target._execute(prop, args, resolve, reject);
          });
        };
      },
    });
  }
}

/**
 * Production wrapper for google.script.run
 * Adds promise support while maintaining callback compatibility
 */
class ProductionScriptRun {
  constructor() {
    this._successHandler = null;
    this._failureHandler = null;
    this._userObject = null;
    this._scriptRun = google.script.run;
  }

  withSuccessHandler(handler) {
    this._successHandler = handler;
    return this;
  }

  withFailureHandler(handler) {
    this._failureHandler = handler;
    return this;
  }

  withUserObject(userObject) {
    this._userObject = userObject;
    return this;
  }

  _createProxy() {
    return new Proxy(this, {
      get: (target, prop) => {
        // Return existing methods
        if (prop in target || typeof prop === "symbol") {
          return target[prop];
        }

        // For server function calls
        return (...args) => {
          // If handlers are set, use callback style with google.script.run
          if (target._successHandler || target._failureHandler) {
            let scriptCall = target._scriptRun;

            if (target._successHandler) {
              scriptCall = scriptCall.withSuccessHandler(
                target._successHandler
              );
            }
            if (target._failureHandler) {
              scriptCall = scriptCall.withFailureHandler(
                target._failureHandler
              );
            }
            if (target._userObject) {
              scriptCall = scriptCall.withUserObject(target._userObject);
            }

            scriptCall[prop](...args);

            // Return new instance for chaining
            return new ProductionScriptRun()._createProxy();
          }

          // Otherwise, return a promise
          return new Promise((resolve, reject) => {
            target._scriptRun
              .withSuccessHandler(resolve)
              .withFailureHandler(reject)
              [prop](...args);
          });
        };
      },
    });
  }
}

// Create and export the appropriate implementation
const createGoogleScriptRun = () => {
  if (isAppsScriptEnvironment) {
    console.log("[google.script.run] Using production mode");
    return new ProductionScriptRun()._createProxy();
  } else {
    console.log("[google.script.run] Using development mode with mocks");
    return new MockScriptRun()._createProxy();
  }
};

export const googleScriptRun = createGoogleScriptRun();
