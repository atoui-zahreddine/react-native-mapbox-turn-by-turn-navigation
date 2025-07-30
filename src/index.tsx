const MapboxTurnByTurnNavigationConfig = require('../nitrogen/generated/shared/json/MapboxTurnByTurnNavigationConfig.json');
import type {
  MapboxTurnByTurnNavigationMethods,
  MapboxTurnByTurnNavigationProps,
} from './MapboxTurnByTurnNavigation.nitro';

export * from './MapboxTurnByTurnNavigation.nitro';

import { getHostComponent } from 'react-native-nitro-modules';

export const MapboxTurnByTurnNavigationView = getHostComponent<
  MapboxTurnByTurnNavigationProps,
  MapboxTurnByTurnNavigationMethods
>('MapboxTurnByTurnNavigation', () => MapboxTurnByTurnNavigationConfig);
