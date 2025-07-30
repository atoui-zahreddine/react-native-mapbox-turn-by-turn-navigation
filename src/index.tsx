import type { ComponentProps } from 'react';

const MapboxTurnByTurnNavigationConfig = require('../nitrogen/generated/shared/json/MapboxTurnByTurnNavigationConfig.json');
import type {
  MapboxTurnByTurnNavigationMethods,
  MapboxTurnByTurnNavigationProps,
} from './MapboxTurnByTurnNavigation.nitro';

export * from './MapboxTurnByTurnNavigation.nitro';

import { StyleSheet, View } from 'react-native';
import { getHostComponent } from 'react-native-nitro-modules';

export const NativeView = getHostComponent<
  MapboxTurnByTurnNavigationProps,
  MapboxTurnByTurnNavigationMethods
>('MapboxTurnByTurnNavigation', () => MapboxTurnByTurnNavigationConfig);

export const MapboxTurnByTurnNavigationView = (
  props: ComponentProps<typeof NativeView>
) => {
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
