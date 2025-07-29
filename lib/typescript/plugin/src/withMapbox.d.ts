import { ConfigPlugin } from 'expo/config-plugins';
export type MapboxPlugProps = {
    MapboxPublicToken?: string;
    MapboxDownloadToken?: string;
};
export declare const addMapboxMavenRepo: (src: string) => string;
declare const _default: ConfigPlugin<MapboxPlugProps>;
export default _default;
export { addMapboxMavenRepo as _addMapboxMavenRepo };
//# sourceMappingURL=withMapbox.d.ts.map