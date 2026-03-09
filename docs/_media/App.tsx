import {
  View,
  StyleSheet,
  StatusBar,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import { useEffect, useRef, useState } from 'react';
import {
  NitroMapboxNavigationView,
  type Coordinate,
  type LocationData,
  type RouteProgress,
  type WaypointEvent,
} from 'rn-nitro-mapbox-navigation';
import { callback } from 'react-native-nitro-modules';

export default function App() {
  const isMountedRef = useRef<boolean>(true);
  const [ready, setReady] = useState(false);

  const checkPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Location permission not granted');
        return;
      }
      if (isMountedRef.current) setReady(true);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    if (Platform.OS === 'android') {
      checkPermissions();
    } else {
      setReady(true); // Assume permissions are granted on iOS
    }
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!ready) {
    return <View style={styles.container} />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <NitroMapboxNavigationView
          style={styles.mapboxView}
          origin={{
            longitude: 5.082325,
            latitude: 51.558588,
          }}
          destination={{
            longitude: 5.058566,
            latitude: 51.560985,
          }}
          onLocationChange={callback((event: LocationData) => {
            console.log('Location changed:', event);
          })}
          onCancel={callback(() => {
            console.log('Navigation cancelled');
          })}
          onArrival={callback((coordinates: Coordinate) => {
            console.log('Arrived at destination:', coordinates);
          })}
          onWaypointArrival={callback((event: WaypointEvent) => {
            console.log('Arrived at waypoint:', event);
          })}
          onRouteProgressChange={callback((event: RouteProgress) => {
            console.log('Route progress changed:', event);
          })}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapboxView: {
    flex: 1,
  },
});
