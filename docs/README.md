**react-native-mapbox-turn-by-turn-navigation**

***

# React Native Mapbox Turn-by-Turn Navigation

React Native module for Mapbox Navigation SDK, providing full turn-by-turn navigation functionality.

## Features

-   **Turn-by-Turn Navigation**: Provides a complete turn-by-turn navigation UI and experience.
-   **Customizable UI**: The navigation view can be customized with your own colors and styles.
-   **Expo Support**: Seamless integration with Expo projects using a config plugin.
-   **Nitro Modules**: Built with Nitro Modules for efficient native module development.

## Installation

To use this library, you need to install it along with `react-native-nitro-modules`:

```sh
npm install react-native-mapbox-turn-by-turn-navigation react-native-nitro-modules
```

> **Note**: `react-native-nitro-modules` is a peer dependency and is required for this library to work.

## Expo Integration

This library supports Expo through a config plugin. The plugin automates the configuration process for both Android and iOS.

### Automatic Prebuild Configuration

To enable automatic prebuild configuration, add the following to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app requires access to your location for navigation purposes.",
        "UIBackgroundModes": [
          "audio",
          "location"
        ]
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "FOREGROUND_SERVICE"
      ]
    },
    "plugins": [
      "react-native-mapbox-turn-by-turn-navigation",
      {
        "mapboxPublicToken": "<YOUR_MAPBOX_PUBLIC_TOKEN>",
        "mapboxDownloadsToken": "<YOUR_MAPBOX_DOWNLOADS_TOKEN>"
      }
    ]
  }
}
```

This will automatically configure the necessary settings for Mapbox integration when you run `npx expo prebuild`.

### Manual Configuration

* ### Ios

1. Place your secret token in a .netrc file in your OS root directory.

   ```
   machine api.mapbox.com
   login mapbox
   password <INSERT SECRET TOKEN>
   ```

2. Install pods

   ```
   cd ios && pod install
   ```

3. Place your public token in your Xcode project's `Info.plist` and add a `MBXAccessToken` key whose value is your public access token.

4. Add the `UIBackgroundModes` key to `Info.plist` with `audio` and `location` if it is not already present. This will allow your app to deliver audible instructions while it is in the background or the device is locked.

   ```
   <key>UIBackgroundModes</key>
   <array>
     <string>audio</string>
     <string>location</string>
   </array>
   ```

* ### Android Specific Instructions

1. Place your secret token in your android app's top level `gradle.properties` or `«USER_HOME»/.gradle/gradle.properties` file

   ```
   MAPBOX_DOWNLOADS_TOKEN=<YOUR_MAPBOX_DOWNLOADS_TOKEN>
   ```

2. Open up your _project-level_ `build.gradle` file. Declare the Mapbox Downloads API's `releases/maven` endpoint in the _allprojects_ `repositories` block.

   ```gradle
   allprojects {
       repositories {
           maven {
                 url 'https://api.mapbox.com/downloads/v2/releases/maven'
                 authentication {
                     basic(BasicAuthentication)
                 }
                 credentials {
                   // Do not change the username below.
                   // This should always be `mapbox` (not your username).
                     username = "mapbox"
                     // Use the secret token you stored in gradle.properties as the password
                     password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: ""
                 }
             }
       }
   }
   ```

3. Add Resources<br/>
   To do so create a new string resource file in your app module `(e.g. app/src/main/res/values/mapbox_access_token.xml)` with your public Mapbox API token:

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
    <resources xmlns:tools="http://schemas.android.com/tools">
        <string name="mapbox_access_token" translatable="false" tools:ignore="UnusedResources">YOUR_MAPBOX_ACCESS_TOKEN</string>
    </resources>
   ```

   For more details installation you can read the [Official docs of Mapbox](https://docs.mapbox.com/android/navigation/guides/installation).

## Usage

Here's a basic example of how to use the navigation view in your component:

```javascript
import { MapboxTurnByTurnNavigationView } from "react-native-mapbox-turn-by-turn-navigation";

// ...

<MapboxTurnByTurnNavigationView
  style={{ flex: 1 }}
  origin={{
    longitude: 5.058566,
    latitude: 51.560985,
  }}
  destination={{
    longitude: 5.082325,
    latitude: 51.558588,
  }}
/>
```
Please refer to the [example](_media/App.tsx) project for more detailed usage and configuration options.
## Contributing

Contributions are welcome! Please see the [contributing guide](_media/CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

This project is licensed under the MIT License - see the [LICENSE](_media/LICENSE) file for details.
