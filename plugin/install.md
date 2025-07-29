# Expo Installation

> :warning: This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

First install the package with [`expo`](https://docs.expo.io/workflow/expo-cli/#expo-install), [`yarn`or `npm`](../README.md#step-1---install-package).

Install the latest release:
```sh
expo install expo-mapbox-navigation
```

## Plugin Configuration

After installing this package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.{json,config.js,config.ts}`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-mapbox-navigation",
        {
          "MapboxPublicToken": "pk.ey...qg",
          "MapboxDownloadToken": "sk.ey...qg"
        }
      ]
    ]
  }
}
```


Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

## Manual Setup

For bare workflow projects, you can follow the manual setup guides:

- [iOS](/ios/install.md)
- [Android](/android/install.md)
