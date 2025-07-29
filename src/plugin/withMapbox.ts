import {
  type ConfigPlugin,
  createRunOncePlugin,
  WarningAggregator,
  withProjectBuildGradle,
  withAndroidColors,
  withGradleProperties,
  withInfoPlist,
} from '@expo/config-plugins';

import {
  createGeneratedHeaderComment,
  removeGeneratedContents,
  type MergeResults,
} from './generateCode';
import { resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import type { ExpoConfig } from '@expo/config-types';

let pkg: { name: string; version?: string } = {
  name: 'react-native-mapbox-turn-by-turn-navigation',
};
try {
  pkg = require('react-native-mapbox-turn-by-turn-navigation');
} catch {
  // empty catch block
}

export type MapboxPlugProps = {
  MapboxPublicToken?: string;
  MapboxDownloadToken?: string;
};

const copyMapboxAccessTokenXml = (
  config: ExpoConfig,
  args: MapboxPlugProps
): ExpoConfig => {
  if (!args.MapboxPublicToken) {
    console.warn(
      'Mapbox Access Token is missing. Please provide MapboxPublicToken.'
    );
    return config;
  }

  // Use withAndroidColors to add a string resource.
  // This is a convenient way to add XML resources to values/colors.xml,
  // but we will manually create a new file specifically for the token.
  return withAndroidColors(config, (androidConfig) => {
    const androidProjectRoot = androidConfig.modRequest.platformProjectRoot;
    const valuesDir = resolve(
      androidProjectRoot,
      'app',
      'src',
      'main',
      'res',
      'values'
    );
    const outputFilePath = resolve(valuesDir, 'mapbox_access_token.xml');

    // Ensure the values directory exists
    if (!existsSync(valuesDir)) {
      mkdirSync(valuesDir, { recursive: true });
    }

    // The content of the mapbox_access_token.xml file
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="mapbox_access_token">${args.MapboxPublicToken}</string>
</resources>
`;

    // Write the XML content to the file
    try {
      writeFileSync(outputFilePath, xmlContent);
    } catch (error) {
      console.error(`Error writing mapbox_access_token.xml: ${error}`);
    }

    return androidConfig;
  });
};

// Because we need the package to be added AFTER the React and Google maven packages, we create a new allprojects.
// It's ok to have multiple allprojects.repositories, so we create a new one since it's cheaper than tokenizing
// the existing block to find the correct place to insert our mapbox maven.
const gradleMaven = `
allprojects {
  repositories {
    maven {
      url 'https://api.mapbox.com/downloads/v2/releases/maven'
      authentication { basic(BasicAuthentication) }
      credentials {
        username = 'mapbox'
        password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: ""
      }
    }
  }
}
`;

// Fork of config-plugins mergeContents, but appends the contents to the end of the file.
const appendContents = ({
  src,
  newSrc,
  tag,
  comment,
}: {
  src: string;
  newSrc: string;
  tag: string;
  comment: string;
}): MergeResults => {
  const header = createGeneratedHeaderComment(newSrc, tag, comment);

  if (!src.includes(header)) {
    // Ensure the old generated contents are removed.
    const sanitizedTarget = removeGeneratedContents(src, tag);
    const contentsToAdd = [
      // @something
      header,
      // contents
      newSrc,
      // @end
      `${comment} @generated end ${tag}`,
    ].join('\n');

    return {
      contents: sanitizedTarget ?? src + contentsToAdd,
      didMerge: true,
      didClear: !!sanitizedTarget,
    };
  }

  return { contents: src, didClear: false, didMerge: false };
};

export const addMapboxMavenRepo = (src: string): string =>
  appendContents({
    tag: 'react-native-mapbox-turn-by-turn-navigation',
    src,
    newSrc: gradleMaven,
    comment: '//',
  }).contents;

const withAndroidPropertiesDownloadToken: ConfigPlugin<MapboxPlugProps> = (
  config,
  { MapboxDownloadToken }
) => {
  const key = 'MAPBOX_DOWNLOADS_TOKEN';

  if (MapboxDownloadToken) {
    return withGradleProperties(config, (exportedConfig) => {
      exportedConfig.modResults = exportedConfig.modResults.filter(
        (item) => !(item.type === 'property' && item.key === key)
      );
      exportedConfig.modResults.push({
        type: 'property',
        key,
        value: MapboxDownloadToken,
      });

      return exportedConfig;
    });
  }

  return config;
};
const withAndroidProjectGradle: ConfigPlugin<MapboxPlugProps> = (config) =>
  withProjectBuildGradle(config, ({ modResults, ...exportedConfig }) => {
    if (modResults.language !== 'groovy') {
      WarningAggregator.addWarningAndroid(
        'withMapbox',
        `Cannot automatically configure app build.gradle if it's not groovy`
      );

      return { modResults, ...exportedConfig };
    }

    modResults.contents = addMapboxMavenRepo(modResults.contents);

    return { modResults, ...exportedConfig };
  });

const withMapboxAndroid: ConfigPlugin<MapboxPlugProps> = (
  config,
  { MapboxPublicToken, MapboxDownloadToken }
) => {
  config = withAndroidProjectGradle(config, { MapboxDownloadToken });
  config = withAndroidPropertiesDownloadToken(config, {
    MapboxDownloadToken,
  });
  config = copyMapboxAccessTokenXml(config, {
    MapboxPublicToken,
  });

  return config;
};

// const addSPMDependenciesToMainTarget = (
//   config: ExpoConfig,
//   options: {
//     version: string;
//     repositoryUrl: string;
//     repoName: string;
//     products: string[];
//   }
// ) => {
//   return withXcodeProject(config, (config) => {
//     const { version, repositoryUrl, repoName, products } = options;
//     const xcodeProject = config.modResults;
//
//     // Step 1: Add XCRemoteSwiftPackageReference
//     if (!xcodeProject.hash.project.objects['XCRemoteSwiftPackageReference']) {
//       xcodeProject.hash.project.objects['XCRemoteSwiftPackageReference'] = {};
//     }
//
//     const packageReferenceUUID = xcodeProject.generateUuid();
//     xcodeProject.hash.project.objects['XCRemoteSwiftPackageReference'][
//       `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`
//     ] = {
//       isa: 'XCRemoteSwiftPackageReference',
//       repositoryURL: repositoryUrl,
//       requirement: {
//         kind: 'upToNextMajorVersion',
//         minimumVersion: version,
//       },
//     };
//
//     // Step 2: Add XCSwiftPackageProductDependency for each product
//     if (!xcodeProject.hash.project.objects['XCSwiftPackageProductDependency']) {
//       xcodeProject.hash.project.objects['XCSwiftPackageProductDependency'] = {};
//     }
//
//     const productUUIDs: string[] = [];
//     products.forEach((productName) => {
//       const productUUID = xcodeProject.generateUuid();
//       productUUIDs.push(productUUID);
//       xcodeProject.hash.project.objects['XCSwiftPackageProductDependency'][
//         `${productUUID} /* ${productName} */`
//       ] = {
//         isa: 'XCSwiftPackageProductDependency',
//         package: `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`,
//         productName: productName,
//       };
//     });
//
//     // Step 3: Update PBXProject packageReferences
//     const projectId = Object.keys(
//       xcodeProject.hash.project.objects['PBXProject']
//     )[0];
//
//     if (!projectId) {
//       throw new Error('Could not find PBXProject');
//     }
//
//     const project = xcodeProject.hash.project.objects['PBXProject'][projectId];
//     if (!project.packageReferences) {
//       project.packageReferences = [];
//     }
//
//     project.packageReferences.push(
//       `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`
//     );
//
//     // Step 4: Add PBXBuildFile for each product
//     const buildFileUUIDs: string[] = [];
//     products.forEach((productName, index) => {
//       const buildFileUUID = xcodeProject.generateUuid();
//       buildFileUUIDs.push(buildFileUUID);
//       xcodeProject.hash.project.objects['PBXBuildFile'][
//         `${buildFileUUID} /* ${productName} in Frameworks */`
//       ] = {
//         isa: 'PBXBuildFile',
//         productRef: `${productUUIDs[index]} /* ${productName} */`,
//       };
//     });
//
//     // Step 5: Update PBXFrameworksBuildPhase
//     const frameworksBuildPhases =
//       xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'];
//     const buildPhaseId = Object.keys(frameworksBuildPhases)[0];
//
//     if (!buildPhaseId) {
//       throw new Error('Could not find PBXFrameworksBuildPhase');
//     }
//
//     const buildPhase = frameworksBuildPhases[buildPhaseId];
//     if (!buildPhase.files) {
//       buildPhase.files = [];
//     }
//
//     buildFileUUIDs.forEach((buildFileUUID, index) => {
//       buildPhase.files.push(
//         `${buildFileUUID} /* ${products[index]} in Frameworks */`
//       );
//     });
//
//     return config;
//   });
// };
const withMapboxIOS: ConfigPlugin<MapboxPlugProps> = (
  config,
  { MapboxPublicToken }
) => {
  config = withInfoPlist(config, (iosConfig) => {
    if (!MapboxPublicToken) {
      WarningAggregator.addWarningIOS(
        'withMapbox',
        'Mapbox Public Token is missing. Please provide MapboxPublicToken.'
      );
      return iosConfig;
    }
    if (iosConfig.modResults.MBXAccessToken) return iosConfig;

    iosConfig.modResults.MBXAccessToken = MapboxPublicToken;
    return iosConfig;
  });

  return config;
};

const withMapbox: ConfigPlugin<MapboxPlugProps> = (
  config,
  { MapboxPublicToken, MapboxDownloadToken }
) => {
  // Configure Android
  config = withMapboxAndroid(config, {
    MapboxPublicToken,
    MapboxDownloadToken,
  });

  // Configure iOS
  config = withMapboxIOS(config, {
    MapboxPublicToken,
  });

  return config;
};

export default createRunOncePlugin(withMapbox, pkg.name, pkg.version);

// TODO: export internal functions for testing purposes
export { addMapboxMavenRepo as _addMapboxMavenRepo };
