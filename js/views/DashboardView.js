/**
 * Smart Land GIS - Dashboard View Component
 */
import { store } from "../store.js";
import { formatArea } from "../spatial-utils.js";
import { APP_CONFIG } from "../config.js";

export class DashboardView {
  constructor(containerId = "view-dashboard") {
    this.container = document.getElementById(containerId);
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe("plots:change", () => this.render());
    store.subscribe("dataset:change", () => this.render());
  }

  render() {
    const dataset = store.getActiveDataset();
    const plots = store.getPlots();

    // 1. Compute Analytics
    let totalArea = 0;
    let highFloodRiskCount = 0;
    let fullyServicedCount = 0;
    const zoningCounts = {};
    const floodCounts = { "High Risk": 0, "Moderate Risk": 0, "Low Risk": 0 };
    const attentionList = [];

    plots.forEach(plot => {
      totalArea += plot.area || 0;

      // Zoning
      const z = plot.zone || "Residential";
      zoningCounts[z] = (zoningCounts[z] || 0) + 1;

      // Flood
      const fr = plot.floodRegion?.zoneCategory || "Low Risk";
      floodCounts[fr] = (floodCounts[fr] || 0) + 1;
      if (fr === "High Risk") highFloodRiskCount++;

      // Infrastructure Utility Readiness
      const hasRoad = plot.roadAccess?.status === "Direct Frontage";
      const hasDrain = plot.drainage?.status === "Connected";
      const hasSafePower = plot.electricityPole?.clearanceCompliant !== false;
      const hasLight = plot.lightPole?.illuminated === true;

      if (hasRoad && hasDrain && hasSafePower && hasLight) {
        fullyServicedCount++;
      }

      // Identify Attention Needs
      if (fr === "High Risk") {
        attentionList.push({
          plot,
          issue: "Severe Inundation Hazard (Zone A Floodplain)",
          type: "danger"
        });
      } else if (!hasSafePower) {
        attentionList.push({
          plot,
          issue: "High-Tension Electrical Clearance Hazard (< 5m)",
          type: "danger"
        });
      } else if (!hasDrain) {
        attentionList.push({
          plot,
          issue: "Lacks Stormwater Drainage Outfall Connection",
          type: "warning"
        });
      } else if (!hasRoad) {
        attentionList.push({
          plot,
          issue: "No Direct Road Access Frontage",
          type: "warning"
        });
      }
    });

    const totalPlots = plots.length || 1;
    const totalAreaFmt = formatArea(totalArea);
    const utilityCoveragePct = Math.round((fullyServicedCount / totalPlots) * 100);
    const floodVulnerablePct = Math.round((highFloodRiskCount / totalPlots) * 100);

    this.container.innerHTML = `
      <div class="dashboard-view">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="dashboard-title-group">
            <h1 class="dashboard-title">Land Infrastructure Analytics</h1>
            <p class="dashboard-subtitle">
              Comprehensive spatial intelligence, zoning breakdown, utility coverage, and hydrological hazard monitoring.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary btn-sm" id="dash-btn-map">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>
              View on GIS Map
            </button>
            <button class="btn btn-primary btn-sm" id="dash-btn-add">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Register Plot
            </button>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="stats-grid">
          <!-- Card 1: Total Plots -->
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">Total Cadastral Plots</span>
              <span class="stat-value">${plots.length}</span>
              <span class="stat-sub">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                ${dataset.roads.length} Arterial & Access Roads
              </span>
            </div>
            <div class="stat-icon-wrapper stat-icon-primary">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
          </div>

          <!-- Card 2: Total Land Area -->
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">Total Land Area</span>
              <span class="stat-value">${totalAreaFmt.acres.split(' ')[0]} <small style="font-size: 15px; font-weight: 500;">Acres</small></span>
              <span class="stat-sub">
                <strong style="color: #2563eb;">${totalAreaFmt.sqMeters}</strong>
              </span>
            </div>
            <div class="stat-icon-wrapper stat-icon-success">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
          </div>

          <!-- Card 3: Flood Vulnerability -->
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">Flood Vulnerable Plots</span>
              <span class="stat-value" style="color: #ef4444;">${highFloodRiskCount}</span>
              <span class="stat-sub">
                <span class="badge badge-danger">${floodVulnerablePct}% in Zone A</span>
              </span>
            </div>
            <div class="stat-icon-wrapper stat-icon-danger">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>

          <!-- Card 4: Utility Readiness Index -->
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">Full Utility Grid Index</span>
              <span class="stat-value" style="color: #10b981;">${utilityCoveragePct}%</span>
              <span class="stat-sub">
                Road, Drain, Power & Light Ready
              </span>
            </div>
            <div class="stat-icon-wrapper stat-icon-warning">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Analytics Row 1: Charts & Attention List -->
        <div class="analytics-grid">
          <!-- Col 1: Land Use / Zoning Distribution -->
          <div class="analytics-card analytics-col-6">
            <div class="analytics-card-header">
              <h3 class="analytics-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                Zoning & Land Classification Breakdown
              </h3>
            </div>
            <div class="analytics-card-body">
              <div class="chart-bar-list">
                ${Object.entries(zoningCounts).map(([zone, count]) => {
                  const pct = Math.round((count / plots.length) * 100);
                  const color = APP_CONFIG.zoningColors[zone]?.color || "#3b82f6";
                  return `
                    <div class="chart-bar-item">
                      <div class="chart-bar-header">
                        <span>${zone}</span>
                        <span style="color: #64748b;">${count} plots (${pct}%)</span>
                      </div>
                      <div class="chart-bar-track">
                        <div class="chart-bar-fill" style="width: ${pct}%; background: ${color};"></div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>

          <!-- Col 2: Flood Hazard Vulnerability -->
          <div class="analytics-card analytics-col-6">
            <div class="analytics-card-header">
              <h3 class="analytics-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                Hydrological Flood Risk Classification
              </h3>
            </div>
            <div class="analytics-card-body">
              <div class="chart-bar-list">
                <div class="chart-bar-item">
                  <div class="chart-bar-header">
                    <span style="color: #ef4444;">High Risk (Zone A - 100-Year Inundation)</span>
                    <span>${floodCounts["High Risk"]} plots</span>
                  </div>
                  <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="width: ${(floodCounts["High Risk"] / plots.length) * 100}%; background: #ef4444;"></div>
                  </div>
                </div>

                <div class="chart-bar-item">
                  <div class="chart-bar-header">
                    <span style="color: #f59e0b;">Moderate Risk (Zone B - 500-Year Buffer)</span>
                    <span>${floodCounts["Moderate Risk"]} plots</span>
                  </div>
                  <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="width: ${(floodCounts["Moderate Risk"] / plots.length) * 100}%; background: #f59e0b;"></div>
                  </div>
                </div>

                <div class="chart-bar-item">
                  <div class="chart-bar-header">
                    <span style="color: #10b981;">Low Risk (Zone C - Minimal Hazard)</span>
                    <span>${floodCounts["Low Risk"]} plots</span>
                  </div>
                  <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="width: ${(floodCounts["Low Risk"] / plots.length) * 100}%; background: #10b981;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Col 3: Plots Needing Immediate Attention -->
          <div class="analytics-card analytics-col-8">
            <div class="analytics-card-header">
              <h3 class="analytics-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Plots Needing Infrastructure or Safety Attention (${attentionList.length})
              </h3>
            </div>
            <div class="analytics-card-body" style="gap: 10px;">
              ${attentionList.length === 0 ? `
                <div style="padding: 24px; text-align: center; color: #10b981; font-weight: 600;">
                  ✓ All registered plots meet standard road, drainage, and clearance requirements.
                </div>
              ` : attentionList.slice(0, 4).map(item => `
                <div class="attention-item" data-plot-id="${item.plot.id}" style="cursor: pointer;">
                  <div class="attention-left">
                    <div class="attention-badge-icon" style="background: ${item.type === 'danger' ? '#fee2e2' : '#fef3c7'}; color: ${item.type === 'danger' ? '#ef4444' : '#b45309'};">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div class="attention-details">
                      <span class="attention-name">${item.plot.plotNumber} &bull; ${item.plot.zone} (${item.plot.area} m²)</span>
                      <span class="attention-reason">${item.issue}</span>
                    </div>
                  </div>
                  <button class="btn btn-outline btn-sm">Inspect</button>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Col 4: Infrastructure Asset Counts -->
          <div class="analytics-card analytics-col-4">
            <div class="analytics-card-header">
              <h3 class="analytics-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                Physical Asset Density
              </h3>
            </div>
            <div class="analytics-card-body" style="gap: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #475569; font-weight: 500;">Road Network</span>
                <span style="font-weight: 700;">${dataset.roads.length} Lines (${dataset.roads.reduce((a, r) => a + r.widthMeters, 0)}m width)</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #475569; font-weight: 500;">Drainage Network</span>
                <span style="font-weight: 700;">${dataset.drainage.length} Channels</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #475569; font-weight: 500;">Electricity Poles</span>
                <span style="font-weight: 700;">${dataset.electricityPoles.length} Poles (HT/LT)</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #475569; font-weight: 500;">Street Light Poles</span>
                <span style="font-weight: 700;">${dataset.lightPoles.length} Luminaires</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #475569; font-weight: 500;">Flood Hazard Polygons</span>
                <span style="font-weight: 700; color: #ef4444;">${dataset.floodRegions.length} Risk Zones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const mapBtn = e.target.closest("#dash-btn-map");
      const addBtn = e.target.closest("#dash-btn-add");
      const attentionRow = e.target.closest(".attention-item");

      if (mapBtn) {
        store.setView("map");
      } else if (addBtn) {
        store.emit("plot:edit", null);
      } else if (attentionRow) {
        const plotId = attentionRow.dataset.plotId;
        const plot = store.getPlotById(plotId);
        if (plot) {
          store.selectPlot(plot.id);
        }
      }
    });
  }
}
