import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Waypoint extends Coordinate {
  name?: string;
  /**
   * Indicates whether the `onArrive` event is triggered when reaching the waypoint effectively.
   * @Default true
   */
  separatesLegs?: boolean;
}

export interface WaypointEvent extends Coordinate {
  /**
   * Name of Waypoint if provided or index of legs/waypoint
   * @available iOS
   **/
  name?: string;
  /**
   * Index of legs/waypoint
   * @available Android
   **/
  index?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  heading: number;
  accuracy: number;
  timestamp: number;
}

export interface RouteProgress {
  distanceTraveled: number;
  durationRemaining: number;
  fractionTraveled: number;
  distanceRemaining: number;
}

export interface Message {
  message?: string;
}

export enum TravelModeEnum {
  DRIVING = 'driving',
  WALKING = 'walking',
  CYCLING = 'cycling',
  DRIVING_TRAFFIC = 'driving-traffic',
}
export enum DistanceUnitEnum {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}
export type OnArrivalListener = (event: Coordinate) => void;
export type OnWaypointArrivalListener = (event: WaypointEvent) => void;
export type RouteProgressChangeListener = (event: RouteProgress) => void;
export type LocationChangeListener = (event: LocationData) => void;
export type OnErrorListener = (error: Message) => void;
export type OnCancelListener = () => void;

export interface MapboxTurnByTurnNavigationProps extends HybridViewProps {
  mute?: boolean;
  distanceUnit?: DistanceUnitEnum;
  origin: Coordinate;
  destinationTitle?: string;
  destination: Coordinate;
  language?: string;
  travelMode?: TravelModeEnum;
  shouldSimulateRoute?: boolean;
  waypoints?: Waypoint[];
  showsEndOfRouteFeedback?: boolean;
  showCancelButton?: boolean;
  hideStatusView?: boolean;
}

export interface MapboxTurnByTurnNavigationMethods extends HybridViewMethods {
  addOnWaypointArrivalListener(listener: OnWaypointArrivalListener): () => void;
  addOnArrivalListener(listener: OnArrivalListener): () => void;
  addOnLocationChangeListener(listener: LocationChangeListener): () => void;
  addOnRouteProgressChangeListener(
    listener: RouteProgressChangeListener
  ): () => void;
  addOnCancelListener(listener: OnCancelListener): () => void;
  addOnErrorListener(listener: OnErrorListener): () => void;
}

export type MapboxTurnByTurnNavigation = HybridView<
  MapboxTurnByTurnNavigationProps,
  MapboxTurnByTurnNavigationMethods
>;
