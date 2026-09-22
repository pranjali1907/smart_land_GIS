/**
 * Smart Land GIS - Land Registry (Attribute Management) View
 */
import { store } from "../store.js";
import { formatArea } from "../spatial-utils.js";
import { toast } from "../components/Toast.js";

export class LandRegistryView {
  constructor(containerId = "view-registry") {
    this.container = document.getElementById(containerId);
    this.searchTerm = "";
    this.filterZone = "all";
    this.filterFlood = "all";
    this.filterStatus = "all";
    this.sortBy = "id";
    this.sortAsc = true;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe("plots:change", () => this.render());
    store.subscribe("dataset:change", () => this.render());
    store.subscribe("search:query", (q) => {
      this.searchTerm = q.toLowerCase();
      this.render();
    });
  }

  render() {
    const rawPlots = store.getPlots();

    // Filter
    let plots = rawPlots.filter(plot => {
      // Search
      if (this.searchTerm) {
        const str = `${plot.id} ${plot.plotNumber} ${plot.surveyNumber || ''} ${plot.owner || ''} ${plot.roadAccess?.roadName || ''} ${plot.zone}`.toLowerCase();
        if (!str.includes(this.searchTerm)) return false;
      }
      // Zone filter
      if (this.filterZone !== "all" && plot.zone !== this.filterZone) return false;
      // Flood filter
      if (this.filterFlood !== "all" && plot.floodRegion?.zoneCategory !== this.filterFlood) return false;
      // Status filter
      if (this.filterStatus !== "all" && plot.status !== this.filterStatus) return false;

      return true;
    });

    // Sort
    plots.sort((a, b) => {
      let valA = a[this.sortBy];
      let valB = b[this.sortBy];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });

    this.container.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px; height: 100%;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a;">Land Registry & Cadastral Attributes</h1>
            <p style="font-size: 13px; color: #64748b;">
              Detailed property registry showing dimensions, area, road frontage, utilities, and flood risks for all parcels.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-sm" id="btn-export-geojson">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export GeoJSON
            </button>
            <button class="btn btn-outline btn-sm" id="btn-export-csv">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Export CSV
            </button>
            <button class="btn btn-primary btn-sm" id="btn-add-plot-reg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add New Plot
            </button>
          </div>
        </div>

        <!-- Table Card -->
        <div class="table-card">
          <!-- Toolbar & Filters -->
          <div class="table-toolbar">
            <div class="table-search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="reg-search-input" class="table-search-input" placeholder="Filter by plot number, survey, owner..." value="${this.searchTerm}">
            </div>

            <div class="table-filters">
              <!-- Zone Filter -->
              <select id="filter-zone" class="filter-select">
                <option value="all" ${this.filterZone === 'all' ? 'selected' : ''}>All Zoning</option>
                <option value="Residential" ${this.filterZone === 'Residential' ? 'selected' : ''}>Residential</option>
                <option value="Commercial" ${this.filterZone === 'Commercial' ? 'selected' : ''}>Commercial</option>
                <option value="Industrial" ${this.filterZone === 'Industrial' ? 'selected' : ''}>Industrial</option>
                <option value="Agricultural" ${this.filterZone === 'Agricultural' ? 'selected' : ''}>Agricultural</option>
                <option value="Mixed-Use" ${this.filterZone === 'Mixed-Use' ? 'selected' : ''}>Mixed-Use</option>
                <option value="Public/Utility" ${this.filterZone === 'Public/Utility' ? 'selected' : ''}>Public / Utility</option>
              </select>

              <!-- Flood Filter -->
              <select id="filter-flood" class="filter-select">
                <option value="all" ${this.filterFlood === 'all' ? 'selected' : ''}>All Flood Risks</option>
                <option value="Low Risk" ${this.filterFlood === 'Low Risk' ? 'selected' : ''}>Zone C (Safe)</option>
                <option value="Moderate Risk" ${this.filterFlood === 'Moderate Risk' ? 'selected' : ''}>Zone B (500-Yr)</option>
                <option value="High Risk" ${this.filterFlood === 'High Risk' ? 'selected' : ''}>Zone A (100-Yr)</option>
              </select>

              <!-- Status Filter -->
              <select id="filter-status" class="filter-select">
                <option value="all" ${this.filterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="Available" ${this.filterStatus === 'Available' ? 'selected' : ''}>Available</option>
                <option value="Allocated" ${this.filterStatus === 'Allocated' ? 'selected' : ''}>Allocated</option>
                <option value="Under Development" ${this.filterStatus === 'Under Development' ? 'selected' : ''}>Under Development</option>
              </select>
            </div>
          </div>

          <!-- Table Content -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="cursor: pointer;" data-sort="plotNumber">Plot ID / Survey</th>
                  <th style="cursor: pointer;" data-sort="zone">Zoning</th>
                  <th style="cursor: pointer;" data-sort="length">Dimensions (L &times; W)</th>
                  <th style="cursor: pointer;" data-sort="area">Area</th>
                  <th>Road Frontage</th>
                  <th>Drainage</th>
                  <th>Electricity Pole</th>
                  <th>Light Pole</th>
                  <th style="cursor: pointer;" data-sort="floodRisk">Flood Hazard</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${plots.length === 0 ? `
                  <tr>
                    <td colspan="11" style="text-align: center; padding: 40px; color: #94a3b8;">
                      No land plots found matching the active search or filters.
                    </td>
                  </tr>
                ` : plots.map(plot => {
                  const areaFmt = formatArea(plot.area);
                  const fr = plot.floodRegion || {};
                  const road = plot.roadAccess || {};
                  const ep = plot.electricityPole || {};
                  const lp = plot.lightPole || {};
                  const drain = plot.drainage || {};

                  return `
                    <tr data-plot-id="${plot.id}">
                      <td>
                        <strong style="color: #0f172a; cursor: pointer;" class="plot-click-name">${plot.plotNumber}</strong><br>
                        <span style="font-size: 11px; color: #64748b;">${plot.surveyNumber || 'N/A'}</span>
                      </td>
                      <td>
                        <span class="badge badge-${plot.zone === 'Commercial' ? 'purple' : plot.zone === 'Industrial' ? 'warning' : 'primary'}">
                          ${plot.zone}
                        </span>
                      </td>
                      <td>
                        <strong>${plot.length}m</strong> &times; <strong>${plot.width}m</strong>
                      </td>
                      <td>
                        <span style="font-weight: 700; color: #2563eb;">${areaFmt.sqMeters}</span><br>
                        <span style="font-size: 11px; color: #64748b;">${areaFmt.acres}</span>
                      </td>
                      <td>
                        <span style="font-weight: 600;">${road.roadName || '-'}</span><br>
                        <span class="badge ${road.status === 'Direct Frontage' ? 'badge-success' : 'badge-secondary'}" style="font-size: 9.5px;">
                          ${road.status || 'Accessible'} (${road.distanceMeters || 0}m)
                        </span>
                      </td>
                      <td>
                        <span style="font-size: 12px;">${drain.type || '-'}</span><br>
                        <span class="badge ${drain.status === 'Connected' ? 'badge-success' : 'badge-danger'}" style="font-size: 9.5px;">
                          ${drain.status || 'Lacks Drain'}
                        </span>
                      </td>
                      <td>
                        <span style="font-weight: 600; font-size: 12px;">${ep.poleId || '-'}</span><br>
                        <span class="badge ${ep.clearanceCompliant !== false ? 'badge-warning' : 'badge-danger'}" style="font-size: 9.5px;">
                          ${ep.voltage || '440V'} (${ep.distanceMeters || 0}m)
                        </span>
                      </td>
                      <td>
                        <span style="font-size: 12px;">${lp.poleId || '-'}</span><br>
                        <span class="badge ${lp.illuminated ? 'badge-success' : 'badge-warning'}" style="font-size: 9.5px;">
                          ${lp.illuminated ? 'Illuminated' : 'Dark Spot'}
                        </span>
                      </td>
                      <td>
                        <span class="badge ${fr.zoneCategory === 'High Risk' ? 'badge-danger' : fr.zoneCategory === 'Moderate Risk' ? 'badge-warning' : 'badge-success'}">
                          ${fr.zoneCode || 'Zone C'} &bull; ${fr.zoneCategory || 'Safe'}
                        </span>
                      </td>
                      <td>
                        <span class="badge ${plot.status === 'Available' ? 'badge-success' : 'badge-secondary'}">
                          ${plot.status || 'Available'}
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 6px; justify-content: flex-end;">
                          <button class="btn btn-outline btn-sm action-view-map" data-id="${plot.id}" title="View on Map">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>
                          </button>
                          <button class="btn btn-outline btn-sm action-edit" data-id="${plot.id}" title="Edit Plot">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          </button>
                          <button class="btn btn-danger-outline btn-sm action-trash" data-id="${plot.id}" title="Move to Trash">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>

          <!-- Pagination / Summary -->
          <div class="table-pagination">
            <span>Showing ${plots.length} of ${rawPlots.length} cadastral plots</span>
            <span>Master Plan: <strong>${store.getActiveDataset().name}</strong></span>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener("input", (e) => {
      if (e.target.id === "reg-search-input") {
        this.searchTerm = e.target.value.trim().toLowerCase();
        this.render();
      }
    });

    this.container.addEventListener("change", (e) => {
      if (e.target.id === "filter-zone") {
        this.filterZone = e.target.value;
        this.render();
      } else if (e.target.id === "filter-flood") {
        this.filterFlood = e.target.value;
        this.render();
      } else if (e.target.id === "filter-status") {
        this.filterStatus = e.target.value;
        this.render();
      }
    });

    this.container.addEventListener("click", (e) => {
      const viewMapBtn = e.target.closest(".action-view-map");
      const editBtn = e.target.closest(".action-edit");
      const trashBtn = e.target.closest(".action-trash");
      const plotNameClick = e.target.closest(".plot-click-name");
      const addPlotBtn = e.target.closest("#btn-add-plot-reg");
      const exportGeoJson = e.target.closest("#btn-export-geojson");
      const exportCsv = e.target.closest("#btn-export-csv");

      if (viewMapBtn || plotNameClick) {
        const plotId = (viewMapBtn || plotNameClick.closest("tr")).dataset.id || (viewMapBtn || plotNameClick.closest("tr")).dataset.plotId;
        const plot = store.getPlotById(plotId);
        if (plot) {
          store.setView("map");
          store.selectPlot(plot.id);
          store.emit("map:flyto", plot);
        }
      } else if (editBtn) {
        const plotId = editBtn.dataset.id;
        const plot = store.getPlotById(plotId);
        if (plot) store.emit("plot:edit", plot);
      } else if (trashBtn) {
        const plotId = trashBtn.dataset.id;
        const plot = store.getPlotById(plotId);
        if (plot) {
          store.moveToTrash(plot.id);
          toast.success(`${plot.plotNumber} moved to Trash.`);
        }
      } else if (addPlotBtn) {
        store.emit("plot:edit", null);
      } else if (exportGeoJson) {
        this.exportGeoJSON();
      } else if (exportCsv) {
        this.exportCSV();
      }
    });
  }

  exportGeoJSON() {
    const plots = store.getPlots();
    const geojson = {
      type: "FeatureCollection",
      features: plots.map(p => ({
        type: "Feature",
        id: p.id,
        properties: {
          plotNumber: p.plotNumber,
          surveyNumber: p.surveyNumber,
          zone: p.zone,
          status: p.status,
          length: p.length,
          width: p.width,
          areaSqM: p.area,
          owner: p.owner,
          roadName: p.roadAccess?.roadName,
          drainageType: p.drainage?.type,
          electricPole: p.electricityPole?.poleId,
          lightPole: p.lightPole?.poleId,
          floodZone: p.floodRegion?.zoneCode
        },
        geometry: {
          type: "Polygon",
          coordinates: [(p.coordinates || []).map(c => [c[1], c[0]])] // GeoJSON is [lon, lat]
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SmartLandGIS_${store.getActiveDataset().id}_export.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported GeoJSON FeatureCollection.");
  }

  exportCSV() {
    const plots = store.getPlots();
    const headers = [
      "Plot ID", "Plot Number", "Survey No", "Zoning", "Status", 
      "Length (m)", "Width (m)", "Area (m2)", "Owner", 
      "Road Name", "Road Access Status", 
      "Drainage Type", "Drainage Status",
      "Electric Pole ID", "Electric Voltage",
      "Light Pole ID", "Illuminated",
      "Flood Zone Code", "Flood Risk Category"
    ];

    const rows = plots.map(p => [
      p.id,
      `"${p.plotNumber || ''}"`,
      `"${p.surveyNumber || ''}"`,
      `"${p.zone || ''}"`,
      `"${p.status || ''}"`,
      p.length || 0,
      p.width || 0,
      p.area || 0,
      `"${p.owner || ''}"`,
      `"${p.roadAccess?.roadName || ''}"`,
      `"${p.roadAccess?.status || ''}"`,
      `"${p.drainage?.type || ''}"`,
      `"${p.drainage?.status || ''}"`,
      `"${p.electricityPole?.poleId || ''}"`,
      `"${p.electricityPole?.voltage || ''}"`,
      `"${p.lightPole?.poleId || ''}"`,
      p.lightPole?.illuminated ? "Yes" : "No",
      `"${p.floodRegion?.zoneCode || ''}"`,
      `"${p.floodRegion?.zoneCategory || ''}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SmartLandGIS_Cadastral_Registry.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV spreadsheet.");
  }
}
