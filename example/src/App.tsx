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
  type MapboxTurnByTurnNavigation,
} from 'react-native-mapbox-turn-by-turn-navigation';

export default function App() {
  const [hybridRef, setHybridRef] = useState<MapboxTurnByTurnNavigation>();
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

  useEffect(() => {
    let unsubscribeFromListeners: (() => void)[] = [];

    if (hybridRef) {
      unsubscribeFromListeners.push(
        hybridRef.addOnArrivalListener((event) => {
          console.log('Arrived at destination:', event);
        })
      );
      unsubscribeFromListeners.push(
        hybridRef.addOnWaypointArrivalListener((event) => {
          console.log('Arrived at waypoint:', event);
        })
      );
      unsubscribeFromListeners.push(
        hybridRef.addOnLocationChangeListener((event) => {
          console.log('Location changed:', event);
        })
      );
      unsubscribeFromListeners.push(
        hybridRef.addOnRouteProgressChangeListener((event) => {
          console.log('Route progress changed:', event);
        })
      );
      unsubscribeFromListeners.push(
        hybridRef.addOnErrorListener((error) => {
          console.error('Error occurred:', error);
        })
      );
      unsubscribeFromListeners.push(
        hybridRef.addOnCancelListener(() => {
          console.log('Error occurred:');
        })
      );
    }

    return () => {
      console.log('Cleaning up listeners');
      if (unsubscribeFromListeners.length > 0) {
        unsubscribeFromListeners.forEach(
          (unsubscribe) => typeof unsubscribe === 'function' && unsubscribe()
        );
        unsubscribeFromListeners = [];
      }
    };
  }, [hybridRef]);

  if (!ready) {
    return <View style={styles.container} />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container]}>
        <MapboxTurnByTurnNavigationView
          style={styles.mapboxView}
          hybridRef={{ f: (hRef) => setHybridRef(hRef) }}
          origin={{
            longitude: 5.058566,
            latitude: 51.560985,
          }}
          destination={{
            longitude: 5.082325,
            latitude: 51.558588,
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
