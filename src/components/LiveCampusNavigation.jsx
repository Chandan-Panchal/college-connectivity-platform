import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import locations from "../data/campusLocation";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapAutoFit({ userLocation, destination, routeCoords }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords.length > 1) {
      map.fitBounds(routeCoords, { padding: [40, 40] });
      return;
    }

    if (userLocation && destination) {
      map.fitBounds(
        [userLocation, [destination.lat, destination.lng]],
        { padding: [40, 40] }
      );
      return;
    }

    if (userLocation) {
      map.setView(userLocation, 18, { animate: true });
    }
  }, [map, userLocation, destination, routeCoords]);

  return null;
}

export default function LiveCampusNavigation() {
  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState("");
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const watchIdRef = useRef(null);

  const campusCenter = [26.453611, 74.708333];

  const filteredBuildings = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return locations.filter((b) => b.name.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
        setError("");
      },
      (err) => {
        setError(err.message || "Location permission denied.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || !destination) {
        setRouteCoords([]);
        setRouteInfo(null);
        return;
      }

      setIsRouteLoading(true);
      setError("");

      try {
        const [userLat, userLng] = userLocation;

        let data = null;
        const profiles = ["walking", "driving"];

        for (const profile of profiles) {
          const url = `https://router.project-osrm.org/route/v1/${profile}/${userLng},${userLat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

          const res = await fetch(url);
          const json = await res.json();

          if (json.routes && json.routes.length > 0) {
            data = json;
            break;
          }
        }

        if (!data || !data.routes || !data.routes.length) {
          setRouteCoords([
            [userLat, userLng],
            [destination.lat, destination.lng],
          ]);
          setRouteInfo(null);
          setError("Road route not found, showing direct path.");
          return;
        }

        const route = data.routes[0];
        const polyline = route.geometry.coordinates.map(([lng, lat]) => [
          lat,
          lng,
        ]);

        setRouteCoords(polyline);
        setRouteInfo({
          distanceKm: (route.distance / 1000).toFixed(2),
          durationMin: Math.ceil(route.duration / 60),
        });
      } catch (err) {
        console.error("Route fetch error:", err);

        const [userLat, userLng] = userLocation;
        setRouteCoords([
          [userLat, userLng],
          [destination.lat, destination.lng],
        ]);
        setRouteInfo(null);
        setError("Unable to fetch road route, showing direct path.");
      } finally {
        setIsRouteLoading(false);
      }
    };

    fetchRoute();
  }, [userLocation, destination]);

  const mapCenter = userLocation || campusCenter;

  return (
    <div className="rounded-3xl bg-white p-5 shadow">
      <h2 className="mb-2 text-2xl font-bold text-slate-800">
        Live Campus Navigation
      </h2>

      <p className="mb-4 text-sm text-slate-600">
        Allow location access, search a building, and see the route from your
        live location.
      </p>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          type="text"
          placeholder="Search destination building..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);

            if (!value.trim()) {
              setDestination(null);
              setRouteCoords([]);
              setRouteInfo(null);
              setError("");
            }
          }}
          className="w-full rounded-xl border p-3 text-black"
        />

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setDestination(null);
            setRouteCoords([]);
            setRouteInfo(null);
            setError("");
          }}
          className="rounded-xl bg-slate-800 px-4 py-3 text-white"
        >
          Clear
        </button>
      </div>

      {search.trim() && filteredBuildings.length > 0 && (
        <div className="mb-4 max-h-56 overflow-y-auto rounded-xl border">
          {filteredBuildings.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setDestination(b);
                setSearch(b.name);
                setError("");
              }}
              className="block w-full border-b px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="font-semibold text-slate-900">{b.name}</div>
              {b.description && (
                <div className="text-sm text-slate-600">{b.description}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {search.trim() && filteredBuildings.length === 0 && (
        <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          No building found.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {destination && (
        <div className="mb-4 rounded-xl border bg-slate-50 p-4">
          <div className="font-semibold text-slate-900">
            Destination: {destination.name}
          </div>

          {destination.description && (
            <div className="mt-1 text-sm text-slate-600">
              {destination.description}
            </div>
          )}

          {isRouteLoading && (
            <div className="mt-2 text-sm text-blue-700">
              Fetching route...
            </div>
          )}

          {routeInfo && (
            <div className="mt-2 text-sm text-slate-700">
              Distance: {routeInfo.distanceKm} km | ETA: {routeInfo.durationMin} min
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border">
        <MapContainer
          center={mapCenter}
          zoom={18}
          style={{ height: "550px", width: "100%" }}
        >
          <MapAutoFit
            userLocation={userLocation}
            destination={destination}
            routeCoords={routeCoords}
          />

          <TileLayer
            attribution='&copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {locations.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <strong>{loc.name}</strong>
                {loc.description ? <div>{loc.description}</div> : null}
              </Popup>
            </Marker>
          ))}

          {userLocation && (
            <CircleMarker
              center={userLocation}
              radius={12}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>You are here</Popup>
            </CircleMarker>
          )}

          {destination && (
            <Marker position={[destination.lat, destination.lng]}>
              <Popup>Destination: {destination.name}</Popup>
            </Marker>
          )}

          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: "#2563eb",
                weight: 7,
                opacity: 0.95,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}