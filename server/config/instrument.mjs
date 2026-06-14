import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: "https://726e1b15c7b3b3775b1a25fb27e1a3c7@o4511529891397632.ingest.de.sentry.io/4511529894019152",
  // To disable sending user data, uncomment the line below. For more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
  // dataCollection: { userInfo: false },
  sendDefaultPii:true,
});