/**
 * Smart Land GIS - Plot Detail Drawer Inspector
 */
import { store } from "../store.js";
import { formatArea } from "../spatial-utils.js";
import { APP_CONFIG } from "../config.js";
import { toast } from "./Toast.js";

export class PlotDetailDrawer {
  constructor() {
    this.container = null;
    this.currentPlot = null;
    this.init();
  }

  init() {
    this.container = document.getElementById("plot-detail-drawer-root");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "plot-detail-drawer-root";
      document.body.appendChild(this.container);
    }
    this.render();
    this.bindEvents();

    store.subscribe("plot:select", (plot) => {
      if (plot) {
        this.open(plot);
      } else {
        this.close();
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="drawer-backdrop" id="drawer-backdrop"></div>
      <div class="drawer" id="plot-drawer">
        <div class="drawer-header">
          <div class="drawer-title-area">
            <span class="badge badge-primary" id="drawer-plot-id">PLT-000</span>
            <h2 class="drawer-title" id="drawer-plot-name">Plot Title</h2>
            <span style="font-size: 11.5px; color: #64748b;" id="drawer-survey-no">Survey: SY-000</span>
          </div>
          <button class="modal-close-btn" id="drawer-close-btn">&times;</button>
        </div>

        <div class="drawer-body">
          <!-- 1. Plot Size & Dimensions Card -->
          <div class="drawer-section-card">
            <div class="drawer-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/>
              </svg>
              1. Plot Size & Geometry
            </div>
            <div class="drawer-param-grid">
              <div class="drawer-param">
                <span class="drawer-param-label">Length</span>
                <span class="drawer-param-val" id="drawer-val-length">0 m</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Width</span>
                <span class="drawer-param-val" id="drawer-val-width">0 m</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Land Area (m²)</span>
                <span class="drawer-param-val" style="color: #2563eb;" id="drawer-val-area-sqm">0 m²</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Acres / Sq.Ft</span>
                <span class="drawer-param-val" id="drawer-val-area-acres">0 Acres</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Perimeter</span>
                <span class="drawer-param-val" id="drawer-val-perimeter">0 m</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Zoning Category</span>
                <span class="badge" id="drawer-val-zone">Residential</span>
              </div>
              <div class="drawer-param" style="grid-column: span 2;">
                <span class="drawer-param-label">Owner / Title Holder</span>
                <span class="drawer-param-val" id="drawer-val-owner" style="font-size: 12.5px;">-</span>
              </div>
            </div>
          </div>

          <!-- 2. Road Network Connection -->
          <div class="drawer-section-card">
            <div class="drawer-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2">
                <path d="M4 19 8 5m8 14 4-14M11 7h2m-2 5h2m-2 5h2"/>
              </svg>
              2. Road Connectivity
            </div>
            <div class="drawer-param-grid">
              <div class="drawer-param" style="grid-column: span 2;">
                <span class="drawer-param-label">Connecting Road</span>
                <span class="drawer-param-val" id="drawer-road-name">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Road Classification</span>
                <span class="drawer-param-val" id="drawer-road-type">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Frontage Distance</span>
                <span class="drawer-param-val" id="drawer-road-dist">-</span>
              </div>
              <div class="drawer-param" style="grid-column: span 2;">
                <span class="drawer-param-label">Access Status</span>
                <span class="badge" id="drawer-road-status">-</span>
              </div>
            </div>
          </div>

          <!-- 3. Drainage System -->
          <div class="drawer-section-card">
            <div class="drawer-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              3. Stormwater & Drainage
            </div>
            <div class="drawer-param-grid">
              <div class="drawer-param" style="grid-column: span 2;">
                <span class="drawer-param-label">Nearest Drainage Channel</span>
                <span class="drawer-param-val" id="drawer-drain-id">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Channel Type</span>
                <span class="drawer-param-val" id="drawer-drain-type">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Distance to Outfall</span>
                <span class="drawer-param-val" id="drawer-drain-dist">-</span>
              </div>
              <div class="drawer-param" style="grid-column: span 2;">
                <span class="drawer-param-label">Drainage Coverage</span>
                <span class="badge" id="drawer-drain-status">-</span>
              </div>
            </div>
          </div>

          <!-- 4. Electricity Pole -->
          <div class="drawer-section-card">
            <div class="drawer-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              4. Electricity Pole
            </div>
            <div class="drawer-param-grid">
              <div class="drawer-param">
                <span class="drawer-param-label">Nearest Pole ID</span>
                <span class="drawer-param-val" id="drawer-pole-id">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Grid Voltage</span>
                <span class="badge badge-warning" id="drawer-pole-volt">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Distance from Plot</span>
                <span class="drawer-param-val" id="drawer-pole-dist">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Safe Clearance</span>
                <span class="badge" id="drawer-pole-clearance">-</span>
              </div>
            </div>
          </div>

          <!-- 5. Light Pole -->
          <div class="drawer-section-card">
            <div class="drawer-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
              </svg>
              5. Light Pole
            </div>
            <div class="drawer-param-grid">
              <div class="drawer-param">
                <span class="drawer-param-label">Light Pole ID</span>
                <span class="drawer-param-val" id="drawer-light-id">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Luminaire Type</span>
                <span class="drawer-param-val" id="drawer-light-type" style="font-size: 12px;">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Distance to Pole</span>
                <span class="drawer-param-val" id="drawer-light-dist">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Night Illumination</span>
                <span class="badge" id="drawer-light-status">-</span>
              </div>
            </div>
          </div>

          <!-- 6. Flood Region Hazard Assessment -->
          <div class="drawer-section-card" id="drawer-flood-card">
            <div class="drawer-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              6. Flood Hazard Zone
            </div>
            <div class="drawer-param-grid">
              <div class="drawer-param">
                <span class="drawer-param-label">Flood Zone Code</span>
                <span class="drawer-param-val" id="drawer-flood-code">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Vulnerability Rating</span>
                <span class="badge" id="drawer-flood-rating">-</span>
              </div>
              <div class="drawer-param">
                <span class="drawer-param-label">Est. Inundation Depth</span>
                <span class="drawer-param-val" id="drawer-flood-depth">0.0 m</span>
              </div>
              <div class="drawer-param" style="grid-column: span 2;">
                <span class="drawer-param-label">Hydrological Advisory</span>
                <span style="font-size: 12px; color: #475569;" id="drawer-flood-advice">-</span>
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-footer">
          <button class="btn btn-danger-outline btn-sm" id="drawer-btn-trash">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
            Trash
          </button>
          <button class="btn btn-secondary btn-sm" id="drawer-btn-fly">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            Locate
          </button>
          <button class="btn btn-primary btn-sm" id="drawer-btn-edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Edit Plot
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const backdrop = this.container.querySelector("#drawer-backdrop");
    const closeBtn = this.container.querySelector("#drawer-close-btn");
    const trashBtn = this.container.querySelector("#drawer-btn-trash");
    const flyBtn = this.container.querySelector("#drawer-btn-fly");
    const editBtn = this.container.querySelector("#drawer-btn-edit");

    backdrop.addEventListener("click", () => store.selectPlot(null));
    closeBtn.addEventListener("click", () => store.selectPlot(null));

    trashBtn.addEventListener("click", () => {
      if (!this.currentPlot) return;
      const plotName = this.currentPlot.plotNumber;
      store.moveToTrash(this.currentPlot.id);
      toast.success(`${plotName} moved to Trash.`);
    });

    flyBtn.addEventListener("click", () => {
      if (!this.currentPlot) return;
      store.setView("map");
      store.emit("map:flyto", this.currentPlot);
    });

    editBtn.addEventListener("click", () => {
      if (!this.currentPlot) return;
      store.emit("plot:edit", this.currentPlot);
    });
  }

  open(plot) {
    this.currentPlot = plot;
    const drawer = this.container.querySelector("#plot-drawer");
    const backdrop = this.container.querySelector("#drawer-backdrop");

    // Populate metadata
    this.container.querySelector("#drawer-plot-id").textContent = plot.id;
    this.container.querySelector("#drawer-plot-name").textContent = plot.plotNumber;
    this.container.querySelector("#drawer-survey-no").textContent = `Survey: ${plot.surveyNumber || 'N/A'}`;

    // 1. Plot Dimensions
    const areaFmt = formatArea(plot.area);
    this.container.querySelector("#drawer-val-length").textContent = `${plot.length || 0} m`;
    this.container.querySelector("#drawer-val-width").textContent = `${plot.width || 0} m`;
    this.container.querySelector("#drawer-val-area-sqm").textContent = areaFmt.sqMeters;
    this.container.querySelector("#drawer-val-area-acres").textContent = `${areaFmt.acres} (${areaFmt.sqFt})`;
    this.container.querySelector("#drawer-val-perimeter").textContent = `${plot.perimeter || 0} m`;
    
    const zoneBadge = this.container.querySelector("#drawer-val-zone");
    zoneBadge.textContent = plot.zone || "Residential";
    zoneBadge.className = `badge badge-${plot.zone === 'Commercial' ? 'purple' : plot.zone === 'Industrial' ? 'warning' : 'primary'}`;
    this.container.querySelector("#drawer-val-owner").textContent = plot.owner || "Unregistered Title";

    // 2. Road
    const road = plot.roadAccess || {};
    this.container.querySelector("#drawer-road-name").textContent = road.roadName || "No Designated Road";
    this.container.querySelector("#drawer-road-type").textContent = road.roadType || "-";
    this.container.querySelector("#drawer-road-dist").textContent = road.distanceMeters !== undefined ? `${road.distanceMeters} m` : "-";
    
    const roadStatusBadge = this.container.querySelector("#drawer-road-status");
    roadStatusBadge.textContent = road.status || "Accessible";
    roadStatusBadge.className = `badge ${road.status === 'Direct Frontage' ? 'badge-success' : 'badge-warning'}`;

    // 3. Drainage
    const drain = plot.drainage || {};
    this.container.querySelector("#drawer-drain-id").textContent = drain.drainId || "Drainage Culvert N/A";
    this.container.querySelector("#drawer-drain-type").textContent = drain.type || "-";
    this.container.querySelector("#drawer-drain-dist").textContent = drain.distanceMeters !== undefined ? `${drain.distanceMeters} m` : "-";
    
    const drainStatusBadge = this.container.querySelector("#drawer-drain-status");
    drainStatusBadge.textContent = drain.status || "Connected";
    drainStatusBadge.className = `badge ${drain.status === 'Connected' ? 'badge-success' : 'badge-danger'}`;

    // 4. Electricity Pole
    const ep = plot.electricityPole || {};
    this.container.querySelector("#drawer-pole-id").textContent = ep.poleId || "EP-Unlinked";
    this.container.querySelector("#drawer-pole-volt").textContent = ep.voltage || "440V LT";
    this.container.querySelector("#drawer-pole-dist").textContent = ep.distanceMeters !== undefined ? `${ep.distanceMeters} m` : "-";
    
    const epClearance = this.container.querySelector("#drawer-pole-clearance");
    if (ep.clearanceCompliant === false) {
      epClearance.textContent = "Safety Clearance Hazard (< 5m)";
      epClearance.className = "badge badge-danger";
    } else {
      epClearance.textContent = "Clearance Compliant";
      epClearance.className = "badge badge-success";
    }

    // 5. Light Pole
    const lp = plot.lightPole || {};
    this.container.querySelector("#drawer-light-id").textContent = lp.poleId || "LP-Unlinked";
    this.container.querySelector("#drawer-light-type").textContent = lp.type || "LED";
    this.container.querySelector("#drawer-light-dist").textContent = lp.distanceMeters !== undefined ? `${lp.distanceMeters} m` : "-";
    
    const lpStatus = this.container.querySelector("#drawer-light-status");
    lpStatus.textContent = lp.illuminated ? "Illuminated" : "Dark Spot / Non-Coverage";
    lpStatus.className = `badge ${lp.illuminated ? 'badge-success' : 'badge-warning'}`;

    // 6. Flood Hazard
    const fl = plot.floodRegion || {};
    this.container.querySelector("#drawer-flood-code").textContent = fl.zoneCode || "Zone C";
    
    const flRating = this.container.querySelector("#drawer-flood-rating");
    flRating.textContent = fl.zoneCategory || "Low Risk";
    if (fl.zoneCategory === "High Risk") {
      flRating.className = "badge badge-danger";
    } else if (fl.zoneCategory === "Moderate Risk") {
      flRating.className = "badge badge-warning";
    } else {
      flRating.className = "badge badge-success";
    }

    this.container.querySelector("#drawer-flood-depth").textContent = `${fl.inundationDepthMeters || 0} m`;
    this.container.querySelector("#drawer-flood-advice").textContent = fl.status || "Compliant with standard building elevation code.";

    drawer.classList.add("open");
    backdrop.classList.add("open");
  }

  close() {
    this.currentPlot = null;
    const drawer = this.container.querySelector("#plot-drawer");
    const backdrop = this.container.querySelector("#drawer-backdrop");
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
  }
}
