import { ApplicationInsights, Snippet } from "@microsoft/applicationinsights-web";
import { generateW3CId } from "@microsoft/applicationinsights-core-js";

import { App, inject } from "vue";
import { Router } from "vue-router";

export interface AppInsightsPluginOptions {
  appInsightsInstance?: ApplicationInsights;
  appInsightsConfig?: Snippet;
  connectionString?: string;
  router?: Router;
  appName?: string;
  trackInitialPageView?: boolean;
  trackAppErrors?: boolean;
  onLoaded?: (appInsights: ApplicationInsights) => any;
}

const injectKey = "appInsights";

export const AppInsightPlugin = {
  install: (app: App<Element>, options: AppInsightsPluginOptions) => {
    // Create instance
    let appInsights: ApplicationInsights | null = null;

    // Use existing instance if provided
    if (options.appInsightsInstance) {
      appInsights = options.appInsightsInstance;
    } else {
      // Use provided settings or only connection string
      const appInsightsConfig: Snippet = options.appInsightsConfig || {
        config: {
          connectionString: options.connectionString,
        },
      };

      // Basic validation before init
      if (
        !appInsightsConfig.config.connectionString &&
        !appInsightsConfig.config.instrumentationKey
      ) {
        console.warn(
          "[ApplicationInsights Plugin] Neither connectionString nor instrumentationKey is provided." +
            " ApplicationInsights won't be created."
        );
        return;
      }

      appInsights = new ApplicationInsights(appInsightsConfig);
    }

    // Inject AppInsights for later use
    app.config.globalProperties.$appInsights = appInsights;
    app.provide(injectKey, appInsights);

    // Initial calls
    appInsights.loadAppInsights();

    // Watch route event if router option is defined.
    if (options.router) {
      if (options.trackInitialPageView) {
        setupPageTracking(options, appInsights);
      } else {
        options.router.isReady().then(() => setupPageTracking(options, appInsights!));
      }
    }

    // Track app errors automatically
    if (options.trackAppErrors) {
      const initialErrorHandler = app.config.errorHandler;

      app.config.errorHandler = (err, instance, info) => {
        if (initialErrorHandler) {
          initialErrorHandler(err, instance, info);
        }
        appInsights?.trackException({ exception: err as Error }, { info });
      };
    }

    if (options.onLoaded) {
      options.onLoaded(appInsights);
    }
  },
};

function setupPageTracking(options: AppInsightsPluginOptions, appInsights: ApplicationInsights) {
  const appName = options.appName ? `[${options.appName}] ` : "";

  const pageName = (route: any) => `${appName}${route.name as string}`;

  options.router!.beforeEach((route, _, next) => {
    const name = pageName(route);
    appInsights.context.telemetryTrace.traceID = generateW3CId();
    appInsights.context.telemetryTrace.name = route.name as string;
    appInsights.startTrackPage(name);
    next();
  });

  options.router!.afterEach((route) => {
    const name = pageName(route);
    const url = location.protocol + "//" + location.host + route.fullPath;
    appInsights.stopTrackPage(name, url);
    appInsights.flush();
  });
}

export const useAppInsights = () => {
  const appInsights = inject(injectKey) as ApplicationInsights;
  return appInsights;
};

export default AppInsightPlugin;
