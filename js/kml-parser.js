/**
 * Smart Land GIS - Dynamic KML Flight Plan Parser
 * 
 * Supports Point features, Label features, LineString features, Polygon/Area features,
 * and KML styling (LineStyle, PolyStyle, LabelStyle).
 * Converts KML coordinates (longitude, latitude, altitude) to Leaflet [latitude, longitude].
 */

/**
 * Convert KML color format (AABBGGRR) to standard CSS hex (#RRGGBB) and opacity (0-1)
 */
export function parseKmlColor(kmlColor) {
  if (!kmlColor || kmlColor.trim().length < 8) {
    return { hex: "#2563eb", opacity: 0.9 };
  }
  const clean = kmlColor.trim();
  const aa = parseInt(clean.substr(0, 2), 16) / 255;
  const bb = clean.substr(2, 2);
  const gg = clean.substr(4, 2);
  const rr = clean.substr(6, 2);
  const hex = `#${rr}${gg}${bb}`;
  const opacity = Math.round(aa * 100) / 100;
  return { hex, opacity: isNaN(opacity) ? 0.9 : opacity };
}

/**
 * Helper to find element by local name regardless of namespace or casing
 */
function findTag(parent, tagName) {
  if (!parent) return null;
  const byTag = parent.getElementsByTagName(tagName);
  if (byTag && byTag.length > 0) return byTag[0];
  const byTagNS = parent.getElementsByTagNameNS("*", tagName);
  if (byTagNS && byTagNS.length > 0) return byTagNS[0];
  try {
    return parent.querySelector(tagName);
  } catch (e) {
    return null;
  }
}

/**
 * Helper to find all elements by local name
 */
function findAllTags(parent, tagName) {
  if (!parent) return [];
  const list = parent.getElementsByTagName(tagName);
  if (list && list.length > 0) return Array.from(list);
  const listNS = parent.getElementsByTagNameNS("*", tagName);
  if (listNS && listNS.length > 0) return Array.from(listNS);
  try {
    return Array.from(parent.querySelectorAll(tagName));
  } catch (e) {
    return [];
  }
}

/**
 * Parse a single coordinates string "lon,lat,alt lon,lat,alt ..." into Leaflet [[lat, lon], ...]
 */
export function parseKmlCoordinates(coordStr) {
  if (!coordStr) return [];
  const points = [];
  const tokens = coordStr.trim().split(/\s+/);

  for (let token of tokens) {
    const parts = token.split(",");
    if (parts.length >= 2) {
      const lon = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      const alt = parts[2] ? parseFloat(parts[2]) : 0;
      if (!isNaN(lat) && !isNaN(lon)) {
        // Leaflet expects [latitude, longitude]
        points.push({
          latLng: [lat, lon],
          altitude: alt
        });
      }
    }
  }
  return points;
}

/**
 * Main KML Parser function using browser DOMParser
 * @param {string} kmlText - Raw KML XML string
 * @param {string} fileName - Name of the uploaded file
 * @returns {object} Parsed flight plan object
 */
export function parseKmlText(kmlText, fileName = "flight Plan (1).kml") {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlText, "text/xml");

  // Check for parse errors
  const parseError = findTag(xmlDoc, "parsererror");
  if (parseError) {
    throw new Error("Invalid KML XML structure: " + parseError.textContent);
  }

  // 1. Extract Styles
  const styles = {};
  const styleElements = findAllTags(xmlDoc, "Style");
  styleElements.forEach(styleEl => {
    const id = styleEl.getAttribute("id");
    if (!id) return;

    const styleObj = {};

    // LineStyle
    const lineStyle = findTag(styleEl, "LineStyle");
    if (lineStyle) {
      const colorEl = findTag(lineStyle, "color");
      const widthEl = findTag(lineStyle, "width");
      const { hex, opacity } = parseKmlColor(colorEl ? colorEl.textContent.trim() : "");
      styleObj.line = {
        color: hex,
        opacity: opacity || 0.85,
        width: widthEl ? parseFloat(widthEl.textContent) : 2
      };
    }

    // PolyStyle
    const polyStyle = findTag(styleEl, "PolyStyle");
    if (polyStyle) {
      const colorEl = findTag(polyStyle, "color");
      const fillEl = findTag(polyStyle, "fill");
      const outlineEl = findTag(polyStyle, "outline");
      const { hex, opacity } = parseKmlColor(colorEl ? colorEl.textContent.trim() : "");
      styleObj.poly = {
        color: hex,
        opacity: opacity || 0.35,
        fill: fillEl ? fillEl.textContent.trim() !== "0" : true,
        outline: outlineEl ? outlineEl.textContent.trim() !== "0" : true
      };
    }

    // LabelStyle
    const labelStyle = findTag(styleEl, "LabelStyle");
    if (labelStyle) {
      const colorEl = findTag(labelStyle, "color");
      const { hex } = parseKmlColor(colorEl ? colorEl.textContent.trim() : "");
      styleObj.label = { color: hex };
    }

    styles[id] = styleObj;
    styles[`#${id}`] = styleObj;
  });

  // Handle StyleMap
  const styleMaps = findAllTags(xmlDoc, "StyleMap");
  styleMaps.forEach(mapEl => {
    const id = mapEl.getAttribute("id");
    const pairs = findAllTags(mapEl, "Pair");
    const normalPair = pairs.find(p => {
      const k = findTag(p, "key");
      return k && k.textContent.trim() === "normal";
    });
    if (normalPair) {
      const styleUrl = findTag(normalPair, "styleUrl");
      if (styleUrl && styles[styleUrl.textContent.trim()]) {
        styles[id] = styles[styleUrl.textContent.trim()];
        styles[`#${id}`] = styles[styleUrl.textContent.trim()];
      }
    }
  });

  const points = [];
  const lines = [];
  const areas = [];

  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  const updateBounds = (lat, lng) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  };

  // 2. Extract Placemarks
  const placemarks = findAllTags(xmlDoc, "Placemark");
  placemarks.forEach((pm, index) => {
    const nameEl = findTag(pm, "name");
    const name = nameEl ? nameEl.textContent.trim() : "";
    const styleUrlEl = findTag(pm, "styleUrl");
    const styleUrl = styleUrlEl ? styleUrlEl.textContent.trim() : "";
    const style = styles[styleUrl] || {};

    // A. Check for Point
    const pointEl = findTag(pm, "Point");
    if (pointEl) {
      const coordEl = findTag(pointEl, "coordinates");
      if (coordEl) {
        const coords = parseKmlCoordinates(coordEl.textContent);
        if (coords.length > 0) {
          const pt = coords[0];
          updateBounds(pt.latLng[0], pt.latLng[1]);
          points.push({
            id: `kml-pt-${index + 1}`,
            name: name || `${points.length + 1}`,
            latLng: pt.latLng,
            altitude: pt.altitude,
            style
          });
        }
      }
    }

    // B. Check for LineString
    const lineEl = findTag(pm, "LineString");
    if (lineEl) {
      const coordEl = findTag(lineEl, "coordinates");
      if (coordEl) {
        const coords = parseKmlCoordinates(coordEl.textContent);
        if (coords.length >= 2) {
          coords.forEach(c => updateBounds(c.latLng[0], c.latLng[1]));
          lines.push({
            id: `kml-line-${lines.length + 1}`,
            name: name || `Line ${lines.length + 1}`,
            coordinates: coords.map(c => c.latLng),
            style
          });
        }
      }
    }

    // C. Check for Polygon
    const polyEl = findTag(pm, "Polygon");
    if (polyEl) {
      const coordEl = findTag(polyEl, "coordinates");
      if (coordEl) {
        const coords = parseKmlCoordinates(coordEl.textContent);
        if (coords.length >= 3) {
          coords.forEach(c => updateBounds(c.latLng[0], c.latLng[1]));
          areas.push({
            id: `kml-area-${areas.length + 1}`,
            name: name || `Flight Zone ${areas.length + 1}`,
            coordinates: coords.map(c => c.latLng),
            style
          });
        }
      }
    }
  });

  const hasBounds = minLat !== Infinity && maxLat !== -Infinity;
  const bounds = hasBounds ? [[minLat, minLng], [maxLat, maxLng]] : null;

  return {
    fileName,
    points,
    lines,
    areas,
    bounds,
    summary: {
      fileName,
      points: points.length,
      lines: lines.length,
      areas: areas.length
    },
    counts: {
      points: points.length,
      lines: lines.length,
      areas: areas.length
    }
  };
}
