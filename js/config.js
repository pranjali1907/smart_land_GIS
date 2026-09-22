/**
 * Smart Land GIS - Configuration & Constants
 */

export const APP_CONFIG = {
  appName: "Smart Land GIS",
  appVersion: "1.0.0",
  subTitle: "Land Infrastructure & Parcel Portal",
  defaultCenter: [28.6139, 77.2090], // Default metropolitan coordinates
  defaultZoom: 15,
  storageKey: "smartland_store_v1",
  
  // Basemap Providers
  basemaps: {
    street: {
      name: "Street Map",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
      maxZoom: 19
    },
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      maxZoom: 19
    },
    dark: {
      name: "Dark GIS",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>",
      maxZoom: 19
    },
    topo: {
      name: "Topography",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "Map data: &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>, SRTM | Map style: &copy; <a href='https://opentopomap.org'>OpenTopoMap</a>",
      maxZoom: 17
    }
  },

  // Land Zoning Classes & Visuals
  zoningColors: {
    "Residential": { color: "#3b82f6", bg: "#eff6ff", label: "Residential" },
    "Commercial": { color: "#8b5cf6", bg: "#ede9fe", label: "Commercial" },
    "Industrial": { color: "#f97316", bg: "#fff7ed", label: "Industrial" },
    "Agricultural": { color: "#10b981", bg: "#d1fae5", label: "Agricultural" },
    "Mixed-Use": { color: "#06b6d4", bg: "#cffafe", label: "Mixed-Use" },
    "Public/Utility": { color: "#eab308", bg: "#fef9c3", label: "Public & Utilities" }
  },

  // Flood Hazard Classification
  floodRisks: {
    "High Risk": { color: "#ef4444", bg: "#fee2e2", code: "Zone A", desc: "100-Year Inundation Area" },
    "Moderate Risk": { color: "#f59e0b", bg: "#fef3c7", code: "Zone B", desc: "500-Year Buffer Zone" },
    "Low Risk": { color: "#10b981", bg: "#d1fae5", code: "Zone C", desc: "Minimal Flood Hazard Area" }
  },

  // Infrastructure Safety & Coverage Thresholds (meters)
  thresholds: {
    electricSafetyClearance: 5.0, // Minimum clearance from HT line
    lightIlluminationRadius: 35.0, // Light throw radius in meters
    roadAccessMaxDistance: 25.0, // Max distance to be considered direct road access
    drainageAdequateDistance: 40.0 // Max distance to drainage channel
  }
};
