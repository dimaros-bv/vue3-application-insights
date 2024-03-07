# vue3-application-insights

Vue 3 plugin to simplify integration with Azure Application Insights.


## Installation

```console
npm install vue3-application-insights
```


## Setup

### Minimal
```js
import { createApp } from "vue";
import { AppInsightsPlugin, AppInsightsPluginOptions } from "vue3-application-insights";

const aiOptions: AppInsightsPluginOptions = {
  connectionString: "<your connection string>",
};

createApp(App).use(AppInsightsPlugin, aiOptions).mount("#app");
```

### With router and app errors
```js
import { createApp } from "vue";
import router from "./router";
import { AppInsightsPlugin, AppInsightsPluginOptions } from "vue3-application-insights";

const aiOptions: AppInsightsPluginOptions = {
  connectionString: "<your connection string>",
  router: router,
  trackAppErrors: true,
};

createApp(App).use(router).use(AppInsightsPlugin, aiOptions).mount("#app");
```

### Custom Application Insights configuration
```js
const aiOptions: AppInsightsPluginOptions = {
  appInsightsConfig: {
    // See Application Insights specifications: https://github.com/microsoft/ApplicationInsights-JS#configuration
    config: {
      connectionString: "<your connection string>",
    },
  },
  router: router,
  trackAppErrors: true,
};
```

### All options example
```js
const aiOptions: AppInsightsPluginOptions = {
  connectionString: import.meta.env.VITE_APPLICATION_INSIGHTS_CONNECTION_STRING, // Get value from .env file
  router: router,
  appName: 'Vue + Vite app', // For route event to be like: [appName] <route.name>
  trackAppErrors: true,
  cloudRole: 'frontend',
  cloudRoleInstance: 'vue-app',
  onLoaded: (appInsights: ApplicationInsights) => {
    // Custom changes for application insights
  }
};
```


## Using in components

### Track custom event

```js
import { useAppInsights } from "vue3-application-insights";

const appInsights = useAppInsights();

appInsights.trackEvent({
  name: "custom_event",
});
```
[See official docs](https://github.com/microsoft/ApplicationInsights-JS#sending-telemetry-to-the-azure-portal) for sending custom telemetry to Azure Portal.


## Options

| Name                 | Type                                       | Required / Default value | Description                                                                                                                       |
|----------------------|--------------------------------------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| appInsightsInstance  | ApplicationInsights                        | No*                      | Custom self made Application Insights instance to use.                                                                            |
| appInsightsConfig    | Snippet                                    | No*                      | Provide custom [Application Insights configuration](https://github.com/microsoft/ApplicationInsights-JS#configuration).           |
| connectionString     | string                                     | No*                      | Simply provide Application Insights connection string only.                                                                       |
| router               | Router                                     | No                       | Instance of Router (from vue-router) to track navigation between pages. The event name will have format: `[appName] <route.name>` |
| appName              | string                                     | No                       | App name for router events. If not provided will not present in the event name.                                                   |
| trackInitialPageView | boolean                                    | No / False               | Track initial page view or track it only when router is ready.                                                                    |
| trackAppErrors       | boolean                                    | No / False               | Track global errors of the app.                                                                                                   |
| cloudRole            | string                                     | No                       | Name of the role the application is a part of. Maps directly to the role name in azure.                                           |
| cloudRoleInstance    | string                                     | No                       | Name of the instance where the application is running. Computer name for on-premises, instance name for Azure.                    |
| onLoaded             | (appInsights: ApplicationInsights) => void | No                       | Custom modifications / action to execute after Application Insights instance is created.                                          |

*One of these three values should be set to connect with your Application Insights instance. 
If more than one is set the top one (based on the option list) will be used.


Inspired by [vue-application-insights](https://github.com/latelierco/vue-application-insights).
