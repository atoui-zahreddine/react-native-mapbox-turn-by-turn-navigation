"use strict";

import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
const MapboxTurnByTurnNavigationConfig = require('../nitrogen/generated/shared/json/MapboxTurnByTurnNavigationConfig.json');
import { getHostComponent } from 'react-native-nitro-modules';
import { jsx as _jsx } from "react/jsx-runtime";
const NativeView = getHostComponent('MapboxTurnByTurnNavigation', () => MapboxTurnByTurnNavigationConfig);
export const MapboxTurnByTurnNavigation = props => {
  const isMountedRef = useRef(true);
  const [ready, setReady] = useState(false);
  const checkPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
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
    return /*#__PURE__*/_jsx(View, {
      style: styles.container
    });
  }
  return /*#__PURE__*/_jsx(View, {
    style: [styles.container, props.style],
    children: /*#__PURE__*/_jsx(NativeView, {
      ...props,
      style: styles.container
    })
  });
};
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
//# sourceMappingURL=MapboxTurnByTurnNavigationView.js.map