/**
 * Smart Land GIS - Spatial & Geometric Calculations
 */

/**
 * Calculate distance between two [lat, lng] coordinates in meters using Haversine formula
 */
export function calculateDistance(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate polygon perimeter in meters
 */
export function calculatePerimeter(coordinates) {
  if (!coordinates || coordinates.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    perimeter += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  // If not closed, close it
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    perimeter += calculateDistance(last, first);
  }
  return perimeter;
}

/**
 * Calculate geodesic polygon area in square meters using spherical excess formula
 */
export function calculatePolygonArea(coordinates) {
  if (!coordinates || coordinates.length < 3) return 0;
  
  // Close the ring if not closed
  const ring = [...coordinates];
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push(first);
  }

  const R = 6378137; // WGS84 major radius
  let area = 0;
  if (ring.length > 2) {
    for (let i = 0; i < ring.length - 1; i++) {
      const p1 = ring[i];
      const p2 = ring[i + 1];
      const rad = Math.PI / 180;
      area += (p2[1] - p1[1]) * rad * (2 + Math.sin(p1[0] * rad) + Math.sin(p2[0] * rad));
    }
    area = (area * R * R) / 2.0;
  }
  return Math.abs(area);
}

/**
 * Estimate length and width of a parcel bounding box
 */
export function estimatePlotDimensions(coordinates) {
  if (!coordinates || coordinates.length < 3) {
    return { length: 0, width: 0, area: 0, perimeter: 0 };
  }

  let lats = coordinates.map(c => c[0]);
  let lngs = coordinates.map(c => c[1]);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);

  // Measure north-south and east-west spans
  const heightMeters = calculateDistance([minLat, minLng], [maxLat, minLng]);
  const widthMeters = calculateDistance([minLat, minLng], [minLat, maxLng]);

  const length = Math.max(heightMeters, widthMeters);
  const width = Math.min(heightMeters, widthMeters);
  const area = calculatePolygonArea(coordinates);
  const perimeter = calculatePerimeter(coordinates);

  return {
    length: Math.round(length * 10) / 10,
    width: Math.round(width * 10) / 10,
    area: Math.round(area * 10) / 10,
    perimeter: Math.round(perimeter * 10) / 10
  };
}

/**
 * Calculate polygon centroid [lat, lng]
 */
export function getPolygonCentroid(coordinates) {
  if (!coordinates || coordinates.length === 0) return [0, 0];
  let sumLat = 0;
  let sumLng = 0;
  for (let c of coordinates) {
    sumLat += c[0];
    sumLng += c[1];
  }
  return [sumLat / coordinates.length, sumLng / coordinates.length];
}

/**
 * Find minimum distance from a point to a LineString (e.g. road or drain line)
 */
export function distanceToLineString(point, lineCoordinates) {
  if (!lineCoordinates || lineCoordinates.length === 0) return Infinity;
  let minDistance = Infinity;
  for (let i = 0; i < lineCoordinates.length - 1; i++) {
    const p1 = lineCoordinates[i];
    const p2 = lineCoordinates[i + 1];
    // Sample along segment for precision
    const samples = 5;
    for (let s = 0; s <= samples; s++) {
      const lat = p1[0] + (p2[0] - p1[0]) * (s / samples);
      const lng = p1[1] + (p2[1] - p1[1]) * (s / samples);
      const d = calculateDistance(point, [lat, lng]);
      if (d < minDistance) minDistance = d;
    }
  }
  return Math.round(minDistance * 10) / 10;
}

/**
 * Point-in-polygon ray-casting test
 */
export function isPointInPolygon(point, polygonCoordinates) {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygonCoordinates.length - 1; i < polygonCoordinates.length; j = i++) {
    const xi = polygonCoordinates[i][1], yi = polygonCoordinates[i][0];
    const xj = polygonCoordinates[j][1], yj = polygonCoordinates[j][0];
    const intersect = ((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Formats units for presentation
 */
export function formatArea(areaSqM) {
  if (typeof areaSqM !== 'number' || isNaN(areaSqM)) return "0 m²";
  const acres = (areaSqM / 4046.86).toFixed(2);
  const sqFt = Math.round(areaSqM * 10.7639).toLocaleString();
  return {
    sqMeters: `${Math.round(areaSqM).toLocaleString()} m²`,
    acres: `${acres} Acres`,
    sqFt: `${sqFt} sq.ft`
  };
}
