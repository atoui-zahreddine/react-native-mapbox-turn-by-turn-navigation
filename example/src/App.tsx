import {
  View,
  StyleSheet,
  StatusBar,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import { useEffect, useRef, useState } from 'react';
import {
  MapboxTurnByTurnNavigationView,
  type LocationData,
} from 'react-native-mapbox-turn-by-turn-navigation';
import type {
  Coordinate,
  RouteProgress,
  WaypointEvent,
} from '../../lib/typescript/src';

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
        <MapboxTurnByTurnNavigationView
          style={styles.mapboxView}
          origin={{
            longitude: 5.082325,
            latitude: 51.558588,
          }}
          destination={{
            longitude: 5.058566,
            latitude: 51.560985,
          }}
          onLocationChange={{
            f: (event: LocationData) => {
              console.log('Location changed:', event);
            },
          }}
          onCancel={{
            f: () => {
              console.log('Navigation cancelled');
            },
          }}
          onArrival={{
            f: (coordinates: Coordinate) => {
              console.log('Arrived at destination:', coordinates);
            },
          }}
          onWaypointArrival={{
            f: (event: WaypointEvent) => {
              console.log('Arrived at waypoint:', event);
            },
          }}
          onRouteProgressChange={{
            f: (event: RouteProgress) => {
              console.log('Route progress changed:', event);
            },
          }}
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
