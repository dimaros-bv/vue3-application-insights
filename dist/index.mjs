// src/index.ts
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { generateW3CId } from "@microsoft/applicationinsights-core-js";
import { inject } from "vue";
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
      appInsights = new ApplicationInsights(appInsightsConfig);
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