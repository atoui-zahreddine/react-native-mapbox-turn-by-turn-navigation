import NitroMapboxNavigationConfig from '../nitrogen/generated/shared/json/NitroMapboxNavigationConfig.json';
import type {
  NitroMapboxNavigationMethods,
  NitroMapboxNavigationProps,
} from './NitroMapboxNavigation.nitro';

export * from './NitroMapboxNavigation.nitro';

import { getHostComponent } from 'react-native-nitro-modules';

export const NitroMapboxNavigationView = getHostComponent<
  NitroMapboxNavigationProps,
  NitroMapboxNavigationMethods
>('NitroMapboxNavigation', () => NitroMapboxNavigationConfig);
