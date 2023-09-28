import { ApplicationInsights, Snippet } from '@microsoft/applicationinsights-web';
import { App } from 'vue';
import { Router } from 'vue-router';

interface AppInsightsPluginOptions {
    appInsightsInstance?: ApplicationInsights;
    appInsightsConfig?: Snippet;
    connectionString?: string;
    router?: Router;
    appName?: string;
    trackInitialPageView?: boolean;
    trackAppErrors?: boolean;
    onLoaded?: (appInsights: ApplicationInsights) => any;
}
declare const AppInsightsPlugin: {
    install: (app: App<Element>, options: AppInsightsPluginOptions) => void;
};
declare const useAppInsights: () => ApplicationInsights;

export { AppInsightsPlugin, AppInsightsPluginOptions, AppInsightsPlugin as default, useAppInsights };
