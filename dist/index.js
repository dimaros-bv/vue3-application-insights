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
var injectKey = "appInsights";
var AppInsightsPlugin = {
  install: (app, options) => {
    let appInsights = null;
    if (options.appInsightsInstance) {
      appInsights = options.appInsightsInstance;
    } else {
      const appInsightsConfig = options.appInsightsConfig || {
        config: {
          connectionString: options.connectionString
        }
      };
      if (!appInsightsConfig.config.connectionString && !appInsightsConfig.config.instrumentationKey) {
        console.warn(
          "[ApplicationInsights Plugin] Neither connectionString nor instrumentationKey is provided. ApplicationInsights won't be created."
        );
        return;
      }
      appInsights = new import_applicationinsights_web.ApplicationInsights(appInsightsConfig);
    }
    app.config.globalProperties.$appInsights = appInsights;
    app.provide(injectKey, appInsights);
    appInsights.loadAppInsights();
    if (options.router) {
      if (options.trackInitialPageView) {
        setupPageTracking(options, appInsights);
      } else {
        options.router.isReady().then(() => setupPageTracking(options, appInsights));
      }
    }
    if (options.trackAppErrors) {
      const initialErrorHandler = app.config.errorHandler;
      app.config.errorHandler = (err, instance, info) => {
        if (initialErrorHandler) {
          initialErrorHandler(err, instance, info);
        }
        appInsights == null ? void 0 : appInsights.trackException({ exception: err }, { info });
      };
    }
    if (options.onLoaded) {
      options.onLoaded(appInsights);
    }
  }
};
function setupPageTracking(options, appInsights) {
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