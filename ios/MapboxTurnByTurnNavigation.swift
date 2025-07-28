import MapboxCoreNavigation
import MapboxNavigation
import MapboxDirections
import UIKit
import NitroModules

public struct WaypointLegs {
  let index: Int
  let name: String
}

// MARK: - Extension to find the parent view controller
extension UIView {
  var parentViewController: UIViewController? {
    var parentResponder: UIResponder? = self
    while parentResponder != nil {
      parentResponder = parentResponder!.next
      if let viewController = parentResponder as? UIViewController {
        return viewController
      }
    }
    return nil
  }
}
// Your CustomUIView (no changes needed here for the fix)
class CustomUIView: UIView {
  private var implementation: HybridMapboxTurnByTurnNavigation!

  // Using `weak` here can help prevent a strong reference cycle
  // if `CustomUIView` is ever strongly retained by `HybridMapboxTurnByTurnNavigation`
  // and `implementation` also strongly retains `CustomUIView`.
  // However, given your current setup (view property), it's probably fine as strong.
  // Consider weak only if you notice retain cycles.
  init(with implementation: HybridMapboxTurnByTurnNavigation) {
    self.implementation = implementation
    super.init(frame: .zero)  // Call super's initializer
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  public override func removeFromSuperview() {
    super.removeFromSuperview()
    let impl = self.implementation
    impl?.navViewController?.removeFromParent()

    (impl != nil)
      ? NotificationCenter.default.removeObserver(
        impl!, name: .navigationSettingsDidChange, object: nil) : nil
  }
}

class HybridMapboxTurnByTurnNavigation: HybridMapboxTurnByTurnNavigationSpec,
  NavigationViewControllerDelegate
{

  var view: UIView = UIView()

  override init() {
    super.init()
    self.view = CustomUIView(with: self)
  }

  private var onLocationChange: ((LocationData) -> Void)? = nil
  private var onRouteProgressChange: ((RouteProgress) -> Void)? = nil
  private var onCancel: (() -> Void)? = nil
  private var onError: ((Message) -> Void)? = nil
  private var onWaypointArrival: ((WaypointEvent) -> Void)? = nil
  private var onArrival: ((Coordinate) -> Void)? = nil

  func addOnLocationChangeListener(listener: @escaping (LocationData) -> Void) throws -> () ->
    Void
  {
    onLocationChange = listener
    return { [weak self] in
      self?.onLocationChange = nil
    }
  }
  func addOnRouteProgressChangeListener(listener: @escaping (RouteProgress) -> Void) throws -> () ->
    Void
  {
    onRouteProgressChange = listener
    return { [weak self] in
      self?.onRouteProgressChange = nil
    }
  }
  func addOnCancelListener(listener: @escaping () -> Void) throws -> () -> Void {
    onCancel = listener
    return { [weak self] in
      self?.onCancel = nil
    }
  }
  func addOnErrorListener(listener: @escaping (Message) -> Void) throws -> () -> Void {
    onError = listener
    return { [weak self] in
      self?.onError = nil
    }
  }
  func addOnWaypointArrivalListener(listener: @escaping (WaypointEvent) -> Void) throws -> () ->
    Void
  {
    onWaypointArrival = listener
    return { [weak self] in
      self?.onWaypointArrival = nil
    }
  }

  func addOnArrivalListener(listener: @escaping (Coordinate) -> Void) throws -> () -> Void {
    onArrival = listener
    return { [weak self] in
      self?.onArrival = nil
    }
  }

  var origin: Coordinate = Coordinate(latitude: 0, longitude: 0)
  var destination: Coordinate = Coordinate(latitude: 0, longitude: 0)
  var destinationTitle: String?
  var language: String?
  var mute: Bool?
  var shouldSimulateRoute: Bool?
  var showsEndOfRouteFeedback: Bool?
  var showCancelButton: Bool?
  var hideStatusView: Bool?
  var distanceUnit: DistanceUnitEnum?
  var travelMode: TravelModeEnum?
  var waypoints: [Waypoint]?

  public weak var navViewController: NavigationViewController?

  var embedded: Bool = false
  var embedding: Bool = false

  public func dismissNavigationViewController() {
    self.navViewController?.dismiss(
      animated: true,
      completion: {
        self.navViewController?.removeFromParent()
        self.navViewController?.view.removeFromSuperview()
        self.navViewController = nil
      })
  }

  func afterUpdate() {
    if (embedding) {
      return
    }

    embed()
  }

  public func embed() {
    if (embedding) {
      return
    }
    embedding = true

    let originWaypoint = MapboxDirections.Waypoint(
      coordinate: CLLocationCoordinate2D(latitude: origin.latitude, longitude: origin.longitude))
    var waypointsArray = [originWaypoint]
    // transform waypoints to Mapbox Directions Waypoint
    for waypoint in waypoints ?? [] {

      let mapboxWaypoint = MapboxDirections.Waypoint(
        coordinate: CLLocationCoordinate2D(
          latitude: waypoint.latitude, longitude: waypoint.longitude), name: waypoint.name)
      waypointsArray.append(mapboxWaypoint)

    }
    let destinationWaypoint: MapboxDirections.Waypoint = MapboxDirections.Waypoint(
      coordinate: CLLocationCoordinate2D(
        latitude: destination.latitude, longitude: destination.longitude), name: destinationTitle)

    waypointsArray.append(destinationWaypoint)

    var profile: ProfileIdentifier = .automobile
    if travelMode != nil {
      switch travelMode! {
      case TravelModeEnum.cycling:
        profile = .cycling
      case TravelModeEnum.walking:
        profile = .walking
      case TravelModeEnum.drivingTraffic:
        profile = .automobileAvoidingTraffic
      default:
        profile = .automobile
      }
    }

    let options = NavigationRouteOptions(waypoints: waypointsArray, profileIdentifier: profile)
    let locale = self.language?.replacingOccurrences(of: "-", with: "_") ?? "en"
    options.locale = Locale(identifier: locale)
    options.distanceMeasurementSystem =
      distanceUnit?.stringValue == "imperial"
      ? MeasurementSystem.imperial : MeasurementSystem.metric
    Directions.shared.calculateRoutes(options: options) { [weak self] result in
      guard let strongSelf = self, let parentVC = strongSelf.view.parentViewController else {
        return
      }
      switch result {
      case .success(let response):
        let navigationOptions = NavigationOptions(
          simulationMode: strongSelf.shouldSimulateRoute ?? false ? .always : .never)
        strongSelf.dismissNavigationViewController()
        let vc = NavigationViewController(for: response, navigationOptions: navigationOptions)
        vc.showsEndOfRouteFeedback = strongSelf.showsEndOfRouteFeedback ?? true
        StatusView.appearance().isHidden = strongSelf.hideStatusView ?? false
        NavigationSettings.shared.voiceMuted = strongSelf.mute ?? false
        NavigationSettings.shared.distanceUnit =
          strongSelf.distanceUnit?.stringValue == "imperial" ? .mile : .kilometer
        vc.delegate = strongSelf
        parentVC.addChild(vc)
        strongSelf.view.addSubview(vc.view)
        vc.view.frame = strongSelf.view.bounds
        vc.didMove(toParent: parentVC)
        strongSelf.navViewController = vc

        strongSelf.embedded = true
        strongSelf.embedding = false
      case .failure(let error):
        strongSelf.onError?(Message(message: error.localizedDescription))
      }
    }
  }

  // MARK: - NavigationViewControllerDelegate
  public func navigationViewController(
    _ navigationViewController: NavigationViewController, didUpdate progress: RouteProgress,
    with location: CLLocation, rawLocation: CLLocation
  ) {
    let locationObject = LocationData(
      latitude: location.coordinate.latitude, longitude: location.coordinate.longitude,
      heading: location.course, accuracy: location.horizontalAccuracy.magnitude,
      timestamp: location.timestamp.timeIntervalSince1970)
    onLocationChange?(locationObject)
    let routeProgress = RouteProgress(
      distanceTraveled: progress.distanceTraveled,
      durationRemaining: progress.durationRemaining,
      fractionTraveled: progress.fractionTraveled,
      distanceRemaining: progress.distanceRemaining
    )

    onRouteProgressChange?(routeProgress)
  }

  public func navigationViewController(
    _ navigationViewController: NavigationViewController,
    didArriveAt waypoint: MapboxDirections.Waypoint
  ) -> Bool {

    if waypoint.coordinate.latitude == destination.latitude
      && waypoint.coordinate.longitude == destination.longitude
    {
      let waypointData = Coordinate(
        latitude: waypoint.coordinate.latitude, longitude: waypoint.coordinate.longitude)
      onArrival?(waypointData)
      return false
    } else {
      let waypointIndex =
        waypoints?.firstIndex(where: {
          $0.latitude == waypoint.coordinate.latitude
            && $0.longitude == waypoint.coordinate.longitude
        }) ?? -1
      if waypointIndex != -1 {
        let waypointData = WaypointEvent(
          name: waypoint.name,
          index: Double(waypointIndex),
          latitude: waypoint.coordinate.latitude,
          longitude: waypoint.coordinate.longitude,
        )
        onWaypointArrival?(waypointData)
      }
    }
    return true
  }

  func navigationViewControllerDidCancelNavigation(
    _ navigationViewController: NavigationViewController
  ) {
    navigationViewController.dismiss(animated: true, completion: nil)
  }
  public func navigationViewControllerDidDismiss(
    _ navigationViewController: NavigationViewController, byCanceling canceled: Bool
  ) {
    if (!canceled) { return }

    onCancel?()
    navigationViewController.dismiss(
      animated: true,
      completion: {
        self.dismissNavigationViewController()
      })
  }
}
