import { useEffect, useMemo } from "react";
import { useGeolocated } from "react-geolocated";
import { point } from "@turf/helpers";
import distance from "@turf/distance";
import { sortBy, memoize } from "lodash";
import allCinemas from "./cinemas";

const MAX_NEARBY_DISTANCE_KM = 100;
const MAX_RESULTS = 15;

// Precompute cinema points once
const cinemasWithPoints = allCinemas.map((cinema) => ({
  ...cinema,
  loc: point([cinema.lng, cinema.lat]),
}));

const computeCinemaDistance = memoize((lat, lng) => {
  const location = point([lng, lat]);

  return sortBy(
    cinemasWithPoints.map((cinema) => ({
      ...cinema,
      distance: distance(location, cinema.loc, {
        units: "kilometers",
      }),
    })),
    "distance"
  );
});

const useNearbyCinemas = () => {
  const { coords, getPosition, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated();

  useEffect(() => {
    if (!isGeolocationEnabled) {
      getPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cinemas = useMemo(() => {
    if (!coords) return [];

    return computeCinemaDistance(coords.latitude, coords.longitude)
      .filter((cinema) => cinema.distance <= MAX_NEARBY_DISTANCE_KM)
      .slice(0, MAX_RESULTS);
  }, [coords]);

  return {
    isGeolocationAvailable,
    isGeolocationEnabled,
    coords,
    cinemas,
  };
};

export default useNearbyCinemas;
