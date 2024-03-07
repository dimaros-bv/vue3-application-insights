import { ApplicationInsights, Snippet } from "@microsoft/applicationinsights-web";
import { ITelemetryItem, generateW3CId } from "@microsoft/applicationinsights-core-js";

import { App, InjectionKey, inject } from "vue";
import { Router } from "vue-router";

export interface AppInsightsPluginOptions {
  appInsightsInstance?: ApplicationInsights;
  appInsightsConfig?: Snippet;
  connectionString?: string;
  router?: Router;
  appName?: string;
  trackInitialPageView?: boolean;
  trackAppErrors?: boolean;
  cloudRole?: string;
  cloudRoleInstance?: string;
  onLoaded?: (appInsights: ApplicationInsights) => void;
}

const injectKey: InjectionKey<ApplicationInsights | null> = Symbol("appInsights");

const logPrefix = "[ApplicationInsights Plugin]";

/**
 * Validates the options provided to init plugin.
 * @param options Application Insight plugin options.
 * @returns True if options is valid, otherwise false.
 */
function isOptionsValid(options: AppInsightsPluginOptions): boolean {
  const initOptions = [
    options.appInsightsInstance,
    options.appInsightsConfig,
    options.connectionString,
  ];

  // Validate init options
  const providedInitOptions = initOptions.filter((config) => !!config).length;
  if (providedInitOptions === 0) {
    console.warn(
      logPrefix +
        " One of the options should be provided: appInsightsInstance, appInsightsConfig, connectionString." +
        " ApplicationInsights won't be created."
    );
    return false;
  }

  // Too many init options, just log misconfiguration warning.
  if (providedInitOptions > 1) {
    console.warn(
      logPrefix +
        " Too many config values provided to init application insights." +
        " The order of usage is: appInsightsInstance, appInsightsConfig, connectionString."
    );
  }

  // Init via config but no instrumentation key or connection string
  if (
    options.appInsightsConfig &&
    !options.appInsightsConfig.config?.connectionString &&
    !options.appInsightsConfig.config?.instrumentationKey
  ) {
    console.warn(
      logPrefix +
        " Neither connectionString nor instrumentationKey is provided in appInsightsConfig.config." +
        " ApplicationInsights won't be created."
    );

    return false;
  }

  return true;
}

/**
 * Creates application insights based on provided options.
 * @param options Application Insights plugin options.
 * @returns ApplicationInsights instance.
 */
function createApplicationInsights(options: AppInsightsPluginOptions): ApplicationInsights {
  if (options.appInsightsInstance) {
    return options.appInsightsInstance;
  }

  const appInsightsConfig: Snippet = options.appInsightsConfig ?? {
    config: {
      connectionString: options.connectionString,
    },
  };

  return new ApplicationInsights(appInsightsConfig);
}

/**
 * Setup page tracking if router option is defined.
 * @param appInsights ApplicationInsights instance.
 * @param options Application insights plugin options.
 */
function configurePageTrackingWithRouter(
  appInsights: ApplicationInsights,
  options: AppInsightsPluginOptions
): void {
  if (!options.router) {
    return;
  }

  if (options.trackInitialPageView) {
    setupPageTracking(appInsights, options);
  } else {
    options.router.isReady().then(() => setupPageTracking(appInsights, options));
  }
}

/**
 * Setup app errors tracking.
 * @param app App.
 * @param appInsights ApplicationInsights instance.
 * @param options Application insights plugin options.
 */
function configureAppErrorsTracking(
  app: App<Element>,
  appInsights: ApplicationInsights,
  options: AppInsightsPluginOptions
): void {
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
}

/**
 * Setup page tracking using router.
 * @param appInsights ApplicationInsights instance.
 * @param options Application insights plugin options.
 */
function setupPageTracking(appInsights: ApplicationInsights, options: AppInsightsPluginOptions) {
  const appName = options.appName ? `[${options.appName}] ` : "";

  const pageName = (route: any) => `${appName}${route.name as string}`;

  options.router!.beforeEach((route, _) => {
    const name = pageName(route);
    appInsights.context.telemetryTrace.traceID = generateW3CId();
    appInsights.context.telemetryTrace.name = route.name as string;
    appInsights.startTrackPage(name);
  });

  options.router!.afterEach((route) => {
    const name = pageName(route);
    const url = location.protocol + "//" + location.host + route.fullPath;
    appInsights.stopTrackPage(name, url);
  });
}

/**
 * Configure cloud role and instance for Azure application map.
 * @param appInsights ApplicationInsights instance.
 * @param options Application insights plugin options.
 */
function configureCloudRole(
  appInsights: ApplicationInsights,
  options: AppInsightsPluginOptions
): void {
  if (options.cloudRole || options.cloudRoleInstance) {
    appInsights.addTelemetryInitializer((envelope: ITelemetryItem) => {
      envelope.tags ??= [];
      if (options.cloudRole) {
        envelope.tags["ai.cloud.role"] = options.cloudRole;
      }
      if (options.cloudRoleInstance) {
        envelope.tags["ai.cloud.roleInstance"] = options.cloudRoleInstance;
      }
    });
  }
}

export const AppInsightsPlugin = {
  install: (app: App<Element>, options: AppInsightsPluginOptions) => {
    if (!isOptionsValid(options)) {
      return;
    }

    const appInsights = createApplicationInsights(options);

    // Inject AppInsights for later use
    app.config.globalProperties.$appInsights = appInsights;
    app.provide(injectKey, appInsights);

    // Initial calls
    appInsights.loadAppInsights();

    configurePageTrackingWithRouter(appInsights, options);
    configureAppErrorsTracking(app, appInsights, options);
    configureCloudRole(appInsights, options);

    if (options.onLoaded) {
      options.onLoaded(appInsights);
    }
  },
};

export const useAppInsights = () => {
  const appInsights = inject(injectKey) as ApplicationInsights;
  return appInsights;
};

export default AppInsightsPlugin;
