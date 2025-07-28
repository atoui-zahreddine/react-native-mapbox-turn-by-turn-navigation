import {
  type ComponentProps,
  type FC,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  PermissionsAndroid,
  Platform,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
const MapboxTurnByTurnNavigationConfig = require('../nitrogen/generated/shared/json/MapboxTurnByTurnNavigationConfig.json');
import type {
  MapboxTurnByTurnNavigationMethods,
  MapboxTurnByTurnNavigationProps,
} from './MapboxTurnByTurnNavigation.nitro';

import { getHostComponent } from 'react-native-nitro-modules';

const NativeView = getHostComponent<
  MapboxTurnByTurnNavigationProps,
  MapboxTurnByTurnNavigationMethods
>('MapboxTurnByTurnNavigation', () => MapboxTurnByTurnNavigationConfig);

export const MapboxTurnByTurnNavigation: FC<
  ComponentProps<typeof NativeView> & { style?: StyleProp<ViewStyle> }
> = (props) => {
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
    <View style={[styles.container, props.style]}>
      <NativeView {...props} style={styles.container} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
