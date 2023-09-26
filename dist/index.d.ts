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
    onAfterScriptLoaded?: (appInsights: ApplicationInsights) => any;
}
declare const _default: {
    install: (app: App<Element>, options: AppInsightsPluginOptions) => void;
};

declare const useAppInsights: () => ApplicationInsights;

export { AppInsightsPluginOptions, _default as default, useAppInsights };
