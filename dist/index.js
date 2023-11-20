"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AppInsightsPlugin: () => AppInsightsPlugin,
  default: () => src_default,
  useAppInsights: () => useAppInsights
});
module.exports = __toCommonJS(src_exports);
var import_applicationinsights_web = require("@microsoft/applicationinsights-web");
var import_applicationinsights_core_js = require("@microsoft/applicationinsights-core-js");
var import_vue = require("vue");
var injectKey = Symbol("appInsights");
var logPrefix = "[ApplicationInsights Plugin]";
function isOptionsValid(options) {
  var _a, _b;
  const initOptions = [
    options.appInsightsInstance,
    options.appInsightsConfig,
    options.connectionString
  ];
  const providedInitOptions = initOptions.filter((config) => !!config).length;
  if (providedInitOptions === 0) {
    console.warn(
      logPrefix + " One of the options should be provided: appInsightsInstance, appInsightsConfig, connectionString. ApplicationInsights won't be created."
    );
    return false;
  }
  if (providedInitOptions > 1) {
    console.warn(
      logPrefix + " Too many config values provided to init application insights. The order of usage is: appInsightsInstance, appInsightsConfig, connectionString."
    );
  }
  if (options.appInsightsConfig && !((_a = options.appInsightsConfig.config) == null ? void 0 : _a.connectionString) && !((_b = options.appInsightsConfig.config) == null ? void 0 : _b.instrumentationKey)) {
    console.warn(
      logPrefix + " Neither connectionString nor instrumentationKey is provided in appInsightsConfig.config. ApplicationInsights won't be created."
    );
    return false;
  }
  return true;
}
function createApplicationInsights(options) {
  var _a;
  if (options.appInsightsInstance) {
    return options.appInsightsInstance;
  }
  const appInsightsConfig = (_a = options.appInsightsConfig) != null ? _a : {
    config: {
      connectionString: options.connectionString
    }
  };
  return new import_applicationinsights_web.ApplicationInsights(appInsightsConfig);
}
function configurePageTrackingWithRouter(appInsights, options) {
  if (!options.router) {
    return;
  }
  if (options.trackInitialPageView) {
    setupPageTracking(appInsights, options);
  } else {
    options.router.isReady().then(() => setupPageTracking(appInsights, options));
  }
}
function configureAppErrorsTracking(app, appInsights, options) {
  if (options.trackAppErrors) {
    const initialErrorHandler = app.config.errorHandler;
    app.config.errorHandler = (err, instance, info) => {
      if (initialErrorHandler) {
        initialErrorHandler(err, instance, info);
      }
      appInsights == null ? void 0 : appInsights.trackException({ exception: err }, { info });
    };
  }
}
function setupPageTracking(appInsights, options) {
  const appName = options.appName ? `[${options.appName}] ` : "";
  const pageName = (route) => `${appName}${route.name}`;
  options.router.beforeEach((route, _, next) => {
    const name = pageName(route);
    appInsights.context.telemetryTrace.traceID = (0, import_applicationinsights_core_js.generateW3CId)();
    appInsights.context.telemetryTrace.name = route.name;
    appInsights.startTrackPage(name);
    next();
  });
  options.router.afterEach((route) => {
    const name = pageName(route);
    const url = location.protocol + "//" + location.host + route.fullPath;
    appInsights.stopTrackPage(name, url);
    appInsights.flush();
  });
}
function configureCloudRole(appInsights, options) {
  if (options.cloudRole || options.cloudRoleInstance) {
    appInsights.addTelemetryInitializer((envelope) => {
      var _a;
      (_a = envelope.tags) != null ? _a : envelope.tags = [];
      if (options.cloudRole) {
        envelope.tags["ai.cloud.role"] = options.cloudRole;
      }
      if (options.cloudRoleInstance) {
        envelope.tags["ai.cloud.roleInstance"] = options.cloudRoleInstance;
      }
    });
  }
}
var AppInsightsPlugin = {
  install: (app, options) => {
    if (!isOptionsValid(options)) {
      return;
    }
    const appInsights = createApplicationInsights(options);
    app.config.globalProperties.$appInsights = appInsights;
    app.provide(injectKey, appInsights);
    appInsights.loadAppInsights();
    configurePageTrackingWithRouter(appInsights, options);
    configureAppErrorsTracking(app, appInsights, options);
    configureCloudRole(appInsights, options);
    if (options.onLoaded) {
      options.onLoaded(appInsights);
    }
  }
};
var useAppInsights = () => {
  const appInsights = (0, import_vue.inject)(injectKey);
  return appInsights;
};
var src_default = AppInsightsPlugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AppInsightsPlugin,
  useAppInsights
});
//# sourceMappingURL=index.js.map