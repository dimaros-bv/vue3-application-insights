# vue3-application-insights

## Installation

```console
npm install vue3-application-insights
```

## Get started

```js
import { createApp } from "vue";
import router from "./router";
import { AppInsightsPlugin, AppInsightsPluginOptions } from "vue3-application-insights";

const aiOptions: AppInsightsPluginOptions = {
  appName: "<app name for events>", // Prefix for route events
  connectionString: "<your connection string>",
  router: router,
  trackAppErrors: true,
};

createApp(App).use(router).use(AppInsightsPlugin, aiOptions).mount("#app");
```

Track custom event:

```js
import { useAppInsights } from "vue3-application-insights";

const appInsights = useAppInsights();

appInsights.trackEvent({
  name: "custom_event",
});
```

## Options

| Name                 | Type                                      | Required / Default value | Description                                                                                                                       |
|----------------------|-------------------------------------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| appInsightsInstance  | ApplicationInsights                       | No*                      | Custom self made application insights instance to use.                                                                            |
| appInsightsConfig    | Snippet                                   | No*                      | Provide custom [application insights configuration](https://github.com/microsoft/ApplicationInsights-JS#configuration).           |
| connectionString     | string                                    | No*                      | Simply provide application insights connection string only.                                                                       |
| router               | Router                                    | No                       | Instance of Router (from vue-router) to track navigation between pages. The event name will have format: `[appName] <route.name>` |
| appName              | string                                    | No                       | App name for router events. If not provided will not present in the event name.                                                   |
| trackInitialPageView | boolean                                   | No / False               | Track initial page view or track it only when router is ready.                                                                    |
| trackAppErrors       | boolean                                   | No / False               | Track global errors of the app.                                                                                                   |
| onLoaded             | (appInsights: ApplicationInsights) => any | No                       | Custom modifications / action to execute after application insights instance is created.                                          |

*One of these three values should be set to connect with your Application Insights instance. 
If more than one is set the top one (based on the option list) will be used.


Inspired by [vue-application-insights](https://github.com/latelierco/vue-application-insights).
