import { View, StyleSheet, StatusBar } from 'react-native';

import { useEffect, useState } from 'react';
import type {
  MapboxTurnByTurnNavigationMethods,
  MapboxTurnByTurnNavigationProps,
} from '../../src/MapboxTurnByTurnNavigation.nitro';
import type { HybridView } from 'react-native-nitro-modules';
import { MapboxTurnByTurnNavigation } from 'react-native-mapbox-turn-by-turn-navigation';

type MapboxNavigationView = HybridView<
  MapboxTurnByTurnNavigationProps,
  MapboxTurnByTurnNavigationMethods
>;
export default function App() {
  const [hybridRef, setHybridRef] = useState<MapboxNavigationView>();

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

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container]}>
        <MapboxTurnByTurnNavigation
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
});
