/**
 * Smart Land GIS - Interactive Leaflet Map View Component
 */
import { store } from "../store.js";
import { APP_CONFIG } from "../config.js";
import { formatArea, estimatePlotDimensions, calculateDistance } from "../spatial-utils.js";
import { toast } from "../components/Toast.js";
import { parseKmlText } from "../kml-parser.js";

export class MapView {
  constructor(containerId = "view-map") {
    this.container = document.getElementById(containerId);
    this.map = null;
    this.currentTileLayer = null;
    
    // Layer Groups
    this.plotLayerGroup = null;
    this.roadLayerGroup = null;
    this.drainageLayerGroup = null;
    this.electricPoleLayerGroup = null;
    this.lightPoleLayerGroup = null;
    this.floodRegionLayerGroup = null;
    this.kmlLayerGroup = null;

    // Interactive Drawing State
    this.isDrawing = false;
    this.drawPoints = [];
    this.tempDrawLayer = null;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe("view:change", (view) => {
      if (view === "map") {
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
            if (store.kmlFlightPlan && store.kmlFlightPlan.bounds) {
              this.fitKmlBounds();
            } else {
              this.fitActiveBounds();
            }
          } else {
            this.initMap();
            if (store.kmlFlightPlan && store.kmlFlightPlan.bounds) {
              this.fitKmlBounds();
            }
          }
        }, 150);
      }
    });

    store.subscribe("plots:change", () => this.refreshLayers());
    store.subscribe("dataset:change", () => {
      if (this.map) {
        const ds = store.getActiveDataset();
        this.map.setView(ds.center, ds.zoom);
        this.refreshLayers();
      }
    });

    store.subscribe("kml:change", () => this.refreshKmlLayer());

    store.subscribe("map:flyto", (plot) => {
      if (this.map && plot.coordinates && plot.coordinates.length > 0) {
        const bounds = L.latLngBounds(plot.coordinates);
        this.map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 17, duration: 1.2 });
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="map-view-wrapper">
        <!-- Floating Toolbar -->
        <div class="map-floating-toolbar">
          <button class="map-tool-btn" id="tool-draw-plot" title="Click vertices on map to register a new plot">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>
            Draw Plot
          </button>
          <div class="map-tool-divider"></div>
          <button class="map-tool-btn" id="tool-measure" title="Measure distance between points">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.3 15.3-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 5.3a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><line x1="14" y1="8" x2="16" y2="10"/><line x1="10" y1="12" x2="12" y2="14"/></svg>
            Measure
          </button>
          <button class="map-tool-btn" id="tool-fit-bounds" title="Fit map to all land plots">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            Fit Extent
          </button>
          <div class="map-tool-divider"></div>
          <button class="map-tool-btn" id="tool-upload-kml" title="Upload KML Flight Plan (.kml)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload KML
          </button>
          <button class="map-tool-btn" id="tool-load-sample-kml" title="Load flight Plan (1).kml sample" style="color: #0284c7; font-weight: 600;">
            Sample KML
          </button>
          <input type="file" id="kml-file-input" accept=".kml" style="display: none;">
          <div class="map-tool-divider"></div>
          <button class="map-tool-btn" id="tool-toggle-panel" title="Toggle Layer Controls">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            Layers
          </button>
        </div>

        <!-- KML Flight Plan Summary Card -->
        <div class="kml-summary-card" id="kml-summary-card" style="display: none;">
          <div class="kml-summary-header">
            <span class="kml-summary-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <span id="kml-file-name-label">KML File: flight Plan (1).kml</span>
            </span>
            <button class="modal-close-btn" id="btn-close-kml" title="Clear KML Flight Plan">&times;</button>
          </div>
          <div class="kml-summary-stats">
            <div class="kml-stat-item">
              <span class="kml-stat-num" id="kml-stat-points">0</span>
              <span class="kml-stat-label">Points</span>
            </div>
            <div class="kml-stat-item">
              <span class="kml-stat-num" id="kml-stat-lines">0</span>
              <span class="kml-stat-label">Lines</span>
            </div>
            <div class="kml-stat-item">
              <span class="kml-stat-num" id="kml-stat-areas">0</span>
              <span class="kml-stat-label">Areas</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 2px;">
            <button class="btn btn-secondary btn-sm" id="btn-fit-kml" style="padding: 3px 8px; font-size: 11px;">
              Fit Extent
            </button>
            <button class="btn btn-danger-outline btn-sm" id="btn-clear-kml" style="padding: 3px 8px; font-size: 11px;">
              Remove
            </button>
          </div>
        </div>

        <!-- Live Drawing Status Bar -->
        <div class="drawing-status-bar" id="drawing-status-bar">
          <span id="drawing-status-text">Click on map to place polygon vertices (at least 3 points)</span>
          <button class="btn btn-primary btn-sm" id="btn-finish-draw" style="padding: 3px 10px; font-size: 11.5px;">Finish & Save</button>
          <button class="btn btn-secondary btn-sm" id="btn-cancel-draw" style="padding: 3px 10px; font-size: 11.5px; background: rgba(255,255,255,0.2); color:#fff;">Cancel</button>
        </div>

        <!-- Floating Layer Control Panel -->
        <div class="map-layer-panel" id="map-layer-panel">
          <div class="layer-panel-header">
            <span class="layer-panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              GIS Spatial Layers
            </span>
            <button class="modal-close-btn" id="layer-panel-close-btn">&times;</button>
          </div>

          <div class="layer-panel-body">
            <!-- Basemap Selector -->
            <div>
              <div class="layer-group-title">Base Imagery</div>
              <div class="basemap-grid">
                <div class="basemap-option active" data-basemap="street">Street</div>
                <div class="basemap-option" data-basemap="satellite">Satellite</div>
                <div class="basemap-option" data-basemap="dark">Dark GIS</div>
                <div class="basemap-option" data-basemap="topo">Topography</div>
              </div>
            </div>

            <!-- Plot Styling Options -->
            <div>
              <div class="layer-group-title">Plot Parcel Display</div>
              <div class="layer-item">
                <div class="layer-item-header">
                  <div class="layer-item-left">
                    <span class="layer-item-color-pill" style="background: var(--color-plot);"></span>
                    Land Plots
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" id="layer-toggle-plots" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div style="margin-top: 4px; display: flex; align-items: center; justify-content: space-between; font-size: 11.5px;">
                  <span style="color: #64748b;">Color By:</span>
                  <select id="select-color-plots-by" class="filter-select" style="padding: 2px 6px; font-size: 11.5px;">
                    <option value="zoning">Zoning Category</option>
                    <option value="floodRisk">Flood Hazard</option>
                    <option value="status">Development Status</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 5 Infrastructure & Environmental Layers -->
            <div>
              <div class="layer-group-title">Infrastructure & Hazards</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- 1. Roads -->
                <div class="layer-item">
                  <div class="layer-item-header">
                    <div class="layer-item-left">
                      <span class="layer-item-color-pill" style="background: var(--color-road);"></span>
                      Road Network
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" id="layer-toggle-roads" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <!-- 2. Drainage -->
                <div class="layer-item">
                  <div class="layer-item-header">
                    <div class="layer-item-left">
                      <span class="layer-item-color-pill" style="background: var(--color-drainage);"></span>
                      Drainage & Culverts
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" id="layer-toggle-drainage" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <!-- 3. Electricity Poles -->
                <div class="layer-item">
                  <div class="layer-item-header">
                    <div class="layer-item-left">
                      <span class="layer-item-color-pill" style="background: var(--color-electric);"></span>
                      Electricity Poles (HT/LT)
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" id="layer-toggle-electric" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div style="padding-left: 20px; font-size: 11px; color: #64748b;">
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                      <input type="checkbox" id="toggle-electric-buffer" checked> Show 5m Safety Buffer
                    </label>
                  </div>
                </div>

                <!-- 4. Light Poles -->
                <div class="layer-item">
                  <div class="layer-item-header">
                    <div class="layer-item-left">
                      <span class="layer-item-color-pill" style="background: var(--color-light);"></span>
                      Street Light Poles
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" id="layer-toggle-light" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div style="padding-left: 20px; font-size: 11px; color: #64748b;">
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                      <input type="checkbox" id="toggle-light-radius" checked> Show Illumination Radii
                    </label>
                  </div>
                </div>

                <!-- 5. Flood Regions -->
                <div class="layer-item">
                  <div class="layer-item-header">
                    <div class="layer-item-left">
                      <span class="layer-item-color-pill" style="background: var(--color-flood-high);"></span>
                      Flood Hazard Regions
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" id="layer-toggle-flood" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <!-- 6. KML Flight Plan -->
                <div class="layer-item">
                  <div class="layer-item-header">
                    <div class="layer-item-left">
                      <span class="layer-item-color-pill" style="background: #0284c7;"></span>
                      KML Flight Plan
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" id="layer-toggle-kml" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Legend -->
        <div class="map-legend-card">
          <strong style="font-size: 11px; color: #64748b; text-transform: uppercase;">Legend</strong>
          <div class="legend-row">
            <span class="legend-swatch" style="background: #3b82f6; opacity: 0.8;"></span>
            <span>Land Plot Parcel</span>
          </div>
          <div class="legend-row">
            <span class="legend-swatch" style="background: #475569; height: 4px;"></span>
            <span>Roadway Centerline</span>
          </div>
          <div class="legend-row">
            <span class="legend-swatch" style="background: #0284c7; height: 3px; border-top: 1px dashed white;"></span>
            <span>Drainage Culvert</span>
          </div>
          <div class="legend-row">
            <span class="legend-swatch" style="background: #eab308; border-radius: 50%;"></span>
            <span>Power Pole (HT/LT)</span>
          </div>
          <div class="legend-row">
            <span class="legend-swatch" style="background: #f97316; border-radius: 50%;"></span>
            <span>Light Pole Luminaire</span>
          </div>
          <div class="legend-row">
            <span class="legend-swatch" style="background: #ef4444; opacity: 0.4;"></span>
            <span>Zone A Flood Hazard</span>
          </div>
          <div class="legend-row">
            <span class="legend-swatch" style="background: #0284c7; border-radius: 50%;"></span>
            <span>KML Waypoints & Grid</span>
          </div>
        </div>

        <!-- Map Container -->
        <div id="map"></div>
      </div>
    `;
  }

  initMap() {
    if (this.map) return;
    const ds = store.getActiveDataset();

    this.map = L.map("map", {
      center: ds.center,
      zoom: ds.zoom,
      zoomControl: false
    });

    L.control.zoom({ position: "bottomright" }).addTo(this.map);

    // Initial Basemap
    this.setBasemap("street");

    // Initialize Layer Groups
    this.plotLayerGroup = L.layerGroup().addTo(this.map);
    this.roadLayerGroup = L.layerGroup().addTo(this.map);
    this.drainageLayerGroup = L.layerGroup().addTo(this.map);
    this.electricPoleLayerGroup = L.layerGroup().addTo(this.map);
    this.lightPoleLayerGroup = L.layerGroup().addTo(this.map);
    this.floodRegionLayerGroup = L.layerGroup().addTo(this.map);
    this.kmlLayerGroup = L.layerGroup().addTo(this.map);
    this.tempDrawLayer = L.layerGroup().addTo(this.map);

    this.refreshLayers();
    if (store.kmlFlightPlan && store.kmlFlightPlan.bounds) {
      setTimeout(() => this.fitKmlBounds(), 100);
    }

    // Map Click Handler for Drawing or Measuring
    this.map.on("click", (e) => this.handleMapClick(e));
  }

  setBasemap(type) {
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    const config = APP_CONFIG.basemaps[type] || APP_CONFIG.basemaps.street;
    this.currentTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom
    }).addTo(this.map);

    store.activeBasemap = type;
  }

  refreshLayers() {
    if (!this.map) return;
    const dataset = store.getActiveDataset();

    // 1. PLOTS LAYER
    this.plotLayerGroup.clearLayers();
    if (store.layerVisibility.plots) {
      dataset.plots.forEach(plot => {
        let fillColor = "#3b82f6";
        if (store.colorPlotsBy === "zoning") {
          fillColor = APP_CONFIG.zoningColors[plot.zone]?.color || "#3b82f6";
        } else if (store.colorPlotsBy === "floodRisk") {
          const fr = plot.floodRegion?.zoneCategory;
          fillColor = fr === "High Risk" ? "#ef4444" : fr === "Moderate Risk" ? "#f59e0b" : "#10b981";
        } else if (store.colorPlotsBy === "status") {
          fillColor = plot.status === "Available" ? "#10b981" : plot.status === "Allocated" ? "#3b82f6" : "#f59e0b";
        }

        const polygon = L.polygon(plot.coordinates, {
          color: fillColor,
          weight: 2,
          fillColor: fillColor,
          fillOpacity: store.layerOpacity.plots
        });

        const areaFmt = formatArea(plot.area);

        // Tooltip
        polygon.bindTooltip(`
          <strong>${plot.plotNumber}</strong><br>
          ${plot.zone} &bull; ${areaFmt.acres}<br>
          ${plot.length}m &times; ${plot.width}m
        `, { sticky: true });

        // Popup Content
        polygon.bindPopup(`
          <div class="gis-popup">
            <div class="gis-popup-header" style="background: ${fillColor};">
              <span class="gis-popup-title">${plot.plotNumber}</span>
              <span class="badge" style="background: rgba(255,255,255,0.25); color: #fff;">${plot.zone}</span>
            </div>
            <div class="gis-popup-body">
              <div class="gis-popup-row">
                <span class="gis-popup-row-label">Dimensions:</span>
                <span class="gis-popup-row-val">${plot.length}m &times; ${plot.width}m</span>
              </div>
              <div class="gis-popup-row">
                <span class="gis-popup-row-label">Area:</span>
                <span class="gis-popup-row-val">${areaFmt.sqMeters} (${areaFmt.acres})</span>
              </div>
              <div class="gis-popup-row">
                <span class="gis-popup-row-label">Road Frontage:</span>
                <span class="gis-popup-row-val">${plot.roadAccess?.roadName || 'N/A'}</span>
              </div>
              <div class="gis-popup-row">
                <span class="gis-popup-row-label">Flood Zone:</span>
                <span class="gis-popup-row-val" style="color: ${plot.floodRegion?.zoneCategory === 'High Risk' ? '#ef4444' : '#10b981'};">
                  ${plot.floodRegion?.zoneCode || 'Zone C'} (${plot.floodRegion?.zoneCategory || 'Safe'})
                </span>
              </div>
            </div>
            <div class="gis-popup-footer">
              <button class="btn btn-primary btn-sm" onclick="window.SmartLandApp.selectPlot('${plot.id}')">
                Inspect Full Specs
              </button>
            </div>
          </div>
        `);

        polygon.on("click", () => {
          store.selectPlot(plot.id);
        });

        this.plotLayerGroup.addLayer(polygon);
      });
    }

    // 2. ROADS LAYER
    this.roadLayerGroup.clearLayers();
    if (store.layerVisibility.roads) {
      dataset.roads.forEach(road => {
        const polyline = L.polyline(road.coordinates, {
          color: "#334155",
          weight: Math.min(Math.max(road.widthMeters / 4, 4), 10),
          opacity: store.layerOpacity.roads,
          lineCap: "round"
        });

        polyline.bindTooltip(`
          <strong>${road.name}</strong><br>
          ${road.type} &bull; ${road.widthMeters}m width
        `, { sticky: true });

        this.roadLayerGroup.addLayer(polyline);
      });
    }

    // 3. DRAINAGE LAYER
    this.drainageLayerGroup.clearLayers();
    if (store.layerVisibility.drainage) {
      dataset.drainage.forEach(drain => {
        const polyline = L.polyline(drain.coordinates, {
          color: "#0284c7",
          weight: 4,
          dashArray: "6, 6",
          opacity: store.layerOpacity.drainage
        });

        polyline.bindTooltip(`
          <strong>${drain.name || drain.id}</strong><br>
          ${drain.type} &bull; ${drain.flowDirection || 'Storm Outflow'}
        `, { sticky: true });

        this.drainageLayerGroup.addLayer(polyline);
      });
    }

    // 4. ELECTRICITY POLES LAYER
    this.electricPoleLayerGroup.clearLayers();
    if (store.layerVisibility.electricPoles) {
      dataset.electricityPoles.forEach(pole => {
        const icon = L.divIcon({
          className: "custom-pole-icon pole-electric",
          html: `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker(pole.coordinates, { icon });
        marker.bindTooltip(`<strong>${pole.id}</strong> &bull; ${pole.voltage}<br>${pole.type}`);
        this.electricPoleLayerGroup.addLayer(marker);

        // Safe clearance buffer circle
        if (store.layerVisibility.electricBuffer) {
          const circle = L.circle(pole.coordinates, {
            radius: pole.safeClearanceRadius || APP_CONFIG.thresholds.electricSafetyClearance,
            color: "#eab308",
            fillColor: "#eab308",
            fillOpacity: 0.15,
            weight: 1,
            dashArray: "3, 3"
          });
          this.electricPoleLayerGroup.addLayer(circle);
        }
      });
    }

    // 5. LIGHT POLES LAYER
    this.lightPoleLayerGroup.clearLayers();
    if (store.layerVisibility.lightPoles) {
      dataset.lightPoles.forEach(light => {
        const icon = L.divIcon({
          className: "custom-pole-icon pole-light",
          html: `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
            </svg>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker(light.coordinates, { icon });
        marker.bindTooltip(`<strong>${light.id}</strong> &bull; ${light.type} (${light.wattage})<br>Status: ${light.status}`);
        this.lightPoleLayerGroup.addLayer(marker);

        // Night illumination coverage throw radius
        if (store.layerVisibility.lightRadius) {
          const circle = L.circle(light.coordinates, {
            radius: light.illuminationRadius || APP_CONFIG.thresholds.lightIlluminationRadius,
            color: "#f97316",
            fillColor: "#fef08a",
            fillOpacity: 0.2,
            weight: 1
          });
          this.lightPoleLayerGroup.addLayer(circle);
        }
      });
    }

    // 6. FLOOD REGIONS LAYER
    this.floodRegionLayerGroup.clearLayers();
    if (store.layerVisibility.floodRegions) {
      dataset.floodRegions.forEach(flood => {
        const polygon = L.polygon(flood.coordinates, {
          color: flood.color || "#ef4444",
          fillColor: flood.color || "#ef4444",
          fillOpacity: store.layerOpacity.floodRegions,
          weight: 2,
          dashArray: "4, 4"
        });

        polygon.bindTooltip(`
          <strong>${flood.name}</strong><br>
          <span style="color: ${flood.color};">${flood.code} &bull; ${flood.riskLevel}</span><br>
          ${flood.description}
        `, { sticky: true });

        this.floodRegionLayerGroup.addLayer(polygon);
      });
    }

    // 7. KML FLIGHT PLAN LAYER
    this.refreshKmlLayer();
  }

  refreshKmlLayer() {
    if (!this.map || !this.kmlLayerGroup) return;
    this.kmlLayerGroup.clearLayers();

    const kmlData = store.kmlFlightPlan;
    const summaryCard = this.container.querySelector("#kml-summary-card");

    if (!kmlData) {
      if (summaryCard) summaryCard.style.display = "none";
      return;
    }

    if (summaryCard) {
      summaryCard.style.display = "flex";
      const nameEl = this.container.querySelector("#kml-file-name-label");
      const ptEl = this.container.querySelector("#kml-stat-points");
      const lnEl = this.container.querySelector("#kml-stat-lines");
      const arEl = this.container.querySelector("#kml-stat-areas");

      if (nameEl) nameEl.textContent = `KML File: ${kmlData.fileName || 'flight Plan.kml'}`;
      if (ptEl) ptEl.textContent = kmlData.counts.points;
      if (lnEl) lnEl.textContent = kmlData.counts.lines;
      if (arEl) arEl.textContent = kmlData.counts.areas;
    }

    if (!store.layerVisibility.kmlFlightPlan) {
      return;
    }

    // A. Render Area/Polygon boundary
    (kmlData.areas || []).forEach(area => {
      const polyColor = area.style?.poly?.color || "#0284c7";
      const poly = L.polygon(area.coordinates, {
        color: polyColor,
        weight: 2.5,
        fillColor: polyColor,
        fillOpacity: area.style?.poly?.fill ? 0.16 : 0.05,
        dashArray: "5, 5"
      });
      poly.bindTooltip(`<strong>Flight Plan Area Boundary</strong><br>${area.coordinates.length} vertices`, { sticky: true });
      this.kmlLayerGroup.addLayer(poly);
    });

    // B. Render LineString features (Flight Grid / Tracks)
    (kmlData.lines || []).forEach(line => {
      const lineColor = line.style?.line?.color || "#0284c7";
      const lineWeight = line.style?.line?.width ? Math.max(line.style.line.width, 2.5) : 2.5;
      const polyline = L.polyline(line.coordinates, {
        color: lineColor,
        weight: lineWeight,
        opacity: 0.92
      });
      polyline.bindTooltip(`<strong>${line.name || 'Flight Grid Line'}</strong>`, { sticky: true });
      this.kmlLayerGroup.addLayer(polyline);
    });

    // C. Render Point & Label features (Numbered 1-29)
    (kmlData.points || []).forEach(pt => {
      const icon = L.divIcon({
        className: "kml-point-badge",
        html: `<span>${pt.name}</span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(pt.latLng, { icon });
      marker.bindTooltip(`
        <strong>Waypoint #${pt.name}</strong><br>
        Latitude: ${pt.latLng[0].toFixed(6)}<br>
        Longitude: ${pt.latLng[1].toFixed(6)}
        ${pt.altitude ? '<br>Altitude: ' + pt.altitude + 'm' : ''}
      `);
      this.kmlLayerGroup.addLayer(marker);
    });
  }

  fitKmlBounds() {
    if (!this.map || !store.kmlFlightPlan || !store.kmlFlightPlan.bounds) return;
    this.map.fitBounds(store.kmlFlightPlan.bounds, { padding: [50, 50], maxZoom: 16 });
  }

  handleKmlFileUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const kmlText = e.target.result;
        const parsed = parseKmlText(kmlText, file.name);
        store.setKmlFlightPlan(parsed);
        toast.success(`KML loaded: ${parsed.counts.points} points, ${parsed.counts.lines} lines, ${parsed.counts.areas} area boundary.`);
        this.fitKmlBounds();
      } catch (err) {
        toast.error("Failed to parse KML file: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  async loadSampleKml() {
    try {
      const res = await fetch("assets/kml/flight Plan (1).kml");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseKmlText(text, "flight Plan (1).kml");
      store.setKmlFlightPlan(parsed);
      toast.success(`Loaded flight Plan (1).kml: ${parsed.counts.points} points, ${parsed.counts.lines} lines, ${parsed.counts.areas} area.`);
      this.fitKmlBounds();
    } catch (e) {
      toast.error("Unable to load sample KML: " + e.message);
    }
  }

  fitActiveBounds() {
    if (!this.map) return;
    const plots = store.getPlots();
    if (plots.length === 0) return;

    const allCoords = [];
    plots.forEach(p => (p.coordinates || []).forEach(c => allCoords.push(c)));
    if (allCoords.length > 0) {
      this.map.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50] });
    }
  }

  // Interactive Drawing Handlers
  startDrawing() {
    this.isDrawing = true;
    this.drawPoints = [];
    this.tempDrawLayer.clearLayers();

    const bar = this.container.querySelector("#drawing-status-bar");
    const drawBtn = this.container.querySelector("#tool-draw-plot");
    bar.classList.add("active");
    drawBtn.classList.add("active");

    toast.info("Click points on the map to define parcel boundary. Place at least 3 points.");
  }

  cancelDrawing() {
    this.isDrawing = false;
    this.drawPoints = [];
    this.tempDrawLayer.clearLayers();

    const bar = this.container.querySelector("#drawing-status-bar");
    const drawBtn = this.container.querySelector("#tool-draw-plot");
    bar.classList.remove("active");
    drawBtn.classList.remove("active");
  }

  finishDrawing() {
    if (this.drawPoints.length < 3) {
      toast.warning("A polygon requires at least 3 corner points.");
      return;
    }

    const coords = [...this.drawPoints];
    this.cancelDrawing();

    // Trigger Add Plot modal pre-filled with drawn geometry!
    store.emit("plot:draw:complete", coords);
  }

  handleMapClick(e) {
    if (!this.isDrawing) return;

    const latLng = [e.latlng.lat, e.latlng.lng];
    this.drawPoints.push(latLng);

    this.tempDrawLayer.clearLayers();

    // Draw vertices markers
    this.drawPoints.forEach((pt, i) => {
      L.circleMarker(pt, {
        radius: 5,
        color: "#2563eb",
        fillColor: "#ffffff",
        fillOpacity: 1,
        weight: 2
      }).addTo(this.tempDrawLayer);
    });

    if (this.drawPoints.length >= 2) {
      L.polyline(this.drawPoints, {
        color: "#2563eb",
        weight: 2,
        dashArray: "4, 4"
      }).addTo(this.tempDrawLayer);
    }

    if (this.drawPoints.length >= 3) {
      L.polygon(this.drawPoints, {
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.2,
        weight: 1
      }).addTo(this.tempDrawLayer);

      const dims = estimatePlotDimensions(this.drawPoints);
      const text = this.container.querySelector("#drawing-status-text");
      text.textContent = `${this.drawPoints.length} points placed &bull; Approx: ${dims.length}m x ${dims.width}m (${dims.area} m²)`;
    }
  }

  bindEvents() {
    // Toolbar buttons
    const drawBtn = this.container.querySelector("#tool-draw-plot");
    const fitBtn = this.container.querySelector("#tool-fit-bounds");
    const togglePanelBtn = this.container.querySelector("#tool-toggle-panel");
    const closePanelBtn = this.container.querySelector("#layer-panel-close-btn");
    const panel = this.container.querySelector("#map-layer-panel");
    const finishDrawBtn = this.container.querySelector("#btn-finish-draw");
    const cancelDrawBtn = this.container.querySelector("#btn-cancel-draw");

    drawBtn.addEventListener("click", () => {
      if (this.isDrawing) this.cancelDrawing();
      else this.startDrawing();
    });

    fitBtn.addEventListener("click", () => this.fitActiveBounds());

    togglePanelBtn.addEventListener("click", () => {
      panel.classList.toggle("collapsed");
    });

    closePanelBtn.addEventListener("click", () => {
      panel.classList.add("collapsed");
    });

    finishDrawBtn.addEventListener("click", () => this.finishDrawing());
    cancelDrawBtn.addEventListener("click", () => this.cancelDrawing());

    // Basemap Switcher
    this.container.querySelectorAll(".basemap-option").forEach(opt => {
      opt.addEventListener("click", () => {
        this.container.querySelectorAll(".basemap-option").forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
        this.setBasemap(opt.dataset.basemap);
      });
    });

    // Layer Visibility Toggles
    const togglePlots = this.container.querySelector("#layer-toggle-plots");
    const toggleRoads = this.container.querySelector("#layer-toggle-roads");
    const toggleDrain = this.container.querySelector("#layer-toggle-drainage");
    const toggleElectric = this.container.querySelector("#layer-toggle-electric");
    const toggleLight = this.container.querySelector("#layer-toggle-light");
    const toggleFlood = this.container.querySelector("#layer-toggle-flood");
    const toggleElecBuffer = this.container.querySelector("#toggle-electric-buffer");
    const toggleLightRadius = this.container.querySelector("#toggle-light-radius");
    const selectColorPlots = this.container.querySelector("#select-color-plots-by");

    togglePlots.addEventListener("change", (e) => {
      store.layerVisibility.plots = e.target.checked;
      this.refreshLayers();
    });

    toggleRoads.addEventListener("change", (e) => {
      store.layerVisibility.roads = e.target.checked;
      this.refreshLayers();
    });

    toggleDrain.addEventListener("change", (e) => {
      store.layerVisibility.drainage = e.target.checked;
      this.refreshLayers();
    });

    toggleElectric.addEventListener("change", (e) => {
      store.layerVisibility.electricPoles = e.target.checked;
      this.refreshLayers();
    });

    toggleLight.addEventListener("change", (e) => {
      store.layerVisibility.lightPoles = e.target.checked;
      this.refreshLayers();
    });

    toggleFlood.addEventListener("change", (e) => {
      store.layerVisibility.floodRegions = e.target.checked;
      this.refreshLayers();
    });

    toggleElecBuffer.addEventListener("change", (e) => {
      store.layerVisibility.electricBuffer = e.target.checked;
      this.refreshLayers();
    });

    toggleLightRadius.addEventListener("change", (e) => {
      store.layerVisibility.lightRadius = e.target.checked;
      this.refreshLayers();
    });

    selectColorPlots.addEventListener("change", (e) => {
      store.colorPlotsBy = e.target.value;
      this.refreshLayers();
    });

    // KML Events
    const uploadKmlBtn = this.container.querySelector("#tool-upload-kml");
    const sampleKmlBtn = this.container.querySelector("#tool-load-sample-kml");
    const kmlFileInput = this.container.querySelector("#kml-file-input");
    const fitKmlBtn = this.container.querySelector("#btn-fit-kml");
    const clearKmlBtn = this.container.querySelector("#btn-clear-kml");
    const closeKmlBtn = this.container.querySelector("#btn-close-kml");
    const toggleKml = this.container.querySelector("#layer-toggle-kml");

    if (uploadKmlBtn && kmlFileInput) {
      uploadKmlBtn.addEventListener("click", () => kmlFileInput.click());
      kmlFileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleKmlFileUpload(e.target.files[0]);
          e.target.value = ""; // reset for re-upload
        }
      });
    }

    if (sampleKmlBtn) {
      sampleKmlBtn.addEventListener("click", () => this.loadSampleKml());
    }

    if (fitKmlBtn) {
      fitKmlBtn.addEventListener("click", () => this.fitKmlBounds());
    }

    if (clearKmlBtn) {
      clearKmlBtn.addEventListener("click", () => store.clearKmlFlightPlan());
    }

    if (closeKmlBtn) {
      closeKmlBtn.addEventListener("click", () => store.clearKmlFlightPlan());
    }

    if (toggleKml) {
      toggleKml.addEventListener("change", (e) => {
        store.layerVisibility.kmlFlightPlan = e.target.checked;
        this.refreshKmlLayer();
      });
    }
  }
}
