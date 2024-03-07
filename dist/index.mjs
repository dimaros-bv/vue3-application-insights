// src/index.ts
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { generateW3CId } from "@microsoft/applicationinsights-core-js";
import { inject } from "vue";
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
  return new ApplicationInsights(appInsightsConfig);
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
  options.router.beforeEach((route, _) => {
    const name = pageName(route);
    appInsights.context.telemetryTrace.traceID = generateW3CId();
    appInsights.context.telemetryTrace.name = route.name;
    appInsights.startTrackPage(name);
  });
  options.router.afterEach((route) => {
    const name = pageName(route);
    const url = location.protocol + "//" + location.host + route.fullPath;
    appInsights.stopTrackPage(name, url);
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
  const appInsights = inject(injectKey);
  return appInsights;
};
var src_default = AppInsightsPlugin;
export {
  AppInsightsPlugin,
  src_default as default,
  useAppInsights
};
//# sourceMappingURL=index.mjs.map