package com.margelo.nitro.mapboxturnbyturnnavigation

import android.view.View
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext
import com.mapbox.api.directions.v5.DirectionsCriteria
import com.mapbox.geojson.Point

@DoNotStrip
class HybridMapboxTurnByTurnNavigation(val context: ThemedReactContext) : HybridMapboxTurnByTurnNavigationSpec() {

  // View
  override val view: View = NavigationView(context, this)

  override var origin: Coordinate = Coordinate(0.0, 0.0)
    set(value) {
      field = value
      val originPoint = Point.fromLngLat(
        value.longitude,
        value.latitude
      )
      (view as NavigationView).setOrigin(originPoint)
    }
  override var destination: Coordinate = Coordinate(0.0, 0.0)
    set(value) {
      field = value
      val destinationPoint = Point.fromLngLat(
        value.longitude,
        value.latitude
      )
      (view as NavigationView).setDestination(destinationPoint)
    }
  override var mute: Boolean? = null
    set(value) {
      field = value
      (view as NavigationView).setMute(value ?: false)
    }
  override var distanceUnit: DistanceUnitEnum? = null
    set(value) {
      field = value
      (view as NavigationView).distanceUnit = value.toString()
    }
  override var destinationTitle: String? = null
    set(value) {
      field = value
      (view as NavigationView).setDestinationTitle(value ?: "")
    }
  override var language: String? = null
    set(value) {
      field = value
      (view as NavigationView).setLocal(value ?: "")
    }
  override var travelMode: TravelModeEnum? = null
    set(value) {
      field = value
      val travelMode = when (value.toString().lowercase()) {
        "walking" -> DirectionsCriteria.PROFILE_WALKING
        "cycling" -> DirectionsCriteria.PROFILE_CYCLING
        "driving" -> DirectionsCriteria.PROFILE_DRIVING
        "driving-traffic" -> DirectionsCriteria.PROFILE_DRIVING_TRAFFIC
        else -> DirectionsCriteria.PROFILE_DRIVING
      }
      (view as NavigationView).setTravelMode(travelMode)
    }
  override var shouldSimulateRoute: Boolean? = null
  override var waypoints: Array<Waypoint>? = null
    set(value) {
      field = value
      val waypointsList = value?.map { waypoint ->
        Point.fromLngLat(waypoint.longitude, waypoint.latitude)
      } ?: emptyList()
      val waypointLegsList: List<Waypoint> = value?.map { waypoint ->
        Waypoint(
          waypoint.name,
          waypoint.separatesLegs,
          waypoint.latitude,
          waypoint.longitude,
        )
      } ?: emptyList()
      (view as NavigationView).setWaypointLegs(waypointLegsList)
      view.setWaypoints(waypointsList)
    }
  override var showsEndOfRouteFeedback: Boolean? = null
  override var showCancelButton: Boolean? = null
  override var hideStatusView: Boolean? = null

  var onWaypointArrivalListener: ((WaypointEvent) -> Unit)? = null
  var onArrivalListener: ((Coordinate) -> Unit)? = null
  var onLocationChangeListener: ((LocationData) -> Unit)? = null
  var onRouteProgressChangeListener: ((RouteProgress) -> Unit)? = null
  var onCancelListener: (() -> Unit)? = null
  var onErrorListener: ((Message) -> Unit)? = null

  override fun addOnWaypointArrivalListener(listener: (WaypointEvent) -> Unit): () -> Unit {
    onWaypointArrivalListener = listener
    return {
      onWaypointArrivalListener = null
    }
  }

  override fun addOnArrivalListener(listener: (Coordinate) -> Unit): () -> Unit {
    onArrivalListener = listener
    return {
      onArrivalListener = null
    }
  }

  override fun addOnLocationChangeListener(listener: (LocationData) -> Unit): () -> Unit {
    onLocationChangeListener = listener
    return {
      onLocationChangeListener = null
    }
  }

  override fun addOnRouteProgressChangeListener(listener: (RouteProgress) -> Unit): () -> Unit {
    onRouteProgressChangeListener = listener
    return {
      onRouteProgressChangeListener = null
    }
  }

  override fun addOnCancelListener(listener: () -> Unit): () -> Unit {
    onCancelListener = listener
    return {
      onCancelListener = null
    }
  }

  override fun addOnErrorListener(listener: (Message) -> Unit): () -> Unit {
    onErrorListener = listener
    return {
      onErrorListener = null
    }
  }

  override fun afterUpdate() {
    super.afterUpdate()
    (view as NavigationView).initNavigation()
  }

}
